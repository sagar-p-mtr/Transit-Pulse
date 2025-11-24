const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bmtc_realtime',
  password: process.env.DB_PASSWORD || '123',
  port: process.env.DB_PORT || 5432,
});

async function createDatabase() {
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default postgres database
    password: process.env.DB_PASSWORD || '123',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🔧 Creating database...');
    await adminPool.query('CREATE DATABASE bmtc_realtime');
    console.log('✅ Database created successfully');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️ Database already exists');
    } else {
      console.error('❌ Error creating database:', error.message);
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}

async function setupTables() {
  try {
    console.log('📋 Setting up database tables...');
    const setupSQL = fs.readFileSync(path.join(__dirname, '../database/setup_database.sql'), 'utf8');
    await pool.query(setupSQL);
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error setting up tables:', error.message);
    throw error;
  }
}

async function populateData() {
  try {
    console.log('📊 Populating database with sample data...');
    const populateSQL = fs.readFileSync(path.join(__dirname, '../database/populate_with_kaggle_data.sql'), 'utf8');
    await pool.query(populateSQL);
    console.log('✅ Database populated successfully');
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
    throw error;
  }
}

async function verifyData() {
  try {
    console.log('🔍 Verifying data...');
    
    const routesCount = await pool.query('SELECT COUNT(*) FROM bus_routes');
    const stopsCount = await pool.query('SELECT COUNT(*) FROM bus_stops');
    const patternsCount = await pool.query('SELECT COUNT(*) FROM user_commute_patterns');
    const suggestionsCount = await pool.query('SELECT COUNT(*) FROM commute_suggestions');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');

    console.log('📊 Database Summary:');
    console.log(`   👥 Users: ${usersCount.rows[0].count}`);
    console.log(`   🚌 Bus Routes: ${routesCount.rows[0].count}`);
    console.log(`   🚏 Bus Stops: ${stopsCount.rows[0].count}`);
    console.log(`   📈 Commute Patterns: ${patternsCount.rows[0].count}`);
    console.log(`   💡 AI Suggestions: ${suggestionsCount.rows[0].count}`);
    
    console.log('✅ Data verification completed');
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Bus Buddy AI Database Setup...\n');
    
    // Step 1: Create database
    await createDatabase();
    
    // Step 2: Setup tables
    await setupTables();
    
    // Step 3: Populate with data
    await populateData();
    
    // Step 4: Verify data
    await verifyData();
    
    console.log('\n🎉 Bus Buddy AI Database Setup Complete!');
    console.log('🌟 Your Bus Buddy AI is now ready with realistic data!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start your backend server: npm start');
    console.log('   2. Start your frontend: npm run dev');
    console.log('   3. Click the 🧠 Bus Buddy AI button to see the magic!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { createDatabase, setupTables, populateData, verifyData };
