const config = require('../config/env');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
};

/**
 * Centralized Application Error Handler
 */
const errorHandler = (err, req, res, _next) => {
  // Never log passwords, tokens, or sensitive headers
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';

  console.error('[Bellezza Error]', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
  });

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
      errors: { [field]: `This ${field} is already registered.` },
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const key of Object.keys(err.errors)) {
      errors[key] = err.errors[key].message;
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for parameter '${err.path}'`,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = config.nodeEnv === 'production';

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && isProduction ? 'Internal server error.' : err.message || 'An unexpected error occurred.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

