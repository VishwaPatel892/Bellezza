const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bellezza',
  jwtSecret: process.env.JWT_SECRET || 'bellezza_secure_jwt_secret_glow_science_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || '*',
  groqApiKey: process.env.GROQ_API_KEY || null,
  groqChatModel: process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b',
  groqVisionModel: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
};

module.exports = config;
