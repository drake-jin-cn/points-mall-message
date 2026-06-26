import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'dev'}` });
import express from 'express';
import { jwtAuth } from './middleware/jwtAuth';

const app = express();
const PORT = process.env.PORT ?? 8082;
const startTime = Date.now();

app.use(express.json());

// /health is public — registered BEFORE jwtAuth middleware
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'points-mall-message',
    timestamp: new Date().toISOString(),
    db: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

// All routes below this line require a valid JWT
app.use(jwtAuth);

app.listen(PORT, () => {
  console.log(`Message service running on port ${PORT}`);
});

export default app;
