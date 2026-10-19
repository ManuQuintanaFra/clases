import { Module } from '@nestjs/common';
import { LibrosController } from './libros.controller';
import { LibrosService } from './libros.service';

@Module({
  controllers: [LibrosController],
  providers: [LibrosService],
})
export class LibrosModule {}
