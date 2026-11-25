const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const climateRoutes = require('./routes/climateRoutes');
const routineRoutes = require('./routes/routineRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const remedyRoutes = require('./routes/remedyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const journalRoutes = require('./routes/journalRoutes');
const { externalApiService } = require('./services/externalApiService');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin === '*' ? true : config.clientOrigin,
    credentials: true,
  })
);

// Body parsers with payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bellezza Skincare API is healthy and operational.',
    brand: 'Bellezza — The Science Behind Your Glow',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// External API status and attribution
app.get('/api/external/status', async (req, res, next) => {
  try {
    const status = await externalApiService.getStatus();
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
});

// Application API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/climate', climateRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/remedies', remedyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/assistant', assistantRoutes);

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
