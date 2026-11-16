import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { Favorito } from './favorito.schema';
import { CrearFavoritoDto } from './favorito.dto';
import { LibrosService } from '../libros/libros.service';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectModel(Favorito.name) private readonly favoritos: Model<Favorito>,
    private readonly libros: LibrosService,
  ) {}

  async listar(user_id: string) {
    const favoritos = await this.favoritos
      .find({ user_id })
      .sort({ createdAt: -1 })
      .exec();
    const libros = new Map(
      (await this.libros.listar()).map((libro) => [libro.id, libro]),
    );
    return favoritos.map((favorito) => ({
      id: favorito.id as string,
      user_id,
      book_id: favorito.book_id,
      nota: favorito.nota,
      libros: libros.get(favorito.book_id) ?? null,
    }));
  }

  async crear(user_id: string, datos: CrearFavoritoDto) {
    const libro = await this.libros.buscar(datos.book_id);
    try {
      const favorito = await this.favoritos.create({ user_id, ...datos });
      return { id: favorito.id as string, user_id, ...datos, libros: libro };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('El libro ya está en favoritos');
      }
      throw error;
    }
  }

  async actualizar(user_id: string, id: string, nota: string) {
    this.validarId(id);
    const favorito = await this.favoritos
      .findOneAndUpdate(
        { _id: id, user_id },
        { $set: { nota } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!favorito) throw new NotFoundException('No existe el favorito');
    return { id, user_id, book_id: favorito.book_id, nota };
  }

  async eliminar(user_id: string, id: string) {
    this.validarId(id);
    const favorito = await this.favoritos
      .findOneAndDelete({ _id: id, user_id })
      .exec();
    if (!favorito) throw new NotFoundException('No existe el favorito');
  }

  private validarId(id: string) {
    if (!isObjectIdOrHexString(id))
      throw new BadRequestException('ID de favorito inválido');
  }
}
