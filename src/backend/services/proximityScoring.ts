import type { Employee, Level, ProximityResult, GapObjective } from '../types';

// Minimum years of experience required to cover an objective category
const CATEGORY_EXP_THRESHOLD: Record<string, number> = {
  autonomia_tecnica: 0.5,
  quality: 1,
  technical_skills: 0.5,
  tooling: 0.5,
  delivery: 1,
  problem_solving: 0.5,
  agile: 0.5,
  documentation: 0.5,
  knowledge_sharing: 2,
  proactivity: 0.5,
  learning: 0.5,
  communication: 1,
  ownership: 2,
  architecture: 4,
  incident_management: 3,
  business: 5,
  innovation: 3,
  influence: 4,
  kpi: 2,
  community: 4,
  client: 2,
};

// Keywords derived from growth area names that block objective categories
const GROWTH_AREA_CATEGORY_BLOCKS: Record<string, string[]> = {
  typescript: ['technical_skills', 'tooling'],
  testing: ['quality'],
  test: ['quality'],
  architettura: ['architecture'],
  architecture: ['architecture'],
  backend: ['technical_skills'],
  autonomia: ['autonomia_tecnica', 'ownership', 'delivery'],
  ownership: ['autonomia_tecnica', 'ownership'],
  leadership: ['mentoring', 'hiring', 'standards'],
  cloud: ['tooling', 'certifications'],
  devops: ['tooling'],
  comunicazione: ['communication', 'client'],
  stakeholder: ['communication', 'client', 'business'],
  management: ['delivery', 'incident_management'],
  english: ['english'],
  inglese: ['english'],
  proattività: ['proactivity'],
  documenta: ['documentation'],
  design: ['architecture'],
};

function hasEnglishLevel(emp: Employee, acceptedLevels: string[]): boolean {
  return emp.languages.some(l =>
    l.language.toLowerCase() !== 'italiano' &&
    acceptedLevels.some(al => l.level.toLowerCase().includes(al.toLowerCase()))
  );
}

// Convert employee's growth_areas into a flat list of blocked objective categories
function getBlockedCategories(emp: Employee): Set<string> {
  const blocked = new Set<string>();
  for (const ga of emp.career_path.growth_areas) {
    const areaLower = ga.area.toLowerCase();
    for (const [keyword, categories] of Object.entries(GROWTH_AREA_CATEGORY_BLOCKS)) {
      if (areaLower.includes(keyword)) {
        for (const cat of categories) blocked.add(cat);
      }
    }
  }
  return blocked;
}

function isObjectiveCovered(
  category: string,
  emp: Employee,
  blockedCategories: Set<string>
): boolean {
  if (blockedCategories.has(category)) return false;

  const exp = emp.total_years_experience;
  const hasLed = emp.leadership_experience.has_led_people;
  const hasCerts = Array.isArray(emp.certifications) && emp.certifications.length > 0;

  switch (category) {
    case 'certifications':
      return hasCerts;
    case 'english':
      return hasEnglishLevel(emp, ['b2', 'c1', 'native', 'madrelingua']);
    case 'mentoring':
      return hasLed && exp >= 2;
    case 'hiring':
      return hasLed && exp >= 3;
    case 'standards':
      return hasLed && exp >= 3;
    default:
      return exp >= (CATEGORY_EXP_THRESHOLD[category] ?? 1);
  }
}

export function computeProximity(emp: Employee, level: Level): ProximityResult {
  const mandatoryObjectives = level.objectives_to_reach_next_level.filter(
    o => o.priority === 'mandatory'
  );

  const blockedCategories = getBlockedCategories(emp);

  const gapObjectives: GapObjective[] = mandatoryObjectives.map(obj => ({
    id: obj.id,
    category: obj.category,
    title: obj.title,
    priority: obj.priority,
    covered: isObjectiveCovered(obj.category, emp, blockedCategories),
  }));

  const coveredCount = gapObjectives.filter(g => g.covered).length;
  const totalMandatory = mandatoryObjectives.length;
  const score = totalMandatory > 0 ? Math.round((coveredCount / totalMandatory) * 100) : 0;

  return {
    targetLevel: level.code,
    targetLabel: level.label,
    score,
    coveredCount,
    totalMandatory,
    gaps: gapObjectives,
  };
}
