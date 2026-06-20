import 'express';

export interface AuthUser {
  /** Object ID — identificatore univoco dell'utente in Entra ID */
  oid: string;
  name?: string;
  email?: string;
  /** Ruolo letto dal claim configurato in ENTRA_ROLE_CLAIM */
  role: string | string[] | undefined;
  /** Tutti i claim del token decodificato */
  claims: Record<string, unknown>;
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}
