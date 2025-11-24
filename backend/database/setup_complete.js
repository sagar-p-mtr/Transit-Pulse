/**
 * Complete Database Setup - Creates schema and populates with sample data
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

console.log('📦 Setting up SQLite database...\n');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create all tables in sequence
db.serialize(() => {
  console.log('🔨 Creating tables...\n');
  
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone_number TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      wallet_balance REAL DEFAULT 0.00,
      fcm_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Routes table
  db.run(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      route_name TEXT NOT NULL,
      route_number TEXT NOT NULL,
      city TEXT NOT NULL,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      via TEXT,
      frequency TEXT,
      stops TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bus stops table
  db.run(`
    CREATE TABLE IF NOT EXISTS bus_stops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      city TEXT NOT NULL,
      amenities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Buses table
  db.run(`
    CREATE TABLE IF NOT EXISTS buses (
      id TEXT PRIMARY KEY,
      bus_number TEXT NOT NULL,
      route_id TEXT REFERENCES routes(id),
      current_lat REAL,
      current_lng REAL,
      speed REAL DEFAULT 0,
      crowd_level TEXT CHECK (crowd_level IN ('Low', 'Medium', 'High')),
      crowd_percentage INTEGER CHECK (crowd_percentage >= 0 AND crowd_percentage <= 100),
      is_active INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating buses table:', err);
      return;
    }
    
    console.log('✅ Tables created successfully\n');
    console.log('🚀 Populating with sample data...\n');
    
    // Insert routes
    console.log('🚌 Adding routes...');
    const routes = [
      ['bmtc-335E', 'Kengeri to Whitefield', '335E', 'Bangalore', 'Kengeri', 'Whitefield', 'Via Koramangala', 'Every 15 min', '[]'],
      ['bmtc-500C', 'Shivajinagar to Electronic City', '500C', 'Bangalore', 'Shivajinagar', 'Electronic City', 'Via Silk Board', 'Every 10 min', '[]'],
      ['bmtc-G4', 'Yeswanthpur to KR Market', 'G4', 'Bangalore', 'Yeswanthpur', 'KR Market', 'Via Rajajinagar', 'Every 20 min', '[]'],
    ];

    const insertRoute = db.prepare(`
      INSERT OR REPLACE INTO routes 
      (id, route_name, route_number, city, source, destination, via, frequency, stops)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    routes.forEach(route => {
      insertRoute.run(route);
    });

    insertRoute.finalize();
    console.log(`   ✅ Added ${routes.length} routes`);
    
    // Insert stops
    console.log('🚏 Adding bus stops...');
    const stops = [
      ['stop-001', 'Kengeri Bus Stand', 12.9067, 77.4877, 'Bangalore', '{}'],
      ['stop-002', 'Whitefield ITPL', 12.9698, 77.7500, 'Bangalore', '{}'],
      ['stop-003', 'Shivajinagar', 12.9774, 77.5706, 'Bangalore', '{}'],
      ['stop-004', 'Electronic City', 12.8456, 77.6603, 'Bangalore', '{}'],
      ['stop-005', 'Yeswanthpur', 12.9716, 77.5942, 'Bangalore', '{}'],
      ['stop-006', 'KR Market', 12.9634, 77.5855, 'Bangalore', '{}'],
    ];

    const insertStop = db.prepare(`
      INSERT OR REPLACE INTO bus_stops 
      (id, name, latitude, longitude, city, amenities)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stops.forEach(stop => {
      insertStop.run(stop);
    });

    insertStop.finalize();
    console.log(`   ✅ Added ${stops.length} stops`);
    
    // Insert buses
    console.log('🚍 Adding buses...');
    const buses = [
      ['KA01-1234', 'KA-01-AB-1234', 'bmtc-335E', 12.9716, 77.5946, 25.5, 'Medium', 50, 1],
      ['KA01-5678', 'KA-01-CD-5678', 'bmtc-500C', 12.9789, 77.5917, 30.2, 'Low', 30, 1],
      ['KA01-9012', 'KA-01-EF-9012', 'bmtc-G4', 12.9853, 77.5892, 20.8, 'High', 85, 1],
    ];

    const insertBus = db.prepare(`
      INSERT OR REPLACE INTO buses 
      (id, bus_number, route_id, current_lat, current_lng, speed, crowd_level, crowd_percentage, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    buses.forEach(bus => {
      insertBus.run(bus);
    });

    insertBus.finalize(() => {
      console.log(`   ✅ Added ${buses.length} buses\n`);
      
      // Verify data
      console.log('📊 Database Summary:');
      db.get('SELECT COUNT(*) as count FROM routes', (err, row) => {
        if (!err) console.log(`   🚌 Routes: ${row.count}`);
      });
      
      db.get('SELECT COUNT(*) as count FROM buses', (err, row) => {
        if (!err) console.log(`   🚍 Buses: ${row.count}`);
      });
      
      db.get('SELECT COUNT(*) as count FROM bus_stops', (err, row) => {
        if (!err) {
          console.log(`   🚏 Stops: ${row.count}`);
          
          console.log('\n🎉 Database setup complete!');
          console.log('\n💡 You can now search for these buses in "Where is My Bus?":');
          console.log('   • KA-01-AB-1234 (or just "1234")');
          console.log('   • KA-01-CD-5678 (or just "5678")');
          console.log('   • KA-01-EF-9012 (or just "9012")');
          console.log('\n📁 Database location:', dbPath);
          
          db.close();
        }
      });
    });
  });
});
