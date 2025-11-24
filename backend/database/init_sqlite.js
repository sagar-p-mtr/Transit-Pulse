/**
 * Initialize SQLite Database
 * Run this script to create the database schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dbDir, 'whereismybus.db');

// Helper function to generate UUID (for use in INSERT statements)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

console.log('📦 Initializing SQLite database...');

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema_sqlite.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Replace gen_random_uuid() calls with actual UUID generation
const schemaWithUUIDs = schema.replace(/gen_random_uuid\(\)/g, () => `'${generateUUID()}'`);

// Split by semicolons and execute each statement
const statements = schemaWithUUIDs
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let completed = 0;
const total = statements.length;

statements.forEach((statement, index) => {
  if (statement.length === 0) return;
  
  db.run(statement + ';', (err) => {
    if (err) {
      // Ignore "already exists" errors for tables/indexes
      if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
        console.error(`Error executing statement ${index + 1}:`, err.message);
        console.error('Statement:', statement.substring(0, 100));
      }
    }
    
    completed++;
    if (completed === total) {
      console.log('✅ Database schema initialized successfully!');
      console.log('📁 Database file:', dbPath);
      db.close();
    }
  });
});

// Handle case where all statements complete quickly
if (statements.length === 0) {
  console.log('✅ Database schema initialized successfully!');
  console.log('📁 Database file:', dbPath);
  db.close();
}

