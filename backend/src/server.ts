import dotenv from 'dotenv';
// Load environment variables before importing files using them
dotenv.config();

import app from './app.js';
import { connectDB } from './config/database.js';
import { seedDatabase } from './config/seeder.js';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed Mock Database Records
    await seedDatabase();

    // 3. Start Express server listener
    app.listen(PORT, () => {
      console.log(`===========================================`);
      console.log(`  Smart Leads Server running on port ${PORT}  `);
      console.log(`  API Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`===========================================`);
    });
  } catch (error) {
    console.error('Critical Server Initialization Failure:', error);
    process.exit(1);
  }
};

startServer();
