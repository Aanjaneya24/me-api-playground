/**
 * Me-API Playground - Main Server
 * Express server with SQLite backend for personal profile API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mount API routes
app.use('/api', profileRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Me-API Playground',
    version: '1.0.0',
    endpoints: {
      profile: {
        'GET /api/profile': 'Get complete profile',
        'POST /api/profile': 'Create new profile',
        'PUT /api/profile': 'Update profile'
      },
      queries: {
        'GET /api/skills': 'Get all skills',
        'GET /api/projects?q=search': 'Search projects',
        'GET /api/search?q=search': 'Global search'
      },
      health: {
        'GET /api/health': 'Health check'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Check if database exists
const dbPath = path.join(__dirname, 'profile.db');
if (!fs.existsSync(dbPath)) {
  console.warn('\n⚠️  WARNING: Database not found!');
  console.warn('Please run: npm run seed');
  console.warn('This will create and populate the database.\n');
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Me-API Playground server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`👤 Profile: http://localhost:${PORT}/api/profile\n`);
});
