import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bondsRoutes from './routes/bonds.routes';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/bonds', bondsRoutes);

app.get('/api/bonds/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bonds-service' });
});

app.listen(PORT, () => {
  console.log(`Bonds Service running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
