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
import { Transform } from 'class-transformer'

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

 @Transform(({value}: {value : unknown})=>  //"4" -> 4
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  )

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  aniopublicacion!: number;


  @Transform(({value}: {value : unknown})=>  //"4" -> 4
    typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value,
  )
  @IsInt()
  @Min(0)
  @Max(99)
  ejemplares_restantes!: number;
}
