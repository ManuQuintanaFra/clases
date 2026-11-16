import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CredencialesDto } from './credenciales.dto';

export class RegistroDto extends CredencialesDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido?: string;
}
