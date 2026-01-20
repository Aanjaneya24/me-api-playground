# Me-API Playground

A personal profile API playground that stores candidate information in a SQLite database and exposes it via a RESTful API with a minimal frontend interface.

## Project Overview

This project is a full-stack application built for an internship assessment. It demonstrates:
- Building RESTful APIs with Node.js and Express
- Database design and management with SQLite
- Frontend development with vanilla JavaScript
- CRUD operations and query endpoints
- Clean, maintainable code architecture

## Architecture

### Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: SQLite (using `sql.js` - pure JavaScript implementation)
- **Frontend**: Plain HTML + Vanilla JavaScript
- **CORS**: Enabled for cross-origin requests

### Project Structure
```
me-api-playground/
├── backend/
│   ├── index.js           # Main Express server
│   ├── db.js              # Database connection & helper functions
│   ├── seed.js            # Database seeding script
│   ├── schema.sql         # Database schema definition
│   ├── routes/
│   │   └── profile.js     # API route handlers
│   ├── package.json       # Node.js dependencies
│   └── profile.db         # SQLite database (created after seeding)
│
├── frontend/
│   └── index.html         # Single-page frontend application
│
└── README.md              # This file
```

### Architecture Flow
```
Frontend (HTML/JS)
    ↓ HTTP Requests (CORS enabled)
Express Server (index.js)
    ↓ Routes
API Routes (routes/profile.js)
    ↓ Database queries
Database Module (db.js)
    ↓ SQL queries
SQLite Database (profile.db)
```

## Database Schema

### Tables

**profile**
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `education` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

**skills**
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY → profile.id)
- `skill_name` (TEXT, NOT NULL)

**projects**
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY → profile.id)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `link` (TEXT)
- `created_at` (DATETIME)

**work**
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY → profile.id)
- `company` (TEXT, NOT NULL)
- `position` (TEXT, NOT NULL)
- `duration` (TEXT)
- `description` (TEXT)

**links**
- `id` (INTEGER, PRIMARY KEY)
- `profile_id` (INTEGER, FOREIGN KEY → profile.id)
- `github` (TEXT)
- `linkedin` (TEXT)
- `portfolio` (TEXT)

### Relationships
- One profile has many skills (1:N)
- One profile has many projects (1:N)
- One profile has many work experiences (1:N)
- One profile has one links record (1:1)

## API Endpoints

### Profile Management

#### Get Complete Profile
```
GET /api/profile
```
Returns complete profile with all related data (skills, projects, work, links).

**Response Example:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "education": "B.Tech in Computer Science, XYZ University (2020-2024)",
  "skills": ["JavaScript", "Node.js", "Python"],
  "projects": [
    {
      "id": 1,
      "title": "E-commerce API",
      "description": "Built a RESTful API...",
      "link": "https://github.com/..."
    }
  ],
  "work": [...],
  "links": {
    "github": "https://github.com/...",
    "linkedin": "https://linkedin.com/in/...",
    "portfolio": "https://..."
  }
}
```

#### Create Profile
```
POST /api/profile
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your.email@example.com",
  "education": "Your education details",
  "skills": ["Skill1", "Skill2"],
  "projects": [
    {
      "title": "Project Name",
      "description": "Description",
      "link": "https://..."
    }
  ],
  "work": [
    {
      "company": "Company Name",
      "position": "Position",
      "duration": "Jan 2023 - Present",
      "description": "Description"
    }
  ],
  "links": {
    "github": "https://github.com/...",
    "linkedin": "https://linkedin.com/in/...",
    "portfolio": "https://..."
  }
}
```

#### Update Profile
```
PUT /api/profile
Content-Type: application/json

{
  "name": "Updated Name",
  "skills": ["Updated", "Skills"],
  ...
}
```

### Query Endpoints

#### Get All Skills
```
GET /api/skills
```
Returns array of all unique skills.

**Response Example:**
```json
["JavaScript", "Node.js", "Python", "SQL"]
```

#### Search Projects
```
GET /api/projects?q=search_term
```
Search projects by title or description.

**Response Example:**
```json
[
  {
    "id": 1,
    "title": "E-commerce API",
    "description": "Built a RESTful API...",
    "link": "https://github.com/..."
  }
]
```

#### Global Search
```
GET /api/search?q=search_term
```
Search across profile, skills, projects, and work experience.

**Response Example:**
```json
{
  "profile": [...],
  "skills": [...],
  "projects": [...],
  "work": [...]
}
```

### Health Check
```
GET /api/health
```
Returns API health status (always returns 200).

**Response:**
```json
{
  "status": "OK",
  "message": "API is healthy"
}
```

## Local Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Clone/Download Project
```bash
cd /Users/aanjaneyapandey/Desktop/ME_API
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

