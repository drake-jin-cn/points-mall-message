import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'dev'}` });
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 8082;
const startTime = Date.now();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'points-mall-message',
    timestamp: new Date().toISOString(),
    db: 'ok', // Message service has no direct DB connection at this phase
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

app.listen(PORT, () => {
  console.log(`Message service running on port ${PORT}`);
});

export default app;
