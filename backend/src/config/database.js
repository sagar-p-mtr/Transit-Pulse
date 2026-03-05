const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite database file path
const dbPath = process.env.DB_PATH || path.join(dbDir, 'whereismybus.db');

// Initialize SQLite database
let db = null;

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize database connection
function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database:', dbPath);
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
      }
    });
  }
  return db;
}

// Initialize connection
getDb();

// Wrapper to make SQLite compatible with PostgreSQL query interface
module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        const database = getDb();
        
        // Convert PostgreSQL-style placeholders/casts to SQLite friendly SQL
        let sql = text;
        const sqliteParams = [];

        // Strip Postgres-style casts (e.g. ::decimal) which SQLite doesn't understand
        sql = sql.replace(/::\w+/g, '');

        // Replace $1, $2... placeholders with ? and build params in order
        if (/\$\d+/.test(sql)) {
          sql = sql.replace(/\$(\d+)/g, (match, num) => {
            const index = parseInt(num, 10) - 1;
            sqliteParams.push(params[index]);
            return '?';
          });
        } else {
          sqliteParams.push(...params);
        }

        // Normalize boolean literals for SQLite
        sql = sql.replace(/\btrue\b/gi, '1').replace(/\bfalse\b/gi, '0');

        // Determine if it's a SELECT query or modification query
        const normalizedSql = sql.trim().toUpperCase();
        const isSelect = normalizedSql.startsWith('SELECT');
        const isInsert = normalizedSql.startsWith('INSERT');
        const hasReturning = /RETURNING/i.test(sql);

        if (isSelect) {
          database.all(sql, sqliteParams, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows: rows || [] });
          });
        } else if (isInsert && hasReturning) {
          // Handle INSERT with RETURNING
          const insertSql = sql.replace(/RETURNING.*$/i, '');
          const returningMatch = sql.match(/RETURNING\s+(.+)/i);
          
          database.run(insertSql, sqliteParams, function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            if (returningMatch && this.lastID) {
              const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
              if (tableMatch) {
                const tableName = tableMatch[1];
                const selectSql = `SELECT ${returningMatch[1]} FROM ${tableName} WHERE rowid = ?`;
                database.get(selectSql, [this.lastID], (err, row) => {
                  if (err) reject(err);
                  else resolve({ rows: row ? [row] : [] });
                });
              } else {
                resolve({ rows: [] });
              }
            } else {
              resolve({ rows: [] });
            }
          });
        } else {
          // For UPDATE, DELETE, INSERT without RETURNING
          database.run(sql, sqliteParams, function(err) {
            if (err) reject(err);
            else resolve({ 
              rows: [],
              rowCount: this.changes,
              lastInsertRowid: this.lastID
            });
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // For backward compatibility
  pool: {
    end: (callback) => {
      if (db) {
        db.close((err) => {
          if (callback) callback(err);
        });
      }
      return Promise.resolve();
    }
  },
  
  // Direct database access for migrations
  get db() {
    return getDb();
  }
};

