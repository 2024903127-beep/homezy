import { SetMetadata } from '@nestjs/common';
import { AuthRole } from '@/auth/jwt-payload.type';

export const ROLES_KEY = 'roles';

// Restricts a route to one or more of 'customer' | 'provider' | 'admin'.
// Combine with RolesGuard, which is applied globally.
export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
