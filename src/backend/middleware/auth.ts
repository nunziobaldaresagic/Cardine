import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const roleClaim = process.env.ENTRA_ROLE_CLAIM ?? 'roles';

// Endpoint comune — funziona per qualsiasi tenant Entra ID senza configurazione
const jwks = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getSigningKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  if (!header.kid) {
    callback(new Error('Token privo di kid'));
    return;
  }
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error('Chiave non trovata'));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

/**
 * Middleware globale: valida il Bearer token Entra ID.
 * - Tenant ID letto dal claim `tid` del token (non richiede ENTRA_TENANT_ID)
 * - Audience non validata (PoC — accetta qualsiasi token valido del tenant)
 * - Attacca req.user se il token è valido, altrimenti risponde 401.
 */
export function validateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token mancante o formato non valido (atteso: Bearer <token>)' });
    return;
  }

  const token = authHeader.slice(7);

  // Pre-decode per leggere il tid (tenant ID) senza verificare la firma
  const unverified = jwt.decode(token) as Record<string, unknown> | null;
  const tenantId = unverified?.['tid'] as string | undefined;

  if (!tenantId) {
    res.status(401).json({ error: 'Token non valido: claim tid mancante' });
    return;
  }

  jwt.verify(
    token,
    getSigningKey,
    {
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        res.status(401).json({ error: 'Token non valido o scaduto' });
        return;
      }

      const claims = decoded as Record<string, unknown>;
      req.user = {
        oid: (claims['oid'] as string) ?? '',
        name: claims['name'] as string | undefined,
        email: (claims['preferred_username'] ?? claims['email']) as string | undefined,
        role: claims[roleClaim] as string | string[] | undefined,
        claims,
      };

      next();
    }
  );
}

/**
 * Guard per ruolo. Da applicare dopo validateToken.
 * Accetta la request se req.user.role include almeno uno dei ruoli specificati.
 *
 * @example
 *   router.get('/my-route', requireRole('counselor'), handler)
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    const userRoles = Array.isArray(role) ? role : role ? [role] : [];

    const hasRole = allowedRoles.some(r => userRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({
        error: 'Accesso non autorizzato per questo ruolo',
        required: allowedRoles,
        current: userRoles,
      });
      return;
    }

    next();
  };
}
