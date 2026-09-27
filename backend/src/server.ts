import app from './app';
import { connectDB } from './db';
import { startGoalProcessor } from './jobs/goalProcessor';

const PORT = Number(process.env.PORT) || 5000;

const start = async (): Promise<void> => {
  try {
    await connectDB();

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

if (!process.env.VERCEL) {
  start();
}

export default app;
