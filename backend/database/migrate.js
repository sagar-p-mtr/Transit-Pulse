const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Check if .env exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  console.log('');
  console.log('📝 Please create a .env file in the backend/ folder');
  console.log('📝 Copy from .env.example and add your PostgreSQL password');
  console.log('');
  console.log('Example .env content:');
  console.log('-------------------');
  console.log('DB_HOST=localhost');
  console.log('DB_PORT=5432');
  console.log('DB_NAME=whereismybus');
  console.log('DB_USER=postgres');
  console.log('DB_PASSWORD=yourpassword   ← PUT YOUR POSTGRES PASSWORD HERE!');
  console.log('');
  process.exit(1);
}

// Check if password is set
if (!process.env.DB_PASSWORD) {
  console.error('❌ ERROR: DB_PASSWORD not set in .env file!');
  console.log('');
  console.log('📝 Open backend/.env file');
  console.log('📝 Add this line: DB_PASSWORD=yourpassword');
  console.log('📝 Replace "yourpassword" with your actual PostgreSQL password');
  console.log('');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'whereismybus',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD), // Ensure it's a string
});

async function migrate() {
  console.log('🚀 Running database migrations...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await pool.query(schema);

    console.log('\n✅ Migrations completed successfully!');
    console.log('📊 Database tables created');
    console.log('🚌 Sample data inserted\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();

