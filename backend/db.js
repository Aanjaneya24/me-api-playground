/**
 * Database Connection Module
 * Handles SQLite database connection and query helpers using sql.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'profile.db');
let SQL = null;

/**
 * Initialize SQL.js
 */
async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Get database connection
 * @returns {Promise<Database>} Database connection
 */
async function getDB() {
  await initDB();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    return new SQL.Database(buffer);
  }
  
  return new SQL.Database();
}

/**
 * Save database to file
 * @param {Database} db - Database instance
 */
function saveDB(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Execute a query that returns all rows
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
async function dbAll(query, params = []) {
  const db = await getDB();
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    db.close();
    return rows;
  } catch (err) {
    db.close();
    throw err;
  }
}

/**
 * Execute a query that returns a single row
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|undefined>} Single row or undefined
 */
async function dbGet(query, params = []) {
  const db = await getDB();
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    let result = undefined;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    db.close();
    return result;
  } catch (err) {
    db.close();
    throw err;
  }
}

/**
 * Execute a query that modifies data (INSERT, UPDATE, DELETE)
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Result with lastID and changes
 */
async function dbRun(query, params = []) {
  const db = await getDB();
  try {
    const stmt = db.prepare(query);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    
    // Get last insert rowid
    const lastIDStmt = db.prepare('SELECT last_insert_rowid() as id');
    lastIDStmt.step();
    const lastID = lastIDStmt.getAsObject().id;
    lastIDStmt.free();
    
    saveDB(db);
    db.close();
    
    return { lastID, changes: 1 };
  } catch (err) {
    db.close();
    throw err;
  }
}

/**
 * Execute multiple statements in a transaction
 * @param {Function} callback - Callback function that receives db instance
 * @returns {Promise<any>} Result from callback
 */
async function dbTransaction(callback) {
  const db = await getDB();
  try {
    db.run('BEGIN TRANSACTION');
    const result = await callback(db);
    db.run('COMMIT');
    saveDB(db);
    db.close();
    return result;
  } catch (err) {
    db.run('ROLLBACK');
    db.close();
    throw err;
  }
}

module.exports = {
  getDB,
  saveDB,
  dbAll,
  dbGet,
  dbRun,
  dbTransaction,
  initDB
};
