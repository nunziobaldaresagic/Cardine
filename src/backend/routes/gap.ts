import { Router } from 'express';
import type { Request } from 'express';
import { getEmployeeById, getLevelByCode } from '../data/loader';
import { computeProximity } from '../services/proximityScoring';

const router = Router({ mergeParams: true });

router.get('/:targetLevel', (req: Request<{ id: string; targetLevel: string }>, res) => {
  const emp = getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const level = getLevelByCode(req.params.targetLevel.toUpperCase());
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }

  const result = computeProximity(emp, level);

  const allObjectives = level.objectives_to_reach_next_level.map(obj => ({
    ...obj,
    covered: result.gaps.find(g => g.id === obj.id)?.covered ?? false,
  }));

  res.json({
    employee: {
      id: emp.id,
      name: emp.personal.name,
      currentLevel: emp.current_role.hr_level,
    },
    targetLevel: level.code,
    targetLabel: level.label,
    score: result.score,
    coveredCount: result.coveredCount,
    totalMandatory: result.totalMandatory,
    objectives: allObjectives,
  });
});

export default router;
