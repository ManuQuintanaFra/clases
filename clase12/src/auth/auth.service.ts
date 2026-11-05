import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, mongo } from 'mongoose';
import { Usuario } from './usuario.schema';
import { CredencialesDto } from './credenciales.dto';
import { RegistroDto } from './registro.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async registrar(datos: RegistroDto) {
    try {
      const usuario = await this.usuarios.create({
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        passwordHash: await bcrypt.hash(datos.password, 10),
      });
      return this.token(usuario.id as string, usuario.email);
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  async login(datos: CredencialesDto) {
    const usuario = await this.usuarios
      .findOne({ email: datos.email })
      .select('+passwordHash')
      .exec();
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValida = await bcrypt.compare(
      datos.password,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.token(usuario.id as string, usuario.email);
  }

  private async token(id: string, email: string) {
    return {
      access_token: await this.jwt.signAsync({ sub: id, email }),
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  async perfil(id: string) {
    const usuario = await this.usuarios.findById(id).exec();
    if (!usuario) throw new UnauthorizedException('El usuario no existe');
    return {
      id: usuario.id as string,
      email: usuario.email,
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      rol: usuario.rol ?? 'user',
    };
  }
}
