const db = require('../config/database-adapter');
const cron = require('node-cron');

class GPSSimulator {
  constructor(io) {
    this.io = io;
    this.isRunning = false;
  }

  start() {
    console.log('🛰️  Starting GPS simulator...');
    this.isRunning = true;
    
    // Update bus locations every 5 seconds
    cron.schedule('*/5 * * * * *', async () => {
      if (this.isRunning) {
        await this.updateBusLocations();
      }
    });
  }

  async updateBusLocations() {
    try {
      const result = await db.query(`
        SELECT b.*, r.route_name 
        FROM buses b
        JOIN routes r ON b.route_id = r.id
        WHERE b.is_active = true
      `);

      for (const bus of result.rows) {
        const newLocation = this.simulateMovement(bus);
        
        // Update database
        await db.query(
          `UPDATE buses 
           SET current_lat = $1, current_lng = $2, speed = $3,
               crowd_percentage = $4, last_updated = datetime('now')
           WHERE id = $5`,
          [newLocation.lat, newLocation.lng, newLocation.speed,
           newLocation.crowdPercentage, bus.id]
        );

        // Emit WebSocket update
        this.io.emit('bus:location:update', {
          busId: bus.id,
          routeId: bus.route_id,
          location: { lat: newLocation.lat, lng: newLocation.lng },
          speed: newLocation.speed,
          crowdLevel: newLocation.crowdLevel,
          crowdPercentage: newLocation.crowdPercentage,
          timestamp: Date.now()
        });

        // Save to history for ML training (disabled for now - table not required)
        // await db.query(
        //   `INSERT INTO bus_history 
        //    (bus_id, route_id, latitude, longitude, speed, crowd_percentage)
        //    VALUES ($1, $2, $3, $4, $5, $6)`,
        //   [bus.id, bus.route_id, newLocation.lat, newLocation.lng,
        //    newLocation.speed, newLocation.crowdPercentage]
        // );
      }

    } catch (error) {
      console.error('GPS simulator error:', error);
    }
  }

  simulateMovement(bus) {
    // Random walk simulation
    const latDelta = (Math.random() - 0.5) * 0.002;
    const lngDelta = (Math.random() - 0.5) * 0.002;
    
    const newLat = parseFloat(bus.current_lat) + latDelta;
    const newLng = parseFloat(bus.current_lng) + lngDelta;
    
    const speed = 15 + Math.random() * 30; // 15-45 km/h
    
    // Time-based crowd simulation
    const hour = new Date().getHours();
    let baseCrowd = 50;
    if (hour >= 8 && hour <= 10) baseCrowd = 80;
    else if (hour >= 17 && hour <= 20) baseCrowd = 85;
    
    const crowdPercentage = Math.max(20, Math.min(100, 
      baseCrowd + (Math.random() - 0.5) * 20
    ));
    
    const crowdLevel = crowdPercentage < 40 ? 'Low' : 
                       crowdPercentage < 70 ? 'Medium' : 'High';
    
    return {
      lat: newLat,
      lng: newLng,
      speed: Math.round(speed * 100) / 100,
      crowdPercentage: Math.round(crowdPercentage),
      crowdLevel
    };
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 GPS simulator stopped');
  }
}

module.exports = GPSSimulator;

