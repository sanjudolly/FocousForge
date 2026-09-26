import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import goalRoutes from './routes/goals';
import proofRoutes from './routes/proof';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import achievementRoutes from './routes/achievements';
import stripeRoutes from './routes/stripe';
import commitmentRoutes from './routes/commitments';
import { startGoalProcessor } from './jobs/goalProcessor';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusforge';

/* ── Security ── */
app.use(helmet({ crossOriginResourcePolicy: false }));

// Accept ALL origins in development; restrict in production
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true), // open during dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
  })
);
app.options('*', cors()); // pre-flight for all routes

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
app.use(morgan('dev'));

/* ── Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/proof', proofRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/commitments', commitmentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API is running ✅', timestamp: new Date() });
});

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

/* ── Global error handler ── */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

/* ── Start ── */
const start = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connected →', MONGO_URI);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀  FocusForge API  →  http://localhost:${PORT}`);
      startGoalProcessor();
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌  Port ${PORT} is already in use.\n   → Kill the other process or set PORT= in .env\n`);
        process.exit(1);
      }
      throw err;
    });
  } catch (err) {
    console.error('❌  Failed to start:', err);
    process.exit(1);
  }
};

start();

export default app;
