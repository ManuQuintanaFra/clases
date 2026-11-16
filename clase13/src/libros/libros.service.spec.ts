import { Model } from 'mongoose';
import { LibrosService } from './libros.service';
import { LibroMongo } from './libro.schema';
import { PortadasService } from './portadas.service';
import { CrearLibroDto } from './dto/crear-libro.dto';

describe('Creación con portada', () => {
  it('borra la subida si falla la creación del libro', async () => {
    const modelo = {
      create: jest.fn().mockRejectedValue(new Error('Mongo no disponible')),
    };
    const portadas = {
      normalizar: jest.fn().mockResolvedValue(Buffer.from('webp')),
      subir: jest.fn().mockResolvedValue({
        url: 'https://example.com/nueva.webp',
        publicId: 'nueva',
      }),
      eliminar: jest.fn().mockResolvedValue(undefined),
    };
    const servicio = new LibrosService(
      modelo as unknown as Model<LibroMongo>,
      portadas as unknown as PortadasService,
    );
    await expect(
      servicio.crear(
        { titulo: 'Libro' } as CrearLibroDto,
        { buffer: Buffer.from('imagen') } as Express.Multer.File,
      ),
    ).rejects.toThrow('Mongo no disponible');
    expect(portadas.eliminar).toHaveBeenCalledWith('nueva');
  });
});
