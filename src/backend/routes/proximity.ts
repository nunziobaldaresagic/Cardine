import { Router } from 'express';
import type { Request } from 'express';
import { getEmployeeById, getLevelByCode, getLevelsOrder } from '../data/loader';
import { computeProximity } from '../services/proximityScoring';

const router = Router({ mergeParams: true });

router.get('/', (req: Request<{ id: string }>, res) => {
  const emp = getEmployeeById(req.params.id);

  const levelsOrder = getLevelsOrder();
  const currentIdx = levelsOrder.indexOf(emp.current_role.hr_level.code);

  if (currentIdx === -1) {
    res.status(422).json({ error: 'Unknown employee level' });
    return;
  }

  // Compute proximity for next 1 and 2 levels up
  const results = [];
  for (let offset = 1; offset <= 2; offset++) {
    const targetCode = levelsOrder[currentIdx + offset];
    if (!targetCode) break;
    const level = getLevelByCode(targetCode);
    if (!level) continue;
    results.push(computeProximity(emp, level));
  }

  results.sort((a, b) => b.score - a.score);
  res.json(results);
});

export default router;
