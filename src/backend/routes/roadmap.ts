import { Router } from 'express';
import type { Request, Response } from 'express';
import { getEmployeeById, getLevelByCode, getLevelsOrder } from '../data/loader';
import { generateRoadmapStub } from '../services/roadmapStub';
import type { Roadmap } from '../types';

const router = Router({ mergeParams: true });

// In-memory store for confirmed roadmaps: employeeId → Roadmap
const confirmedRoadmaps = new Map<string, Roadmap>();

// POST /api/employees/:id/roadmap/generate
// Body: { targetLevel: string }
// Response: text/event-stream (SSE stub)
router.post('/generate', (req: Request<{ id: string }>, res: Response) => {
  const emp = getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const targetLevelCode: string =
    (req.body as { targetLevel?: string }).targetLevel ??
    emp.career_path.suggested_next_level.code;

  const level = getLevelByCode(targetLevelCode.toUpperCase());
  if (!level) {
    // fallback to suggested next level if code is invalid
    const fallbackCode = emp.career_path.suggested_next_level.code;
    const fallbackLevel = getLevelByCode(fallbackCode);
    if (!fallbackLevel) {
      res.status(422).json({ error: 'Target level not found' });
      return;
    }
  }

  const resolvedLevel = getLevelByCode(targetLevelCode.toUpperCase()) ??
    getLevelByCode(emp.career_path.suggested_next_level.code)!;

  const roadmap = generateRoadmapStub(emp, resolvedLevel);

  // Build the text that will be streamed
  const lines: string[] = [
    `## La tua Roadmap verso ${resolvedLevel.label}`,
    ``,
    `*Percorso personalizzato basato sul tuo profilo attuale. Durata stimata: ${roadmap.estimatedMonths} mesi.*`,
    ``,
  ];

  for (const item of roadmap.items) {
    lines.push(`### ${item.title}  [${item.monthRange}]`);
    for (const action of item.actions) {
      if (action.type === 'corso') {
        lines.push(`- **Corso**: ${action.description}${action.estimatedHours ? ` — ${action.estimatedHours}h` : ''}`);
      } else if (action.type === 'milestone') {
        lines.push(`- **Milestone**: ${action.description}`);
      }
    }
    lines.push(``);
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send roadmap metadata as first event
  res.write(`data: ${JSON.stringify({ type: 'meta', roadmap })}\n\n`);

  // Stream text lines with delay to simulate LLM output
  let lineIdx = 0;
  const interval = setInterval(() => {
    if (lineIdx >= lines.length) {
      res.write(`data: [DONE]\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }
    const chunk = lines[lineIdx];
    res.write(`data: ${JSON.stringify({ type: 'text', content: chunk + '\n' })}\n\n`);
    lineIdx++;
  }, 150);

  req.on('close', () => clearInterval(interval));
});

// POST /api/employees/:id/roadmap/confirm
// Body: roadmap JSON (as returned by /generate meta event)
router.post('/confirm', (req: Request<{ id: string }>, res: Response) => {
  const emp = getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const roadmap = req.body as Roadmap;
  if (!roadmap || !roadmap.items) {
    res.status(400).json({ error: 'Invalid roadmap body' });
    return;
  }

  const confirmed: Roadmap = {
    ...roadmap,
    employeeId: emp.id,
    confirmedAt: new Date().toISOString(),
  };

  confirmedRoadmaps.set(emp.id, confirmed);
  res.status(201).json({ ok: true, roadmap: confirmed });
});

// GET /api/employees/:id/roadmap
router.get('/', (req: Request<{ id: string }>, res: Response) => {
  const emp = getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const roadmap = confirmedRoadmaps.get(emp.id);
  if (!roadmap) {
    // Return a generated (unconfirmed) roadmap if none confirmed yet
    const levelsOrder = getLevelsOrder();
    const currentIdx = levelsOrder.indexOf(emp.current_role.hr_level.code);
    const nextCode = levelsOrder[currentIdx + 1] ?? emp.career_path.suggested_next_level.code;
    const level = getLevelByCode(nextCode);
    if (!level) {
      res.status(404).json({ error: 'No roadmap found and no target level available' });
      return;
    }
    const stub = generateRoadmapStub(emp, level);
    res.status(200).json({ confirmed: false, roadmap: stub });
    return;
  }

  res.json({ confirmed: true, roadmap });
});

export default router;
