import { Router } from 'express';
import { getCareerMap } from '../data/loader';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getCareerMap());
});

export default router;
