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

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Swagger UI
const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiSpec = yaml.load(fs.readFileSync(openapiPath, 'utf-8')) as object;
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api/openapi.yaml', (_req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(openapiPath);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/career-map', careerMapRouter);
app.use('/api/employees/:id/proximity', proximityRouter);
app.use('/api/employees/:id/gap', gapRouter);
app.use('/api/employees/:id/roadmap', roadmapRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '0.1.0', env: process.env.NODE_ENV ?? 'development' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Cardine backend PoC running at http://localhost:${PORT}`);
  console.log(`📖 Swagger UI: http://localhost:${PORT}/api/docs\n`);
});

export default app;
