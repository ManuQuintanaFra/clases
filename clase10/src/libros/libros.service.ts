import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { LibroMongo } from './libro.schema';
import type { LibroDocument } from './libro.schema';
import type { Libro } from './libro';

@Injectable()
export class LibrosService {
  constructor(
    @InjectModel(LibroMongo.name) private readonly modelo: Model<LibroMongo>,
  ) {}

  async crear(datos: CrearLibroDto): Promise<Libro> {
    const dto = await this.validar(datos, CrearLibroDto);
    return this.presentar(await this.modelo.create(dto));
  }

  async listar(): Promise<Libro[]> {
    const libros = await this.modelo.find().sort({ titulo: 1 }).exec();
    return libros.map((libro) => this.presentar(libro));
  }

  async buscar(id: string): Promise<Libro> {
    this.validarId(id);
    const libro = await this.modelo.findById(id).exec();
    if (!libro) throw new NotFoundException('No existe el libro');
    return this.presentar(libro);
  }

  async actualizar(id: string, datos: ActualizarLibroDto): Promise<Libro> {
    this.validarId(id);
    const dto = await this.validar(datos, ActualizarLibroDto);
    // Los campos ausentes del DTO no deben sobrescribir los datos guardados.
    const cambios = Object.fromEntries(
      Object.entries(dto).filter(([, valor]) => valor !== undefined),
    );
    const libro = await this.modelo
      .findByIdAndUpdate(
        id,
        { $set: cambios },
        { new: true, runValidators: true },
      )
      .exec();
    if (!libro) throw new NotFoundException('No existe el libro');
    return this.presentar(libro);
  }

  async eliminar(id: string): Promise<void> {
    this.validarId(id);
    const libro = await this.modelo.findByIdAndDelete(id).exec();
    if (!libro) throw new NotFoundException('No existe el libro');
  }

  async reservar(id: string): Promise<Libro> {
    this.validarId(id);
    // Actualización atómica: dos reservas no pueden dejar stock negativo.
    const libro = await this.modelo
      .findOneAndUpdate(
        { _id: id, ejemplares_restantes: { $gt: 0 } },
        { $inc: { ejemplares_restantes: -1 } },
        { new: true },
      )
      .exec();
    if (!libro) {
      await this.buscar(id);
      throw new BadRequestException('No quedan ejemplares disponibles');
    }
    return this.presentar(libro);
  }

  private validarId(id: string): void {
    if (!isObjectIdOrHexString(id))
      throw new BadRequestException('ID de libro inválido');
  }

  // class-validator se ejecuta explícitamente en el servicio, sin pipes.
  private async validar<T extends CrearLibroDto>(
    datos: unknown,
    clase: new () => T,
  ): Promise<T> {
    if (
      !datos ||
      typeof datos !== 'object' ||
      Array.isArray(datos) ||
      Object.keys(datos).length === 0
    ) {
      throw new BadRequestException(
        'Enviá un objeto JSON con los datos del libro',
      );
    }
    const dto = plainToInstance(clase, datos);
    const errores = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errores.length) {
      throw new BadRequestException(
        errores.flatMap((error) => Object.values(error.constraints ?? {})),
      );
    }
    return dto;
  }

  private presentar(libro: LibroDocument): Libro {
    return {
      id: libro._id.toString(),
      titulo: libro.titulo,
      autor: libro.autor,
      portada_url: libro.portada_url,
      genero: libro.genero,
      aniopublicacion: libro.aniopublicacion,
      ejemplares_restantes: libro.ejemplares_restantes,
      disponible: libro.ejemplares_restantes > 0,
    };
  }
}
