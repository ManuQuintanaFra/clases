import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { FavoritosService } from './favoritos.service';
import { CrearFavoritoDto, NotaDto } from './favorito.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type Autenticada = Request & { user: { sub: string } };

@Controller('favoritos')
@UseGuards(JwtAuthGuard)
export class FavoritosController {
  constructor(private readonly favoritos: FavoritosService) {}

  @Get()
  listar(@Req() req: Autenticada) {
    return this.favoritos.listar(req.user.sub);
  }

  @Post()
  crear(@Req() req: Autenticada, @Body() datos: CrearFavoritoDto) {
    return this.favoritos.crear(req.user.sub, datos);
  }

  @Patch(':id')
  actualizar(
    @Req() req: Autenticada,
    @Param('id') id: string,
    @Body() datos: NotaDto,
  ) {
    return this.favoritos.actualizar(req.user.sub, id, datos.nota);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Req() req: Autenticada, @Param('id') id: string) {
    return this.favoritos.eliminar(req.user.sub, id);
  }
}
