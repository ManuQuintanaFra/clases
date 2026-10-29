import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibroMongo, LibroSchema } from './libro.schema';
import { LibrosController } from './libros.controller';
import { LibrosService } from './libros.service';
import { PortadasService } from './portadas.service';
import { PortadasInterceptor } from './portadas.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LibroMongo.name, schema: LibroSchema }]),
  ],
  controllers: [LibrosController],
  providers: [LibrosService, PortadasService, PortadasInterceptor],
})
export class LibrosModule {}
