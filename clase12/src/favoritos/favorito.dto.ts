import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class NotaDto {
  @IsString()
  @MaxLength(1000)
  nota!: string;
}

export class CrearFavoritoDto extends NotaDto {
  @IsMongoId()
  book_id!: string;
}
