import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setSearchQuery('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(`Failed to load profile: ${err.message}. Make sure the backend server is running on port 3000.`);
    } finally {
      setLoading(false);
    }
  };

  const searchProjects = async (query) => {
    if (!query.trim()) {
      loadProfile();
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const projects = await response.json();
      setSearchResults(projects);
    } catch (err) {
      setError(`Failed to search projects: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProjects(searchQuery);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={loadProfile} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Me-API Playground</h1>
        <p className="subtitle">Interactive Profile Viewer</p>
        <div className="api-info">
          <span className="api-label">API Endpoint:</span>
          <code className="api-url">{API_BASE_URL}</code>
        </div>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button" 
            className="clear-btn"
            onClick={loadProfile}
          >
            Clear
          </button>
        </form>
      </div>

      {searchResults ? (
        <SearchResults results={searchResults} query={searchQuery} onClear={loadProfile} />
      ) : (
        profile && <ProfileDisplay profile={profile} />
      )}

      <footer className="footer">
        <p>Built for internship assessment | Powered by Express + SQLite + React</p>
      </footer>
    </div>
  );
}

function ProfileDisplay({ profile }) {
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="profile-content">
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <p> {profile.email}</p>
          </div>
        </div>
        
        {profile.education && (
          <div className="section">
            <h3> Education</h3>
            <p>{profile.education}</p>
          </div>
        )}
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className="section">
          <h3>Skills</h3>
          <div className="skills-grid">
            {profile.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {profile.projects && profile.projects.length > 0 && (
        <div className="section">
          <h3>Projects</h3>
          <div className="projects-grid">
            {profile.projects.map((project, index) => (
              <div key={index} className="project-card">
                <h4>{project.title}</h4>
                <p>{project.description || 'No description available'}</p>
                {project.link && (
                  <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.work && profile.work.length > 0 && (
        <div className="section">
          <h3>Work Experience</h3>
          {profile.work.map((work, index) => (
            <div key={index} className="work-item">
              <h4>{work.position}</h4>
              <div className="work-company">{work.company}</div>
              <div className="work-duration">{work.duration || ''}</div>
              <p>{work.description || ''}</p>
            </div>
          ))}
        </div>
      )}

      {profile.links && (profile.links.github || profile.links.linkedin || profile.links.portfolio) && (
        <div className="section">
          <h3>Links</h3>
          <div className="links-section">
            {profile.links.github && (
              <a href={profile.links.github} className="link-button" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {profile.links.linkedin && (
              <a href={profile.links.linkedin} className="link-button" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {profile.links.portfolio && (
              <a href={profile.links.portfolio} className="link-button" target="_blank" rel="noopener noreferrer">
                Portfolio
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, query, onClear }) {
  if (results.length === 0) {
    return (
      <div className="no-results">
        <h3>No projects found for "{query}"</h3>
        <p>
          Try a different search term or{' '}
          <button onClick={onClear} className="link-btn">view all projects</button>
        </p>
      </div>
    );
  }

  return (
    <div className="section">
      <h3>Search Results for "{query}"</h3>
      <p style={{ marginBottom: '20px', color: '#666' }}>Found {results.length} project(s)</p>
      <div className="projects-grid">
        {results.map((project, index) => (
          <div key={index} className="project-card">
            <h4>{project.title}</h4>
            <p>{project.description || 'No description available'}</p>
            {project.link && (
              <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App
