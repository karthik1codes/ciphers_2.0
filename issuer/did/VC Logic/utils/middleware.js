/**
 * Express Middleware Functions
 * 
 * Simple middleware for demo purposes
 * 
 * PRODUCTION NOTES:
 * - Replace with proper authentication (OAuth2, JWT, mTLS, etc.)
 * - Implement rate limiting
 * - Add request logging and monitoring
 * - Implement role-based access control (RBAC)
 */

/**
 * API Key Middleware
 * 
 * Simple API key authentication for issuer-only endpoints
 * 
 * Usage: router.post('/revoke', requireApiKey, handler)
 * 
 * Expects API key in X-API-Key header
 * API key should be set in .env as ISSUER_API_KEY
 * 
 * PRODUCTION: Replace with proper authentication
 */
function requireApiKey(req, res, next) {
  // Get API key from environment
  const validApiKey = process.env.ISSUER_API_KEY || 'demo-issuer-api-key-change-in-production';
  
  // Get API key from request header
  const providedApiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Validate API key
  if (!providedApiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide API key in X-API-Key header',
    });
  }
  
  if (providedApiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
  }
  
  // API key is valid, proceed to next middleware
  next();
}

/**
 * Request validation middleware (example)
 * 
 * Validates required fields in request body
 * 
 * Usage: router.post('/endpoint', validateRequired(['field1', 'field2']), handler)
 */
function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missing,
      });
    }
    
    next();
  };
}

/**
 * Error handling middleware (example)
 * 
 * Catches and formats errors consistently
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Default error status
  const status = err.status || err.statusCode || 500;
  
  // Error response
  const errorResponse = {
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  };
  
  res.status(status).json(errorResponse);
}

module.exports = {
  requireApiKey,
  validateRequired,
  errorHandler,
};

