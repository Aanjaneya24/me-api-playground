const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api', profileRoutes);

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

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const dbPath = path.join(__dirname, 'profile.db');
if (!fs.existsSync(dbPath)) {
  console.warn('\nWARNING: Database not found!');
  console.warn('Please run: npm run seed');
  console.warn('This will create and populate the database.\n');
}

app.listen(PORT, () => {
  console.log(`\nMe-API Playground server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Profile: http://localhost:${PORT}/api/profile\n`);
});
