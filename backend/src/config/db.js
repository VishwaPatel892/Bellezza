const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB Atlas or local MongoDB.
 * Reusable, idempotent, and logs connection host without exposing credentials.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
