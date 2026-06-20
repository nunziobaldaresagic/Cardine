import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../db/prisma';
import type { AppointmentStatus } from '../types';
// Importa per attivare il declare module 'express-serve-static-core' in auth.ts
import '../middleware/auth';

const router = Router();

const VALID_STATUSES: AppointmentStatus[] = ['PENDING', 'PROPOSED', 'CONFIRMED', 'CANCELLED'];

// GET /api/appointments?from=&to=&status=
// - dipendente: vede solo i propri appuntamenti (employeeId dal token)
// - counselor: vede i propri appuntamenti (counselorId dal token), filtrabili per employeeId
router.get('/', async (req: Request, res: Response) => {
  const { from, to, status, employeeId } = req.query as Record<string, string | undefined>;
  const actor = req.actor!;

  if (status && !VALID_STATUSES.includes(status as AppointmentStatus)) {
    res.status(400).json({ error: `status non valido. Valori accettati: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const where: Record<string, unknown> = {};

  if (actor.role === 'dipendente') {
    where['employeeId'] = actor.employeeId;
  } else {
    // counselor: sempre scoped al proprio counselorId, può filtrare anche per employeeId
    where['counselorId'] = actor.counselorId;
    if (employeeId) where['employeeId'] = employeeId;
  }

  if (status) where['status'] = status as AppointmentStatus;
  if (from || to) {
    where['scheduledAt'] = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
  });

  res.json(appointments);
});

// POST /api/appointments
// - dipendente: employeeId forzato dal token, passa solo counselorId e notes
// - counselor: passa employeeId e notes; counselorId forzato dal token
router.post('/', async (req: Request, res: Response) => {
  const actor = req.actor!;
  const body = req.body as { employeeId?: string; counselorId?: string; scheduledAt?: string; notes?: string };

  const employeeId = actor.role === 'dipendente' ? actor.employeeId! : body.employeeId;
  const counselorId = actor.role === 'counselor' ? actor.counselorId! : body.counselorId;

  if (!employeeId || !counselorId) {
    res.status(400).json({ error: actor.role === 'dipendente' ? 'counselorId obbligatorio' : 'employeeId obbligatorio' });
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      employeeId,
      counselorId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      notes: body.notes ?? null,
    },
  });

  res.status(201).json(appointment);
});

// GET /api/appointments/:id
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!appointment) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && appointment.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }

  res.json(appointment);
});

// PATCH /api/appointments/:id
router.patch('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && existing.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }

  const { scheduledAt, notes } = req.body as { scheduledAt?: string; notes?: string };
  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: {
      ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  res.json(updated);
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && existing.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }

  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// PATCH /api/appointments/:id/propose
router.patch('/:id/propose', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && existing.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }
  if (existing.status !== 'PENDING') {
    res.status(400).json({ error: `Transizione non valida: stato corrente è ${existing.status}` });
    return;
  }

  const { scheduledAt } = req.body as { scheduledAt?: string };
  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: {
      status: 'PROPOSED',
      ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
    },
  });

  res.json(updated);
});

// PATCH /api/appointments/:id/confirm
router.patch('/:id/confirm', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && existing.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }
  if (existing.status !== 'PROPOSED') {
    res.status(400).json({ error: `Transizione non valida: stato corrente è ${existing.status}` });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: 'CONFIRMED' },
  });

  res.json(updated);
});

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  const actor = req.actor!;
  if (actor.role === 'dipendente' && existing.employeeId !== actor.employeeId) {
    res.status(403).json({ error: 'Accesso non autorizzato' });
    return;
  }
  if (existing.status === 'CANCELLED') {
    res.status(400).json({ error: 'Appointment già cancellato' });
    return;
  }

  const updated = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });

  res.json(updated);
});

export default router;
