import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActualizarLibroDto, CrearLibroDto, Libro } from './libro';

@Injectable()
export class LibrosService {
  // Diccionario en memoria: la clave es el ID y el valor es el libro.
  // Al reiniciar el servidor, todos los libros se pierden.
  private readonly libros: Record<number, Libro> = {};
  private siguienteId = 1;

  crear(datos: CrearLibroDto): Libro {
    this.validar(datos, true);
    const libro: Libro = {
      id: this.siguienteId++,
      titulo: datos.titulo.trim(),
      autor: datos.autor.trim(),
    };
    this.libros[libro.id] = libro;
    return libro;
  }

  listar(): Libro[] {
    return Object.values(this.libros);
  }

  buscar(id: number): Libro {
    const libro = this.libros[id];
    if (!libro) {
      throw new NotFoundException(`No existe el libro con ID ${id}`);
    }
    return libro;
  }

  actualizar(id: number, datos: ActualizarLibroDto): Libro {
    const libro = this.buscar(id);
    this.validar(datos, false);
    // Solo actualizamos campos permitidos; el ID no se modifica.
    if (datos.titulo !== undefined) libro.titulo = datos.titulo.trim();
    if (datos.autor !== undefined) libro.autor = datos.autor.trim();
    return libro;
  }

  eliminar(id: number): void {
    this.buscar(id);
    delete this.libros[id];
  }

  // Los tipos de TypeScript no validan el JSON recibido en tiempo de ejecución.
  private validar(datos: ActualizarLibroDto, crear: boolean): void {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON');
    }
    const campos = Object.keys(datos);
    if (campos.some((campo) => campo !== 'titulo' && campo !== 'autor')) {
      throw new BadRequestException('Solo se permiten titulo y autor');
    }
    if (!crear && campos.length === 0) {
      throw new BadRequestException('Enviá al menos titulo o autor');
    }
    for (const campo of ['titulo', 'autor'] as const) {
      const valor = datos[campo];
      if (crear || valor !== undefined) {
        if (typeof valor !== 'string' || valor.trim().length === 0) {
          throw new BadRequestException(`${campo} debe ser un texto no vacío`);
        }
      }
    }
  }
}
