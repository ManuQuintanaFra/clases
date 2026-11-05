import sharp from 'sharp';
import { PortadasService, MAX_PORTADA_BYTES } from './portadas.service';

describe('Validación de portadas', () => {
  const servicio = new PortadasService();
  const archivo = (buffer: Buffer) =>
    ({
      buffer,
      originalname: 'portada.jpg',
      mimetype: 'image/jpeg',
    }) as Express.Multer.File;

  it('rechaza contenido falsificado aunque declare ser JPEG', async () => {
    for (const contenido of [
      '<svg onload="alert(1)"></svg>',
      '%PDF-1.7',
      '<script>alert(1)</script>',
    ])
      await expect(
        servicio.normalizar(archivo(Buffer.from(contenido))),
      ).rejects.toThrow();
    await expect(
      servicio.normalizar(archivo(Buffer.from([255, 216, 255, 0]))),
    ).rejects.toThrow();
  });
  it('rechaza ausencia, archivos vacíos y exceso de bytes', async () => {
    await expect(servicio.normalizar()).rejects.toThrow();
    await expect(
      servicio.normalizar(archivo(Buffer.alloc(0))),
    ).rejects.toThrow();
    await expect(
      servicio.normalizar(archivo(Buffer.alloc(MAX_PORTADA_BYTES + 1))),
    ).rejects.toThrow();
  });
  it('rechaza imágenes que exceden el límite de píxeles', async () => {
    const grande = await sharp({
      create: { width: 5000, height: 4001, channels: 3, background: 'white' },
    })
      .png()
      .toBuffer();
    await expect(servicio.normalizar(archivo(grande))).rejects.toThrow();
  });
  it.each(['jpeg', 'png', 'webp'] as const)(
    'recodifica %s y elimina metadatos y contenido agregado',
    async (formato) => {
      const entrada = await sharp({
        create: { width: 1800, height: 900, channels: 3, background: 'red' },
      })
        .withMetadata()
        .toFormat(formato)
        .toBuffer();
      const salida = await servicio.normalizar(
        archivo(
          Buffer.concat([entrada, Buffer.from('<script>maligno</script>')]),
        ),
      );
      const metadata = await sharp(salida).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(1600);
      expect(metadata.exif).toBeUndefined();
      expect(salida.includes(Buffer.from('<script>'))).toBe(false);
    },
  );
});
