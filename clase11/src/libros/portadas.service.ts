import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';

export const MAX_PORTADA_BYTES = 5 * 1024 * 1024;

@Injectable()
export class PortadasService {
  private readonly logger = new Logger(PortadasService.name);

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
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
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
