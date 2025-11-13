/**
 * Express server entry point for Verifiable Credentials issuer service
 * 
 * This server provides RESTful endpoints for:
 * - DID generation
 * - Credential issuance
 * - Credential verification
 * - Credential presentation
 * - Credential revocation
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const agent = require('./agent');

// Import route handlers
const didRoutes = require('./routes/did');
const issueRoutes = require('./routes/issue');
const receiveRoutes = require('./routes/receive');
const presentRoutes = require('./routes/present');
const verifyRoutes = require('./routes/verify');
const revokeRoutes = require('./routes/revoke');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/generate-did', didRoutes);
app.use('/issue', issueRoutes);
app.use('/receive-vc', receiveRoutes);
app.use('/present', presentRoutes);
app.use('/verify', verifyRoutes);
app.use('/revoke', revokeRoutes);
app.use('/status', revokeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize agent and start server
async function startServer() {
  try {
    // Initialize Veramo agent
    await agent.initializeAgent();
    console.log('✅ Veramo agent initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 VC Issuer Service running on http://localhost:${PORT}`);
      console.log(`📋 Available endpoints:`);
      console.log(`   POST   /generate-did`);
      console.log(`   POST   /issue`);
      console.log(`   POST   /receive-vc`);
      console.log(`   POST   /present`);
      console.log(`   POST   /verify`);
      console.log(`   POST   /revoke`);
      console.log(`   GET    /status/:credentialId`);
      console.log(`   GET    /health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Only start server if this file is run directly (not when imported for tests)
if (require.main === module) {
  startServer();
}

module.exports = app;

