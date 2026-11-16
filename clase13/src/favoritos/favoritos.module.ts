import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibrosModule } from '../libros/libros.module';
import { Favorito, FavoritoSchema } from './favorito.schema';
import { FavoritosController } from './favoritos.controller';
import { FavoritosService } from './favoritos.service';

@Module({
  imports: [
    LibrosModule,
    MongooseModule.forFeature([
      { name: Favorito.name, schema: FavoritoSchema },
    ]),
  ],
  controllers: [FavoritosController],
  providers: [FavoritosService],
})
export class FavoritosModule {}
