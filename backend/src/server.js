const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { seedProductsIfEmpty } = require('./services/productService');

const startServer = async () => {
  // Connect to MongoDB Atlas or local MongoDB
  await connectDB();

  // Seed default clinical catalog if empty
  await seedProductsIfEmpty();

  const http = require('http');
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  Port ${config.port} is already in use by another running instance of Bellezza server.`);
      console.warn(`ℹ️  The active backend server is already serving requests on port ${config.port}.`);
      console.warn(`👉 To force restart it, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${config.port}).OwningProcess -Force\n`);
      process.exit(0);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`✨ BELLEZZA BACKEND SERVER ACTIVE`);
    console.log(`✨ Tagline: The Science Behind Your Glow`);
    console.log(`🚀 Port: ${config.port}`);
    console.log(`🌿 Environment: ${config.nodeEnv}`);
    console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
    console.log(`===============================================`);
  });

  // Handle graceful shutdown
  const handleExit = () => {
    console.log('\nGracefully closing Bellezza server...');
    server.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
