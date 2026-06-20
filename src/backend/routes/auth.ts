import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const role = req.body?.role === 'counselor' ? 'counselor' : 'employee';
  res.json({
    ok: true,
    token: 'dev-token',
    user: {
      id: `dev-${role}`,
      role,
      name: role === 'counselor' ? 'Demo Counselor' : 'Demo Dipendente',
    },
  });
});

export default router;
