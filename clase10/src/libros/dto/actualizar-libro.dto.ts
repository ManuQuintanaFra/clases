import { ValidateIf } from 'class-validator';
import { CrearLibroDto } from './crear-libro.dto';

// Hereda las validaciones; PATCH solo valida los campos enviados.
export class ActualizarLibroDto extends CrearLibroDto {
  @ValidateIf((_obj, valor) => valor !== undefined)
  declare titulo: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  declare autor: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  declare genero: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  declare portada_url: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  declare aniopublicacion: number;

  @ValidateIf((_obj, valor) => valor !== undefined)
  declare ejemplares_restantes: number;
}
