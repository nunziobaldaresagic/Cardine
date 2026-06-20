import type { Employee, Level, Roadmap, RoadmapItem } from '../types';
import { computeProximity } from './proximityScoring';

const ACTION_TEMPLATES: Record<string, { course: string; hours: number; milestone: string }[]> = {
  typescript: [
    {
      course: 'TypeScript Deep Dive — Generics, Utility Types e Strict Mode',
      hours: 10,
      milestone: 'Migrare una feature esistente a TypeScript strict in autonomia',
    },
  ],
  testing: [
    {
      course: 'Testing con Jest e React Testing Library — dall\'unitario all\'integrazione',
      hours: 8,
      milestone: 'Scrivere test unitari per un modulo completo senza affiancamento senior',
    },
  ],
  architettura: [
    {
      course: 'Software Architecture Patterns — Compound Components, CQRS base',
      hours: 12,
      milestone: 'Progettare la struttura di un modulo e difenderla in review tecnica col team',
    },
  ],
  leadership: [
    {
      course: 'Engineering Management Fundamentals — Coaching e 1:1 efficaci',
      hours: 10,
      milestone: 'Condurre 1:1 settimanali con un collega junior per 2 mesi e documentarne il progresso',
    },
  ],
  cloud: [
    {
      course: 'AZ-900 Microsoft Azure Fundamentals — Preparazione certificazione',
      hours: 15,
      milestone: 'Conseguire la certificazione AZ-900',
    },
  ],
  comunicazione: [
    {
      course: 'Communicating with Executive Stakeholders — interno',
      hours: 6,
      milestone: 'Condurre autonomamente una demo di fine sprint con il cliente/stakeholder senior',
    },
  ],
  backend: [
    {
      course: 'Node.js e REST API Design — basi pratiche',
      hours: 10,
      milestone: 'Costruire un endpoint REST completo in autonomia con test',
    },
  ],
  autonomia: [
    {
      course: 'Ownership tecnica — gestire una feature end-to-end',
      hours: 0,
      milestone: 'Prendere ownership di una feature completa dal refinement al deploy senza supervisione',
    },
  ],
};

function getActionsForGrowthArea(area: string): {
  course: string;
  hours: number;
  milestone: string;
} {
  const areaLower = area.toLowerCase();
  for (const [keyword, templates] of Object.entries(ACTION_TEMPLATES)) {
    if (areaLower.includes(keyword)) {
      return templates[0];
    }
  }
  // Generic fallback
  return {
    course: `Formazione strutturata su: ${area}`,
    hours: 8,
    milestone: `Applicare le competenze di ${area} su un progetto reale e documentare il risultato`,
  };
}

function monthRange(startMonth: number, durationMonths: number): string {
  const end = startMonth + durationMonths - 1;
  if (startMonth === end) return `Mese ${startMonth}`;
  return `Mese ${startMonth}–${end}`;
}

export function generateRoadmapStub(emp: Employee, level: Level): Roadmap {
  const proximity = computeProximity(emp, level);
  const growthAreas = emp.career_path.growth_areas.slice(0, 4); // max 4 steps

  const items: RoadmapItem[] = growthAreas.map((ga, idx) => {
    const actions = getActionsForGrowthArea(ga.area);
    const startMonth = idx * 2 + 1;
    const duration = ga.priority === 'high' ? 2 : 1;

    return {
      step: idx + 1,
      competenza: ga.area,
      title: `Step ${idx + 1} — ${ga.area}`,
      monthRange: monthRange(startMonth, duration),
      actions: [
        ...(actions.hours > 0
          ? [{ type: 'corso' as const, description: actions.course, estimatedHours: actions.hours }]
          : []),
        { type: 'milestone' as const, description: actions.milestone },
      ],
      status: 'not_started',
    };
  });

  const totalMonths = emp.career_path.estimated_timeframe_months;

  return {
    employeeId: emp.id,
    targetLevel: level.code,
    targetLabel: level.label,
    initialScore: proximity.score,
    estimatedMonths: totalMonths,
    items,
  };
}
