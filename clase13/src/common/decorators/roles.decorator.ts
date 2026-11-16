import { SetMetadata } from '@nestjs/common';
import type { Rol } from '../../auth/rol';

export const ROLES_KEY = 'roles';

// Decorador que guarda como metadata qué roles pueden usar la ruta.
// No bloquea nada por sí solo: RolesGuard es quien lee esta metadata.
//   @Roles('admin')
//   @Roles('admin', 'user')
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
