const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'profile.db');

const sampleProfile = {
  name: "Aanjaneya Pandey",
  email: "pandeyaanjaneya76@gmail.com",
  education: "National Institute of Technology Delhi - B.Tech in Electronics and Communication Engineering with Minor in AI & ML, Graduating 2027 (CGPA: 9.0/10)"
};

const sampleSkills = [
  "C",
  "C++",
  "Python",
  "JavaScript",
  "React.js",
  "Node.js",
  "Express.js",
  "MongoDB",
  "RESTful APIs",
  "Docker",
  "Git/GitHub",
  "Zephyr RTOS",
  "Data Structures & Algorithms",
  "OOPS",
  "Computer Networks",
  "Operating Systems",
  "DBMS"
];

const sampleProjects = [
  {
    title: "EduTrack - Smart School Management System",
    description: "Developed a MERN-based analytics platform for statistical analysis of student performance and attendance. Implemented RBAC and secure REST APIs to enable controlled data access and efficient metric aggregation. Deployed on cloud infrastructure supporting 100+ concurrent requests for real-time analytics.",
    link: "https://github.com/Aanjaneya24/EduTrack-Smart-School-Management-System"
  },
  {
    title: "HireSense - AI-Powered Job Portal",
    description: "Engineered a full-stack AI-powered job portal with recruiter dashboards and end-to-end application tracking. Integrated LLaMA-based AI via Groq API to generate job descriptions in <2s, reducing manual effort by 60%. Implemented JWT-based authentication and scalable MongoDB schemas.",
    link: "https://github.com/Aanjaneya24/HireSense"
  }
];

const sampleWork = [
  {
    company: "IIT (BHU), Varanasi",
    position: "Embedded Systems, Optimization & AI Research Intern",
    duration: "June 2025 - July 2025",
    description: "Conducted performance modelling and statistical analysis of a LoRaWAN-based communication stack (nRF54L15 & SX1261), leading to a 30% improvement in network efficiency. Developed and optimized low-level drivers in C (Zephyr RTOS) and applied computational efficiency techniques, improving system reliability by 20%. Designed and evaluated OTAA-based authentication mechanisms using probabilistic modelling, extending the wireless range beyond 500m."
  },
  {
    company: "Think India Club, NIT Delhi",
    position: "Active Member",
    duration: "2023 - Present",
    description: "Organized and led 5+ seminars and technical discussions, engaging 50+ participants. Collaborated with peers to conduct technical workshops and events, improving teamwork and hands-on learning."
  }
];

const sampleLinks = {
  github: "https://github.com/Aanjaneya24",
  linkedin: "https://www.linkedin.com/in/aanjaneya-pandey-9715b2335/",
  portfolio: "https://portfolio-inky-chi-6ru5lsgmzu.vercel.app/"
};

async function seedDatabase() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Removed existing database');
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  console.log('Connected to SQLite database');

  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    db.run(schema);
    console.log('Database schema created successfully');
    
    const insertProfile = db.prepare(`INSERT INTO profile (name, email, education) VALUES (?, ?, ?)`);
    insertProfile.run([sampleProfile.name, sampleProfile.email, sampleProfile.education]);
    insertProfile.free();
    
    const idStmt = db.prepare('SELECT last_insert_rowid() as id');
    idStmt.step();
    const profileId = idStmt.getAsObject().id;
    idStmt.free();
    console.log(`Profile inserted with ID: ${profileId}`);
    
    const insertSkill = db.prepare(`INSERT INTO skills (profile_id, skill_name) VALUES (?, ?)`);
    for (const skill of sampleSkills) {
      insertSkill.run([profileId, skill]);
    }
    insertSkill.free();
    console.log(`Inserted ${sampleSkills.length} skills`);
    
    const insertProject = db.prepare(`INSERT INTO projects (profile_id, title, description, link) VALUES (?, ?, ?, ?)`);
    for (const project of sampleProjects) {
      insertProject.run([profileId, project.title, project.description, project.link]);
    }
    insertProject.free();
    console.log(`Inserted ${sampleProjects.length} projects`);
    
    const insertWork = db.prepare(`INSERT INTO work (profile_id, company, position, duration, description) VALUES (?, ?, ?, ?, ?)`);
    for (const work of sampleWork) {
      insertWork.run([profileId, work.company, work.position, work.duration, work.description]);
    }
    insertWork.free();
    console.log(`Inserted ${sampleWork.length} work experiences`);
    
    const insertLinks = db.prepare(`INSERT INTO links (profile_id, github, linkedin, portfolio) VALUES (?, ?, ?, ?)`);
    insertLinks.run([profileId, sampleLinks.github, sampleLinks.linkedin, sampleLinks.portfolio]);
    insertLinks.free();
    console.log('Links inserted successfully');
    
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    
    db.close();
    console.log('\nDatabase seeded successfully!');
    console.log('Database file created at:', DB_PATH);
  } catch (error) {
    console.error('Error seeding database:', error);
    db.close();
    process.exit(1);
  }
}

seedDatabase();
