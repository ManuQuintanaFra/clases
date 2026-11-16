import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritosService } from './favoritos.service';
import { CrearFavoritoDto, NotaDto } from './favorito.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  listar(@UsuarioActual('sub') userId: string) {
    return this.favoritos.listar(userId);
  }

  @Post()
  crear(@UsuarioActual('sub') userId: string, @Body() datos: CrearFavoritoDto) {
    return this.favoritos.crear(userId, datos);
  }

  @Patch(':id')
  actualizar(
    @UsuarioActual('sub') userId: string,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() datos: NotaDto,
  ) {
    return this.favoritos.actualizar(userId, id, datos.nota);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(
    @UsuarioActual('sub') userId: string,
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    return this.favoritos.eliminar(userId, id);
  }
}
