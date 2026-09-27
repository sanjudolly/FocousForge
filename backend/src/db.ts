import mongoose from 'mongoose';

let isConnected = 0;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected === 1 && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusforge';

  try {
    const db = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState;
    console.log('✅  MongoDB connected');
    return db;
  } catch (error) {
    console.error('❌  MongoDB connection error:', error);
    throw error;
  }
};
