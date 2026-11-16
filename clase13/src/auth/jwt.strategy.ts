import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Rol } from './rol';
import type { UsuarioJwt } from '../common/decorators/usuario-actual.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  validate(payload: { sub: string; email: string; rol?: Rol }): UsuarioJwt {
    // Tokens emitidos antes de agregar roles no traen "rol": se tratan como user.
    return {
      sub: payload.sub,
      email: payload.email,
      rol: payload.rol ?? 'user',
    };
  }
}
