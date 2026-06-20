import type { Request, Response, NextFunction } from 'express';
import { getAllEmployees } from '../data/loader';

/**
 * Middleware da applicare dopo validateToken.
 * Risolve l'identità dell'utente (dipendente o counselor) e attacca req.actor.
 *
 * - dipendente: cerca il record employee per email → req.actor.employeeId
 * - counselor:  usa req.user.oid come counselorId → req.actor.counselorId
 *
 * Risponde 403 se il ruolo non è riconosciuto o se il dipendente non ha un profilo.
 */
export function resolveActor(req: Request, res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Utente non autenticato' });
    return;
  }

  const roles = Array.isArray(user.role) ? user.role : user.role ? [user.role] : [];

  if (roles.includes('counselor')) {
    req.actor = { role: 'counselor', counselorId: user.oid };
    next();
    return;
  }

  if (roles.includes('dipendente')) {
    const employee = getAllEmployees()[0];
    req.actor = { role: 'dipendente', employeeId: employee.id };
    next();
    return;
  }

  res.status(403).json({ error: `Ruolo non riconosciuto: ${roles.join(', ')}` });
}
