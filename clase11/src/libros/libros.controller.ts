import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MAX_PORTADA_BYTES } from './portadas.service';
import { PortadasInterceptor } from './portadas.interceptor';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { LibrosService } from './libros.service';

// El controlador conecta las peticiones HTTP con el servicio.
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  @UseInterceptors(
    PortadasInterceptor,
    FileInterceptor('portada', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_PORTADA_BYTES,
        files: 1,
        fields: 6,
        parts: 8,
        fieldSize: 4096,
        fieldNameSize: 100,
      },
    }),
  )
  crear(
    @Body() datos: CrearLibroDto,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    return this.librosService.crear(datos, archivo);
  }

  @Get()
  listar() {
    return this.librosService.listar();
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.librosService.buscar(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() datos: ActualizarLibroDto) {
    return this.librosService.actualizar(id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string) {
    return this.librosService.eliminar(id);
  }

  @Post(':id/reservar')
  @HttpCode(200)
  reservar(@Param('id') id: string) {
    return this.librosService.reservar(id);
  }
}
