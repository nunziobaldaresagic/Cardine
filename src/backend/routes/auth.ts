import { Router } from 'express';

const router = Router();

router.post('/login', (_req, res) => {
  res.json({
    ok: true,
    token: 'dev-token',
    user: {
      id: 'dev-user',
      role: 'employee',
      name: 'Demo User',
    },
  });
});

export default router;
