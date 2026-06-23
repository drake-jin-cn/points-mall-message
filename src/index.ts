import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'dev'}` });
import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 8082;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Message service running on port ${PORT}`);
});

export default app;
