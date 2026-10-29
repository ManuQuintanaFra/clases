import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const MAX_PORTADA_BYTES = 5 * 1024 * 1024;

@Injectable()
export class PortadasService {
  private readonly logger = new Logger(PortadasService.name);

  async normalizar(archivo?: Express.Multer.File): Promise<Buffer> {
    // Multer entrega el archivo en memoria: buffer contiene sus bytes.
    // El ? permite recibir undefined; ?. evita acceder a propiedades inexistentes.
    // Rechazamos archivos ausentes, vacíos o de más de 5 MiB (5 * 1024 * 1024).
    if (!archivo?.buffer?.length || archivo.buffer.length > MAX_PORTADA_BYTES)
      throw new BadRequestException('Se requiere una portada de hasta 5 MB');
    const b = archivo.buffer;
    // No confiar en extensión, nombre ni Content-Type enviados por el cliente.
    // Revisamos la firma binaria: bytes característicos al inicio del archivo.
    // 0xff y 0xd8 son números escritos en hexadecimal; b[0] es el primer byte.
    const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    // PNG tiene una firma de ocho bytes. subarray toma ese tramo y equals
    // compara su contenido con la secuencia esperada.
    const png = b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    // WebP usa las marcas de texto RIFF y WEBP en posiciones específicas.
    const webp =
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP';
    // Si no coincide con ninguno de los tres formatos permitidos, devuelve 400.
    // La firma sola no prueba que sea una imagen válida: falta decodificarla.
    if (!jpeg && !png && !webp)
      throw new BadRequestException(
        'Solo se admiten imágenes JPEG, PNG o WebP',
      );
    try {
      // Sharp prepara la lectura de la imagen desde sus bytes.
      // El límite de píxeles controla ancho * alto: un archivo pequeño en bytes
      // puede necesitar mucha memoria cuando se descomprime.
      const imagen = sharp(b, {
        limitInputPixels: 20_000_000,
        // Rechaza también advertencias del decodificador sobre datos dañados.
        failOn: 'warning',
      });
      // Lee información como formato, dimensiones y cantidad de páginas/cuadros.
      const metadata = await imagen.metadata();
      // ?? usa 1 si pages es null o undefined. Rechazamos múltiples cuadros.
      if ((metadata.pages ?? 1) > 1) throw new Error('Imagen animada');
      // Genera una nueva imagen a partir de los píxeles, sin copiar los bytes
      // originales ni conservar sus metadatos. No equivale a un antivirus.
      // El await permite que este catch capture también fallos de toBuffer().
      return await imagen
        // Sin argumentos, corrige la orientación según los metadatos EXIF.
        .rotate()
        // Entra en 1600 x 1600 conservando proporciones, sin recortar ni agrandar.
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        // Unifica la salida a WebP con calidad 82 sobre 100.
        .webp({ quality: 82 })
        // Limita el tiempo de procesamiento de Sharp; no el de subida a la nube.
        .timeout({ seconds: 10 })
        // Ejecuta la conversión y devuelve los nuevos bytes para subir().
        .toBuffer();
    } catch {
      // Convierte errores de lectura o conversión en una respuesta HTTP 400,
      // sin exponer al cliente detalles internos de Sharp.
      throw new BadRequestException(
        'Imagen inválida, animada o demasiado grande (máximo 20 megapíxeles)',
      );
    }
  }

  private opciones() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)
      throw new ServiceUnavailableException(
        'Falta configurar Cloudinary en el servidor',
      );
    return {
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    };
  }

  async subir(buffer: Buffer): Promise<{ url: string; publicId: string }> {
    // Recibe los bytes del WebP ya validado y convertido por normalizar().
    // Lee las credenciales del servidor; nunca se reciben desde el cliente.
    const opciones = this.opciones();
    // upload_stream informa el resultado mediante un callback. La Promise
    // permite que LibrosService espere la subida con await.
    return new Promise((resolve, reject) => {
      // Crea un stream de escritura para enviar la imagen desde memoria,
      // sin tener que guardar un archivo temporal en el disco.
      const stream = cloudinary.uploader.upload_stream(
        {
          ...opciones,
          // Solo aceptamos imágenes WebP, el formato generado por normalizar().
          resource_type: 'image',
          allowed_formats: ['webp'],
          // Genera el identificador en el servidor, sin usar el nombre del archivo.
          public_id: `libros/portadas/${randomUUID()}`,
          // Evita reemplazar un recurso existente con el mismo identificador.
          overwrite: false,
          // Timeout de la petición a Cloudinary, expresado en milisegundos.
          timeout: 30000,
        },
        (error, resultado) => {
          // Si Cloudinary falla, reject hace que el await del servicio falle.
          // Devolvemos HTTP 502 sin exponer detalles internos del proveedor.
          if (error || !resultado)
            return reject(
              new BadGatewayException('No se pudo subir la portada'),
            );
          // La URL HTTPS sirve para mostrar la imagen; publicId permite borrarla.
          resolve({ url: resultado.secure_url, publicId: resultado.public_id });
        },
      );
      // También captura errores emitidos por el stream durante el envío.
      stream.on('error', () =>
        reject(new BadGatewayException('No se pudo subir la portada')),
      );
      // Escribe los bytes y cierra la entrada del stream. El resultado de la
      // subida se confirma después, cuando Cloudinary ejecuta el callback.
      stream.end(buffer);
    });
  }

  async eliminar(publicId?: string): Promise<void> {
    if (!publicId) return;
    try {
      const resultado = (await cloudinary.uploader.destroy(publicId, {
        ...this.opciones(),
        resource_type: 'image',
        invalidate: true,
      })) as { result: string };
      if (!['ok', 'not found'].includes(resultado.result))
        throw new Error('No eliminado');
    } catch {
      this.logger.warn(`Pendiente de limpieza en Cloudinary: ${publicId}`);
    }
  }
}
