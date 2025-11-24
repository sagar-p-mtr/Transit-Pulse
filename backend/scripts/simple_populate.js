const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bmtc_realtime',
  password: '123',
  port: 5432,
});

async function populateData() {
  try {
    console.log('🚀 Populating Bus Buddy AI with sample data...\n');

    // Insert demo user
    console.log('👤 Creating demo user...');
    await pool.query(`
      INSERT INTO users (id, phone_number, email, name, wallet_balance, created_at)
      VALUES ('00000000-0000-0000-0000-000000000001', '9999999999', 'demo@whereismybus.com', 'Demo User', 100.00, NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Insert bus routes
    console.log('🚌 Adding bus routes...');
    const routes = [
      ['bmtc-335E', 'Kengeri to Whitefield', 'Kengeri Bus Stand', 'Whitefield ITPL', 25.5, 90, 'every 15 minutes'],
      ['bmtc-500A', 'Majestic to Electronic City', 'Majestic Bus Stand', 'Electronic City', 18.2, 75, 'every 10 minutes'],
      ['bmtc-201', 'Koramangala to Airport', 'Koramangala', 'Kempegowda Airport', 35.8, 120, 'every 20 minutes'],
      ['bmtc-171', 'Banashankari to Marathahalli', 'Banashankari', 'Marathahalli', 22.3, 85, 'every 12 minutes'],
      ['bmtc-401', 'Hebbal to Silk Board', 'Hebbal', 'Silk Board', 28.7, 95, 'every 8 minutes'],
      ['bmtc-600', 'Yeshwanthpur to KR Puram', 'Yeshwanthpur', 'KR Puram', 31.2, 110, 'every 18 minutes']
    ];

    for (const route of routes) {
      await pool.query(`
        INSERT INTO bus_routes (id, name, from_stop, to_stop, distance, duration, frequency, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          from_stop = EXCLUDED.from_stop,
          to_stop = EXCLUDED.to_stop,
          distance = EXCLUDED.distance,
          duration = EXCLUDED.duration,
          frequency = EXCLUDED.frequency
      `, route);
    }

    // Insert bus stops
    console.log('🚏 Adding bus stops...');
    const stops = [
      ['stop-001', 'Kengeri Bus Stand', 12.9067, 77.4877, 'Bangalore'],
      ['stop-002', 'Whitefield ITPL', 12.9698, 77.7500, 'Bangalore'],
      ['stop-003', 'Majestic Bus Stand', 12.9774, 77.5706, 'Bangalore'],
      ['stop-004', 'Electronic City', 12.8456, 77.6603, 'Bangalore'],
      ['stop-005', 'Koramangala', 12.9352, 77.6245, 'Bangalore'],
      ['stop-006', 'Banashankari', 12.9252, 77.5654, 'Bangalore'],
      ['stop-007', 'Marathahalli', 12.9581, 77.6964, 'Bangalore'],
      ['stop-008', 'Hebbal', 12.9784, 77.5943, 'Bangalore'],
      ['stop-009', 'Silk Board', 12.9172, 77.6231, 'Bangalore'],
      ['stop-010', 'Yeshwanthpur', 12.9716, 77.5942, 'Bangalore'],
      ['stop-011', 'KR Puram', 12.9981, 77.6981, 'Bangalore'],
      ['stop-012', 'Kempegowda Airport', 13.1986, 77.7063, 'Bangalore']
    ];

    for (const stop of stops) {
      await pool.query(`
        INSERT INTO bus_stops (id, name, latitude, longitude, city, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          city = EXCLUDED.city
      `, stop);
    }

    // Insert commute patterns
    console.log('📈 Adding commute patterns...');
    const patterns = [
      ['pattern-001', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-001', 'stop-002', '08:00:00', '09:30:00', 'monday', 'daily'],
      ['pattern-002', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-001', 'stop-002', '08:00:00', '09:30:00', 'tuesday', 'daily'],
      ['pattern-003', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-001', 'stop-002', '08:00:00', '09:30:00', 'wednesday', 'daily'],
      ['pattern-004', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-001', 'stop-002', '08:00:00', '09:30:00', 'thursday', 'daily'],
      ['pattern-005', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-001', 'stop-002', '08:00:00', '09:30:00', 'friday', 'daily'],
      ['pattern-006', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-002', 'stop-001', '18:30:00', '20:00:00', 'monday', 'daily'],
      ['pattern-007', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-002', 'stop-001', '18:30:00', '20:00:00', 'tuesday', 'daily'],
      ['pattern-008', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-002', 'stop-001', '18:30:00', '20:00:00', 'wednesday', 'daily'],
      ['pattern-009', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-002', 'stop-001', '18:30:00', '20:00:00', 'thursday', 'daily'],
      ['pattern-010', '00000000-0000-0000-0000-000000000001', 'bmtc-335E', 'stop-002', 'stop-001', '18:30:00', '20:00:00', 'friday', 'daily']
    ];

    for (const pattern of patterns) {
      await pool.query(`
        INSERT INTO user_commute_patterns (id, user_id, route_id, from_stop_id, to_stop_id, departure_time, arrival_time, day_of_week, frequency, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (id) DO UPDATE SET
          route_id = EXCLUDED.route_id,
          from_stop_id = EXCLUDED.from_stop_id,
          to_stop_id = EXCLUDED.to_stop_id,
          departure_time = EXCLUDED.departure_time,
          arrival_time = EXCLUDED.arrival_time,
          day_of_week = EXCLUDED.day_of_week,
          frequency = EXCLUDED.frequency
      `, pattern);
    }

    // Insert user preferences
    console.log('⚙️ Adding user preferences...');
    await pool.query(`
      INSERT INTO user_commute_preferences (id, user_id, preferred_routes, preferred_times, avoid_crowded_routes, weather_awareness, notifications_enabled, created_at)
      VALUES ('pref-001', '00000000-0000-0000-0000-000000000001', '["bmtc-335E", "bmtc-500A", "bmtc-201"]', '["08:00", "18:30"]', false, true, true, NOW())
      ON CONFLICT (id) DO UPDATE SET
        preferred_routes = EXCLUDED.preferred_routes,
        preferred_times = EXCLUDED.preferred_times,
        avoid_crowded_routes = EXCLUDED.avoid_crowded_routes,
        weather_awareness = EXCLUDED.weather_awareness,
        notifications_enabled = EXCLUDED.notifications_enabled
    `);

    // Insert AI suggestions
    console.log('💡 Adding AI suggestions...');
    const suggestions = [
      ['suggestion-001', '00000000-0000-0000-0000-000000000001', 'route_optimization', 'Try Route 500A for faster morning commute', 'Route 500A typically takes 75 minutes vs 90 minutes on your current route. Save 15 minutes daily!', 'bmtc-500A', 75, 0.85],
      ['suggestion-002', '00000000-0000-0000-0000-000000000001', 'time_optimization', 'Leave 15 minutes earlier for less crowded bus', 'Taking the 7:45 AM bus instead of 8:00 AM can save you 20 minutes due to lighter traffic.', 'bmtc-335E', 70, 0.90],
      ['suggestion-003', '00000000-0000-0000-0000-000000000001', 'weather_alert', 'Rain expected tomorrow - plan extra time', 'Heavy rain predicted for your morning commute. Consider leaving 30 minutes earlier and bring an umbrella.', 'bmtc-335E', 120, 0.95],
      ['suggestion-004', '00000000-0000-0000-0000-000000000001', 'crowd_optimization', 'High crowd expected on your route', 'Route 335E is expected to be 85% full during your commute time. Consider Route 500A instead.', 'bmtc-500A', 75, 0.82],
      ['suggestion-005', '00000000-0000-0000-0000-000000000001', 'cost_optimization', 'Monthly pass can save you ₹200', 'Based on your daily commute, a monthly pass would save you ₹200 compared to daily tickets.', 'bmtc-335E', 90, 0.95]
    ];

    for (const suggestion of suggestions) {
      await pool.query(`
        INSERT INTO commute_suggestions (id, user_id, suggestion_type, title, description, route_id, estimated_time, confidence_score, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          suggestion_type = EXCLUDED.suggestion_type,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          route_id = EXCLUDED.route_id,
          estimated_time = EXCLUDED.estimated_time,
          confidence_score = EXCLUDED.confidence_score
      `, suggestion);
    }

    // Verify data
    console.log('\n🔍 Verifying data...');
    const routesCount = await pool.query('SELECT COUNT(*) FROM bus_routes');
    const stopsCount = await pool.query('SELECT COUNT(*) FROM bus_stops');
    const patternsCount = await pool.query('SELECT COUNT(*) FROM user_commute_patterns');
    const suggestionsCount = await pool.query('SELECT COUNT(*) FROM commute_suggestions');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');

    console.log('\n📊 Database Summary:');
    console.log(`   👥 Users: ${usersCount.rows[0].count}`);
    console.log(`   🚌 Bus Routes: ${routesCount.rows[0].count}`);
    console.log(`   🚏 Bus Stops: ${stopsCount.rows[0].count}`);
    console.log(`   📈 Commute Patterns: ${patternsCount.rows[0].count}`);
    console.log(`   💡 AI Suggestions: ${suggestionsCount.rows[0].count}`);

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
populateData();
