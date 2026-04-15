/**
 * Tipos base de autenticación del frontend.
 * Se mantienen pequeños porque en esta etapa aún no conectamos backend real.
 */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};