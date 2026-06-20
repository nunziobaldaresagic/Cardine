import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../db/prisma';
import type { AppointmentStatus } from '../types';

const router = Router();

const VALID_STATUSES: AppointmentStatus[] = ['PENDING', 'PROPOSED', 'CONFIRMED', 'CANCELLED'];

// GET /api/appointments?employeeId=&counselorId=&from=&to=&status=
router.get('/', async (req: Request, res: Response) => {
  const { employeeId, counselorId, from, to, status } = req.query as Record<string, string | undefined>;

  if (status && !VALID_STATUSES.includes(status as AppointmentStatus)) {
    res.status(400).json({ error: `status non valido. Valori accettati: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(counselorId ? { counselorId } : {}),
      ...(status ? { status: status as AppointmentStatus } : {}),
      ...(from || to
        ? {
            scheduledAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json(appointments);
});

// POST /api/appointments
router.post('/', async (req: Request, res: Response) => {
  const { employeeId, counselorId, scheduledAt, notes } = req.body as {
    employeeId?: string;
    counselorId?: string;
    scheduledAt?: string;
    notes?: string;
  };

  if (!employeeId || !counselorId) {
    res.status(400).json({ error: 'employeeId e counselorId sono obbligatori' });
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      employeeId,
      counselorId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      notes: notes ?? null,
    },
  });

  res.status(201).json(appointment);
});

// GET /api/appointments/:id
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
  });

  if (!appointment) {
    res.status(404).json({ error: 'Appointment non trovato' });
    return;
  }

  res.json(appointment);
});

// PATCH /api/appointments/:id — aggiorna campi liberi (scheduledAt, notes)
router.patch('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
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

  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// PATCH /api/appointments/:id/propose — PENDING → PROPOSED
router.patch('/:id/propose', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
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

// PATCH /api/appointments/:id/confirm — PROPOSED → CONFIRMED
router.patch('/:id/confirm', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
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

// PATCH /api/appointments/:id/cancel — qualsiasi stato → CANCELLED
router.patch('/:id/cancel', async (req: Request<{ id: string }>, res: Response) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: 'Appointment non trovato' });
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
