/**
 * Populate SQLite Database with Sample Data
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/whereismybus.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Populating database with sample data...\n');

// Sample data
const routes = [
  ['bmtc-335E', 'Kengeri to Whitefield', '335E', 'Bangalore', 'Kengeri', 'Whitefield', 'Via Koramangala', 'Every 15 min', '[]'],
  ['bmtc-500C', 'Shivajinagar to Electronic City', '500C', 'Bangalore', 'Shivajinagar', 'Electronic City', 'Via Silk Board', 'Every 10 min', '[]'],
  ['bmtc-G4', 'Yeswanthpur to KR Market', 'G4', 'Bangalore', 'Yeswanthpur', 'KR Market', 'Via Rajajinagar', 'Every 20 min', '[]'],
];

const buses = [
  ['KA01-1234', 'KA-01-AB-1234', 'bmtc-335E', 12.9716, 77.5946, 25.5, 'Medium', 50, 1],
  ['KA01-5678', 'KA-01-CD-5678', 'bmtc-500C', 12.9789, 77.5917, 30.2, 'Low', 30, 1],
  ['KA01-9012', 'KA-01-EF-9012', 'bmtc-G4', 12.9853, 77.5892, 20.8, 'High', 85, 1],
];

const stops = [
  ['stop-001', 'Kengeri Bus Stand', 12.9067, 77.4877, 'Bangalore', '{}'],
  ['stop-002', 'Whitefield ITPL', 12.9698, 77.7500, 'Bangalore', '{}'],
  ['stop-003', 'Shivajinagar', 12.9774, 77.5706, 'Bangalore', '{}'],
  ['stop-004', 'Electronic City', 12.8456, 77.6603, 'Bangalore', '{}'],
  ['stop-005', 'Yeswanthpur', 12.9716, 77.5942, 'Bangalore', '{}'],
  ['stop-006', 'KR Market', 12.9634, 77.5855, 'Bangalore', '{}'],
];

// Insert routes
console.log('🚌 Adding routes...');
const insertRoute = db.prepare(`
  INSERT OR REPLACE INTO routes 
  (id, route_name, route_number, city, source, destination, via, frequency, stops, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
`);

routes.forEach(route => {
  insertRoute.run(route, (err) => {
    if (err) console.error('Error inserting route:', err);
  });
});

insertRoute.finalize(() => {
  console.log(`   ✅ Added ${routes.length} routes\n`);
  
  // Insert stops
  console.log('🚏 Adding bus stops...');
  const insertStop = db.prepare(`
    INSERT OR REPLACE INTO bus_stops 
    (id, name, latitude, longitude, city, amenities, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stops.forEach(stop => {
    insertStop.run(stop, (err) => {
      if (err) console.error('Error inserting stop:', err);
    });
  });

  insertStop.finalize(() => {
    console.log(`   ✅ Added ${stops.length} stops\n`);
    
    // Insert buses
    console.log('🚍 Adding buses...');
    const insertBus = db.prepare(`
      INSERT OR REPLACE INTO buses 
      (id, bus_number, route_id, current_lat, current_lng, speed, crowd_level, crowd_percentage, is_active, last_updated, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    buses.forEach(bus => {
      insertBus.run(bus, (err) => {
        if (err) console.error('Error inserting bus:', err);
      });
    });

    insertBus.finalize(() => {
      console.log(`   ✅ Added ${buses.length} buses\n`);
      
      // Verify data
      db.get('SELECT COUNT(*) as count FROM routes', (err, row) => {
        if (!err) console.log(`📊 Total routes: ${row.count}`);
      });
      
      db.get('SELECT COUNT(*) as count FROM buses', (err, row) => {
        if (!err) console.log(`📊 Total buses: ${row.count}`);
      });
      
      db.get('SELECT COUNT(*) as count FROM bus_stops', (err, row) => {
        if (!err) console.log(`📊 Total stops: ${row.count}`);
        
        console.log('\n🎉 Database populated successfully!');
        console.log('\n💡 You can now search for these buses:');
        console.log('   • KA-01-AB-1234 (or just "1234")');
        console.log('   • KA-01-CD-5678 (or just "5678")');
        console.log('   • KA-01-EF-9012 (or just "9012")');
        
        db.close();
      });
    });
  });
});
