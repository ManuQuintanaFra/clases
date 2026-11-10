import sharp from 'sharp';
import { PortadaPipe } from './portada.pipe';

describe('PortadaPipe', () => {
  const pipe = new PortadaPipe();
  const archivo = (originalname: string, buffer: Buffer) =>
    ({ originalname, buffer, mimetype: 'image/jpeg' }) as Express.Multer.File;

  it.each(['jpeg', 'png', 'webp'] as const)(
    'acepta %s según su firma',
    async (tipo) => {
      const buffer = await sharp({
        create: { width: 10, height: 10, channels: 3, background: 'red' },
      })
        .toFormat(tipo)
        .toBuffer();
      const portada = archivo('foto.' + tipo.toUpperCase(), buffer);
      await expect(pipe.transform(portada)).resolves.toBe(portada);
      await expect(
        pipe.transform(archivo('foto.gif', buffer)),
      ).rejects.toThrow();
      if (tipo === 'jpeg')
        await expect(
          pipe.transform(archivo('foto.jpg', buffer)),
        ).resolves.toBeDefined();
      else
        await expect(
          pipe.transform(archivo('foto.jpg', buffer)),
        ).rejects.toThrow();
    },
  );

  it('rechaza contenido sin firma aunque declare ser JPEG', async () => {
    await expect(
      pipe.transform(archivo('foto.jpg', Buffer.from('<svg/>'))),
    ).rejects.toThrow();
  });
});
