import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import { connectDB } from './db';
import authRoutes from './routes/auth';
import goalRoutes from './routes/goals';
import proofRoutes from './routes/proof';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import achievementRoutes from './routes/achievements';
import stripeRoutes from './routes/stripe';
import commitmentRoutes from './routes/commitments';
import { processExpiredGoalsAndCommitments } from './jobs/goalProcessor';

const app = express();

/* ── Security ── */
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  })
);
app.options('*', cors());

/* ── Rate limiting ── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

/* ── Body parsing ── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ── API Router ── */
const apiRouter = express.Router();

// Health check endpoint (always available, does not block on database)
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running ✅',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.VERCEL),
    hasMongoUri: Boolean(process.env.MONGO_URI),
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Database connection middleware for data routes
apiRouter.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGO_URI is configured correctly in Vercel Environment Variables.',
      error: err.message,
    });
  }
});

// Vercel Cron or manual processor endpoint
apiRouter.get('/cron/process-goals', async (_req, res) => {
  try {
    const result = await processExpiredGoalsAndCommitments();
    res.json({
      success: true,
      message: 'Processed expired goals and commitments.',
      ...result,
      timestamp: new Date(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/proof', proofRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/achievements', achievementRoutes);
apiRouter.use('/stripe', stripeRoutes);
apiRouter.use('/commitments', commitmentRoutes);

// Mount on /api
app.use('/api', apiRouter);

/* ── Static Files (Production Frontend) ── */
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

/* ── SPA Fallback for client-side routing ── */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

/* ── 404 API fallback ── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

/* ── Global error handler ── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

export default app;
