import {
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsUrl,
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

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  portada_url!: string;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  aniopublicacion!: number;

  @IsInt()
  @Min(0)
  @Max(99)
  ejemplares_restantes!: number;
}
