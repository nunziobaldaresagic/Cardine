import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/auth';
import employeesRouter from './routes/employees';
import careerMapRouter from './routes/careerMap';
import proximityRouter from './routes/proximity';
import gapRouter from './routes/gap';
import roadmapRouter from './routes/roadmap';
import appointmentsRouter from './routes/appointments';
import { validateToken } from './middleware/auth';
import { resolveActor } from './middleware/resolveActor';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: false,
}));
app.options('*', cors());
app.use(express.json());

// Route pubbliche — non richiedono token
const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiBase = yaml.load(fs.readFileSync(openapiPath, 'utf-8')) as Record<string, unknown>;

// Swagger UI con server URL dinamico (funziona sia in locale che su Azure)
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', (req, res, next) => {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? req.protocol;
  const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? `localhost:${PORT}`;
  const baseUrl = `${proto}://${host}`;
  const spec = { ...openapiBase, servers: [{ url: baseUrl, description: 'Server corrente' }] };
  swaggerUi.setup(spec)(req, res, next);
});
app.get('/api/openapi.yaml', (req, res) => {
  const proto = (req.headers['x-forwarded-proto'] as string) ?? req.protocol;
  const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? `localhost:${PORT}`;
  const baseUrl = `${proto}://${host}`;
  const spec = { ...openapiBase, servers: [{ url: baseUrl, description: 'Server corrente' }] };
  res.setHeader('Content-Type', 'text/yaml');
  res.send(yaml.dump(spec));
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '0.1.0', env: process.env.NODE_ENV ?? 'development' });
});

// Validazione token Entra ID — tutte le route successive la richiedono
app.use('/api', validateToken);
app.use('/api', resolveActor);

// Route protette
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/career-map', careerMapRouter);
app.use('/api/employees/:id/proximity', proximityRouter);
app.use('/api/employees/:id/gap', gapRouter);
app.use('/api/employees/:id/roadmap', roadmapRouter);
app.use('/api/appointments', appointmentsRouter);

app.listen(PORT, () => {
  console.log(`\n🚀 Cardine backend PoC running at http://localhost:${PORT}`);
  console.log(`📖 Swagger UI: http://localhost:${PORT}/api/docs\n`);
});

export default app;
