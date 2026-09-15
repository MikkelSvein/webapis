import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import referralsRoutes from './routes/referrals.routes';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/referrals', referralsRoutes);

app.get('/api/referrals/health', (_req, res) => {
  res.json({ status: 'ok', service: 'referral-service' });
});

app.listen(PORT, () => {
  console.log(`Referral Service running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
