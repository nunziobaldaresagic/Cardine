import { Router } from 'express';
import { getAllEmployees, getEmployeeById } from '../data/loader';

const router = Router();

router.get('/', (_req, res) => {
  const employees = getAllEmployees().map(emp => ({
    id: emp.id,
    name: emp.personal.name,
    email: emp.personal.email,
    location: emp.personal.location,
    currentRole: emp.current_role.title,
    company: emp.current_role.company,
    hrLevel: emp.current_role.hr_level,
    totalYearsExperience: emp.total_years_experience,
  }));
  res.json(employees);
});

router.get('/:id', (req, res) => {
  const emp = getEmployeeById(req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json(emp);
});

export default router;
