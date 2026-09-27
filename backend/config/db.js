const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance.
 * Automatically attempts connecting to process.env.MONGODB_URI.
 * If connection fails, falls back to MongoMemoryServer so the app runs out-of-the-box.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_db';

  try {
    // Attempt standard connection with a short 3-second timeout for local server detection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected to: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to local MongoDB at ${uri}: ${error.message}`);
    console.log('🔄 Initializing MongoMemoryServer fallback for out-of-the-box local execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to in-memory MongoDB server at: ${memoryUri}`);
    } catch (memError) {
      console.error(`❌ Failed to start MongoMemoryServer: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
