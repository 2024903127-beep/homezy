// The `role` field is what distinguishes a customer token from a provider
// or admin token — RolesGuard checks this against each route's @Roles().
export type AuthRole = 'customer' | 'provider' | 'admin';

export interface JwtPayload {
  sub: string; // user/provider/admin id
  role: AuthRole;
  adminRole?: string; // only present for role === 'admin'
}
