/**
 * Database Seed Script
 * Populates the SQLite database with sample candidate profile data
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'profile.db');

// Sample data (REPLACE WITH YOUR ACTUAL INFORMATION)
const sampleProfile = {
  name: "John Doe",  // REPLACE: Your full name
  email: "john.doe@example.com",  // REPLACE: Your email
  education: "B.Tech in Computer Science, XYZ University (2020-2024)"  // REPLACE: Your education
};

const sampleSkills = [
  "JavaScript",
  "Node.js",
  "Express.js",
  "Python",
  "SQL",
  "SQLite",
  "REST APIs",
  "Git",
  "HTML/CSS",
  "Problem Solving"
];

const sampleProjects = [
  {
    title: "E-commerce API",
    description: "Built a RESTful API for an online store with user authentication, product management, and order processing",
    link: "https://github.com/yourusername/ecommerce-api"  // REPLACE: Your project link
  },
  {
    title: "Weather Dashboard",
    description: "Created a weather forecasting application using third-party APIs with data visualization",
    link: "https://github.com/yourusername/weather-dashboard"  // REPLACE: Your project link
  },
  {
    title: "Task Manager",
    description: "Developed a full-stack task management system with real-time updates and user collaboration features",
    link: "https://github.com/yourusername/task-manager"  // REPLACE: Your project link
  }
];

const sampleWork = [
  {
    company: "Tech Startup Inc.",
    position: "Software Development Intern",
    duration: "Jun 2023 - Aug 2023",
    description: "Worked on backend services, implemented REST APIs, and optimized database queries"
  },
  {
    company: "University Coding Club",
    position: "Technical Lead",
    duration: "Jan 2022 - May 2023",
    description: "Led a team of 10 students, organized coding workshops, and mentored junior members"
  }
];

const sampleLinks = {
  github: "https://github.com/yourusername",  // REPLACE: Your GitHub
  linkedin: "https://linkedin.com/in/yourprofile",  // REPLACE: Your LinkedIn
  portfolio: "https://yourportfolio.com"  // REPLACE: Your portfolio
};

// Initialize and seed database
async function seedDatabase() {
  // Remove existing database if it exists
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Removed existing database');
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  console.log('Connected to SQLite database');

  try {
    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.run(schema);
    console.log('Database schema created successfully');
    
    // Insert profile
    const insertProfile = db.prepare(`INSERT INTO profile (name, email, education) VALUES (?, ?, ?)`);
    insertProfile.run([sampleProfile.name, sampleProfile.email, sampleProfile.education]);
    insertProfile.free();
    
    // Get profile ID
    const idStmt = db.prepare('SELECT last_insert_rowid() as id');
    idStmt.step();
    const profileId = idStmt.getAsObject().id;
    idStmt.free();
    console.log(`Profile inserted with ID: ${profileId}`);
    
    // Insert skills
    const insertSkill = db.prepare(`INSERT INTO skills (profile_id, skill_name) VALUES (?, ?)`);
    for (const skill of sampleSkills) {
      insertSkill.run([profileId, skill]);
    }
    insertSkill.free();
    console.log(`Inserted ${sampleSkills.length} skills`);
    
    // Insert projects
    const insertProject = db.prepare(`INSERT INTO projects (profile_id, title, description, link) VALUES (?, ?, ?, ?)`);
    for (const project of sampleProjects) {
      insertProject.run([profileId, project.title, project.description, project.link]);
    }
    insertProject.free();
    console.log(`Inserted ${sampleProjects.length} projects`);
    
    // Insert work experience
    const insertWork = db.prepare(`INSERT INTO work (profile_id, company, position, duration, description) VALUES (?, ?, ?, ?, ?)`);
    for (const work of sampleWork) {
      insertWork.run([profileId, work.company, work.position, work.duration, work.description]);
    }
    insertWork.free();
    console.log(`Inserted ${sampleWork.length} work experiences`);
    
    // Insert links
    const insertLinks = db.prepare(`INSERT INTO links (profile_id, github, linkedin, portfolio) VALUES (?, ?, ?, ?)`);
    insertLinks.run([profileId, sampleLinks.github, sampleLinks.linkedin, sampleLinks.portfolio]);
    insertLinks.free();
    console.log('Links inserted successfully');
    
    // Save database to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    
    db.close();
    console.log('\n✅ Database seeded successfully!');
    console.log('Database file created at:', DB_PATH);
  } catch (error) {
    console.error('Error seeding database:', error);
    db.close();
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
