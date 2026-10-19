import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import type { ActualizarLibroDto, CrearLibroDto } from './libro';
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
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.buscar(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarLibroDto,
  ) {
    return this.librosService.actualizar(id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    this.librosService.eliminar(id);
  }
}
