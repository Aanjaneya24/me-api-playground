const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun, dbTransaction, getDB } = require('../db');

router.get('/profile', async (req, res) => {
  try {
    const profile = await dbGet('SELECT * FROM profile WHERE id = 1');
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const skills = await dbAll('SELECT skill_name FROM skills WHERE profile_id = ?', [profile.id]);
    
    const projects = await dbAll(
      'SELECT id, title, description, link FROM projects WHERE profile_id = ?',
      [profile.id]
    );
    
    const work = await dbAll(
      'SELECT company, position, duration, description FROM work WHERE profile_id = ?',
      [profile.id]
    );
    
    const links = await dbGet('SELECT github, linkedin, portfolio FROM links WHERE profile_id = ?', [profile.id]);
    
    const response = {
      name: profile.name,
      email: profile.email,
      education: profile.education,
      skills: skills.map(s => s.skill_name),
      projects: projects,
      work: work,
      links: links || {}
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/profile', async (req, res) => {
  try {
    const { name, email, education, skills, projects, work, links } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const existing = await dbGet('SELECT id FROM profile WHERE id = 1');
    if (existing) {
      return res.status(400).json({ error: 'Profile already exists. Use PUT to update.' });
    }
    
    const db = await getDB();
    const { saveDB } = require('../db');
    
    try {
      db.run('BEGIN TRANSACTION');
      
      const stmt = db.prepare('INSERT INTO profile (name, email, education) VALUES (?, ?, ?)');
      stmt.run([name, email, education || '']);
      stmt.free();
      
      const idStmt = db.prepare('SELECT last_insert_rowid() as id');
      idStmt.step();
      const profileId = idStmt.getAsObject().id;
      idStmt.free();
      
      if (skills && Array.isArray(skills)) {
        const skillStmt = db.prepare('INSERT INTO skills (profile_id, skill_name) VALUES (?, ?)');
        for (const skill of skills) {
          skillStmt.run([profileId, skill]);
        }
        skillStmt.free();
      }
      
      if (projects && Array.isArray(projects)) {
        const projectStmt = db.prepare('INSERT INTO projects (profile_id, title, description, link) VALUES (?, ?, ?, ?)');
        for (const project of projects) {
          projectStmt.run([profileId, project.title, project.description || '', project.link || '']);
        }
        projectStmt.free();
      }
      
      if (work && Array.isArray(work)) {
        const workStmt = db.prepare('INSERT INTO work (profile_id, company, position, duration, description) VALUES (?, ?, ?, ?, ?)');
        for (const w of work) {
          workStmt.run([profileId, w.company, w.position, w.duration || '', w.description || '']);
        }
        workStmt.free();
      }
      
      if (links) {
        const linksStmt = db.prepare('INSERT INTO links (profile_id, github, linkedin, portfolio) VALUES (?, ?, ?, ?)');
        linksStmt.run([profileId, links.github || '', links.linkedin || '', links.portfolio || '']);
        linksStmt.free();
      }
      
      db.run('COMMIT');
      saveDB(db);
      db.close();
      
      res.status(201).json({ message: 'Profile created successfully', profileId });
    } catch (err) {
      db.run('ROLLBACK');
      db.close();
      throw err;
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, email, education, skills, projects, work, links } = req.body;
    
    const existing = await dbGet('SELECT id FROM profile WHERE id = 1');
    if (!existing) {
      return res.status(404).json({ error: 'Profile not found. Use POST to create.' });
    }
    
    const profileId = existing.id;
    const db = await getDB();
    const { saveDB } = require('../db');
    
    try {
      db.run('BEGIN TRANSACTION');
      
      if (name || email || education !== undefined) {
        const stmt = db.prepare('UPDATE profile SET name = COALESCE(?, name), email = COALESCE(?, email), education = COALESCE(?, education), updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        stmt.run([name, email, education, profileId]);
        stmt.free();
      }
      
      if (skills && Array.isArray(skills)) {
        const delStmt = db.prepare('DELETE FROM skills WHERE profile_id = ?');
        delStmt.run([profileId]);
        delStmt.free();
        
        const skillStmt = db.prepare('INSERT INTO skills (profile_id, skill_name) VALUES (?, ?)');
        for (const skill of skills) {
          skillStmt.run([profileId, skill]);
        }
        skillStmt.free();
      }
      
      if (projects && Array.isArray(projects)) {
        const delStmt = db.prepare('DELETE FROM projects WHERE profile_id = ?');
        delStmt.run([profileId]);
        delStmt.free();
        
        const projectStmt = db.prepare('INSERT INTO projects (profile_id, title, description, link) VALUES (?, ?, ?, ?)');
        for (const project of projects) {
          projectStmt.run([profileId, project.title, project.description || '', project.link || '']);
        }
        projectStmt.free();
      }
      
      if (work && Array.isArray(work)) {
        const delStmt = db.prepare('DELETE FROM work WHERE profile_id = ?');
        delStmt.run([profileId]);
        delStmt.free();
        
        const workStmt = db.prepare('INSERT INTO work (profile_id, company, position, duration, description) VALUES (?, ?, ?, ?, ?)');
        for (const w of work) {
          workStmt.run([profileId, w.company, w.position, w.duration || '', w.description || '']);
        }
        workStmt.free();
      }
      
      if (links) {
        const delStmt = db.prepare('DELETE FROM links WHERE profile_id = ?');
        delStmt.run([profileId]);
        delStmt.free();
        
        const linksStmt = db.prepare('INSERT INTO links (profile_id, github, linkedin, portfolio) VALUES (?, ?, ?, ?)');
        linksStmt.run([profileId, links.github || '', links.linkedin || '', links.portfolio || '']);
        linksStmt.free();
      }
      
      db.run('COMMIT');
      saveDB(db);
      db.close();
      
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      db.run('ROLLBACK');
      db.close();
      throw err;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const skills = await dbAll('SELECT DISTINCT skill_name FROM skills ORDER BY skill_name');
    res.json(skills.map(s => s.skill_name));
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const { q } = req.query;
    
    let query = 'SELECT id, title, description, link FROM projects';
    let params = [];
    
    if (q) {
      query += ' WHERE title LIKE ? OR description LIKE ?';
      const searchTerm = `%${q}%`;
      params = [searchTerm, searchTerm];
    }
    
    query += ' ORDER BY created_at DESC';
    
    const projects = await dbAll(query, params);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }
    
    const searchTerm = `%${q}%`;
    const results = {
      profile: [],
      skills: [],
      projects: [],
      work: []
    };
    
    const profile = await dbGet(
      'SELECT name, email, education FROM profile WHERE name LIKE ? OR email LIKE ? OR education LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    if (profile) {
      results.profile.push(profile);
    }
    
    const skills = await dbAll(
      'SELECT DISTINCT skill_name FROM skills WHERE skill_name LIKE ?',
      [searchTerm]
    );
    results.skills = skills.map(s => s.skill_name);
    
    const projects = await dbAll(
      'SELECT id, title, description, link FROM projects WHERE title LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm]
    );
    results.projects = projects;
    
    const work = await dbAll(
      'SELECT company, position, duration, description FROM work WHERE company LIKE ? OR position LIKE ? OR description LIKE ?',
      [searchTerm, searchTerm, searchTerm]
    );
    results.work = work;
    
    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

module.exports = router;
