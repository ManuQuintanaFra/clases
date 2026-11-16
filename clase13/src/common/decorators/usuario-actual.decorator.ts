import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// Lo que devuelve JwtStrategy.validate() y Passport guarda en req.user.
export interface UsuarioJwt {
  sub: string;
  email: string;
}

// Decorador de parámetro: extrae el usuario autenticado de la request.
//   @UsuarioActual()      -> { sub, email }
//   @UsuarioActual('sub') -> solo el id del usuario
// Requiere que la ruta esté protegida con JwtAuthGuard.
export const UsuarioActual = createParamDecorator(
  (campo: keyof UsuarioJwt | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { user: UsuarioJwt }>();
    return campo ? req.user[campo] : req.user;
  },
);
