const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bellezza',
  jwtSecret: process.env.JWT_SECRET || 'bellezza_secure_jwt_secret_glow_science_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || '*',
};

module.exports = config;
