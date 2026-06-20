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

export interface Actor {
  role: 'dipendente' | 'counselor';
  /** Valorizzato solo per role === 'dipendente' */
  employeeId?: string;
  /** Valorizzato solo per role === 'counselor' (oid Entra ID) */
  counselorId?: string;
}

declare module 'express' {
  interface Request {
    user?: AuthUser;
    actor?: Actor;
  }
}
