import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marks a route as not requiring authentication — used for OTP request/verify,
// login, and the public catalog browsing endpoints.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
