import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Rol } from '../../auth/rol';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UsuarioJwt } from '../decorators/usuario-actual.decorator';

// Guard: deja pasar solo si el rol del usuario está entre los permitidos
// por @Roles(). Debe ir DESPUÉS de JwtAuthGuard, que es quien carga req.user.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // Busca @Roles() primero en el método y, si no hay, en el controlador.
    const permitidos = this.reflector.getAllAndOverride<Rol[] | undefined>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    // Sin @Roles() la ruta solo exige estar autenticado.
    if (!permitidos || permitidos.length === 0) return true;

    const { user } = ctx
      .switchToHttp()
      .getRequest<Request & { user?: UsuarioJwt }>();
    if (!user || !permitidos.includes(user.rol)) {
      throw new ForbiddenException('No tenés permisos para esta acción');
    }
    return true;
  }
}
