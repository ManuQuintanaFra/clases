import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibroMongo, LibroSchema } from './libro.schema';
import { LibrosController } from './libros.controller';
import { LibrosService } from './libros.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LibroMongo.name, schema: LibroSchema }]),
  ],
  controllers: [LibrosController],
  providers: [LibrosService],
})
export class LibrosModule {}
