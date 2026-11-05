import { Transform } from 'class-transformer';
import {
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class CrearLibroDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/\S/)
  titulo!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/\S/)
  autor!: string;

  @IsString()
  @Matches(/\S/)
  genero!: string;

  @ValidateIf((_obj, valor) => valor !== undefined)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  portada_url!: string;

  // Multipart envía números como texto; no convertir vacíos, arrays ni null.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  )
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  aniopublicacion!: number;

  // Multipart envía números como texto; no convertir vacíos, arrays ni null.
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  )
  @IsInt()
  @Min(0)
  @Max(99)
  ejemplares_restantes!: number;
}
