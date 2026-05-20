import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leads_db';
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB successfully connected to database');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
    });

    try {
      console.log(`Attempting connection to: ${mongoURI}`);
      // Shorten selection timeout to 2500ms so fallback triggers quickly
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2500 });
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: Database connection failed in production mode!');
        console.error('Please verify your MONGODB_URI and ensure Render is whitelisted in Atlas.');
        throw err;
      }
      console.warn('Local MongoDB server unavailable. Booting in-memory MongoDB fallback...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryURI = mongoMemoryServer.getUri();
      console.log(`In-memory MongoDB instance started at: ${memoryURI}`);
      await mongoose.connect(memoryURI);
    }
  } catch (error) {
    console.error('Failed to establish database connection:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
