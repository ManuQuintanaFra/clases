import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CrearLibroDto } from './dto/crear-libro.dto';
import { ActualizarLibroDto } from './dto/actualizar-libro.dto';
import { LibrosService } from './libros.service';

// El controlador conecta las peticiones HTTP con el servicio.
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  crear(@Body() datos: CrearLibroDto) {
    return this.librosService.crear(datos);
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
