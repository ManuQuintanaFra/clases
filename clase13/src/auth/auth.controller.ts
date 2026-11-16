import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegistroDto } from './registro.dto';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { AuthService } from './auth.service';
import { CredencialesDto } from './credenciales.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 10 } })
  registrar(@Body() datos: RegistroDto) {
    return this.auth.registrar(datos);
  }

  @Post('login')
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 10 } })
  @HttpCode(200)
  login(@Body() datos: CredencialesDto) {
    return this.auth.login(datos);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  perfil(@UsuarioActual('sub') userId: string) {
    return this.auth.perfil(userId);
  }
}