This will install:
- `express` (v4.18.2)
- `cors` (v2.8.5)
- `sql.js` (v1.10.3) - Pure JavaScript SQLite implementation

### Step 3: Customize Sample Data (IMPORTANT!)
Before seeding, update the sample data in `backend/seed.js` with your actual information:
- Replace placeholder name, email, education
- Update skills array with your skills
- Update projects with your actual projects and links
- Update work experience
- Update GitHub, LinkedIn, and portfolio links

### Step 4: Seed Database
```bash
npm run seed
```

This will:
- Create `profile.db` SQLite database
- Create all necessary tables
- Populate with your data

### Step 5: Start Backend Server
```bash
npm start
```

Server will run on `http://localhost:3000`

### Step 6: Open Frontend
Open `frontend/index.html` in your web browser:
```bash
# From project root
open frontend/index.html
# OR
# Simply double-click the index.html file
```

**Note**: If deploying to a hosting service, update the `API_BASE_URL` variable in `index.html` to point to your deployed backend URL.

## Sample cURL Commands

### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### Get Profile
```bash
curl http://localhost:3000/api/profile
```

### Get Skills
```bash
curl http://localhost:3000/api/skills
```

### Search Projects
```bash
curl "http://localhost:3000/api/projects?q=API"
```

### Global Search
```bash
curl "http://localhost:3000/api/search?q=JavaScript"
```

### Create Profile (POST)
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "education": "M.S. Computer Science",
    "skills": ["Python", "Django", "PostgreSQL"],
    "projects": [{
      "title": "Blog Platform",
      "description": "A full-featured blog",
      "link": "https://github.com/jane/blog"
    }],
    "work": [{
      "company": "Tech Corp",
      "position": "Developer",
      "duration": "2023-Present",
      "description": "Backend development"
    }],
    "links": {
      "github": "https://github.com/jane",
      "linkedin": "https://linkedin.com/in/jane",
      "portfolio": "https://jane.dev"
    }
  }'
```

### Update Profile (PUT)
```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith Updated",
    "skills": ["Python", "Django", "PostgreSQL", "Docker"]
  }'
```

## Known Limitations

1. **Single Profile**: Currently supports only one profile (ID = 1). The system is designed for personal use, not multi-user scenarios.

2. **No Authentication**: No authentication or authorization implemented. In production, endpoints should be secured.

3. **Basic Validation**: Minimal input validation. Production systems should include comprehensive validation and sanitization.

4. **No Pagination**: All queries return complete result sets. For larger datasets, pagination should be implemented.

5. **Simple Search**: Search functionality uses basic SQL LIKE queries. Advanced search with ranking/relevance would require full-text search or specialized search engines.

6. **CORS Wide Open**: CORS is enabled for all origins (`*`). In production, restrict to specific domains.

7. **No Rate Limiting**: No rate limiting on API endpoints. Should be added for production deployment.

8. **Synchronous File Operations**: Some file operations in seed script are synchronous. Not critical for one-time seeding but should be async in production.

9. **Error Handling**: Basic error handling is implemented. Production systems need more comprehensive error handling and logging.

10. **No Tests**: No unit or integration tests included. Testing framework should be added for production code.

11. **Frontend API URL**: Frontend requires manual update of API_BASE_URL when deploying. Could be improved with environment variables or auto-detection.

12. **Database Location**: SQLite database file is stored in the backend directory. For production, consider dedicated storage.

## Deployment Considerations

### Backend Deployment (e.g., Render, Railway, Heroku)
1. Push code to GitHub repository
2. Connect repository to hosting service
3. Set environment variables (PORT, NODE_ENV)
4. Ensure `npm run seed` is run during deployment
5. Note the deployed backend URL

### Frontend Deployment (e.g., Netlify, Vercel, GitHub Pages)
1. Update `API_BASE_URL` in `index.html` to your deployed backend URL
2. Deploy the `frontend` folder
3. Ensure CORS is properly configured on backend

### Database Persistence
- For SQLite in production, ensure the database file persists across deployments
- Consider using volume mounts or persistent storage
- For scale, migrate to PostgreSQL or MySQL

## Resume Link

**[INSERT YOUR RESUME LINK HERE]**

Example: `https://drive.google.com/file/d/YOUR_RESUME_ID/view`

## Contact

For questions or issues with this project:
- **Email**: [Your email from profile]
- **GitHub**: [Your GitHub from profile]
- **LinkedIn**: [Your LinkedIn from profile]

For Internship Assessment - Me-API Playground v1.0
