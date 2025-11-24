const express = require('express');
const router = express.Router();
const db = require('../config/database-adapter');
const redis = require('../config/redis');

// Get live tracking data for a specific bus
router.get('/:busId/live', async (req, res) => {
  try {
    const { busId } = req.params;

    // Get bus with route details
    const busQuery = `
      SELECT 
        b.id, 
        b.bus_number, 
        b.route_id,
        b.current_lat, 
        b.current_lng,
        b.speed,
        b.heading,
        b.crowd_level,
        b.crowd_percentage,
        b.last_updated,
        b.is_active,
        b.current_stop_index,
        b.eta_to_next_stop,
        r.route_name,
        r.route_number,
        r.source,
        r.destination,
        r.stops,
        r.total_distance,
        r.estimated_time,
        r.city
      FROM buses b
      JOIN routes r ON b.route_id = r.id
      WHERE b.id = $1 AND b.is_active = true
    `;

    const busResult = await db.query(busQuery, [busId]);

    if (busResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found or inactive'
      });
    }

    const bus = busResult.rows[0];

    // Parse stops
    let stops = [];
    if (bus.stops) {
      try {
        stops = typeof bus.stops === 'string' ? JSON.parse(bus.stops) : bus.stops;
      } catch (e) {
        stops = [];
      }
    }

    // Calculate journey progress
    const currentStopIndex = bus.current_stop_index || 0;
    const totalStops = stops.length;
    const progressPercentage = totalStops > 0 ? (currentStopIndex / totalStops) * 100 : 0;

    // Get next few stops
    const upcomingStops = stops.slice(currentStopIndex, currentStopIndex + 3);
    const previousStops = stops.slice(Math.max(0, currentStopIndex - 2), currentStopIndex);

    // Calculate ETA to destination
    let etaToDestination = null;
    if (bus.speed > 0 && bus.total_distance) {
      const remainingDistance = bus.total_distance * (1 - progressPercentage / 100);
      etaToDestination = Math.round((remainingDistance / bus.speed) * 60); // in minutes
    }

    // Get historical position data for trail effect
    const historyKey = `bus:${busId}:trail`;
    const trail = await redis.get(historyKey);
    const positionTrail = trail ? JSON.parse(trail) : [];

    res.json({
      success: true,
      data: {
        bus: {
          id: bus.id,
          busNumber: bus.bus_number,
          routeId: bus.route_id,
          routeName: bus.route_name,
          routeNumber: bus.route_number,
          source: bus.source,
          destination: bus.destination,
          city: bus.city
        },
        liveData: {
          position: {
            lat: parseFloat(bus.current_lat),
            lng: parseFloat(bus.current_lng),
            heading: bus.heading || 0
          },
          speed: bus.speed || 0,
          crowdLevel: bus.crowd_level,
          crowdPercentage: bus.crowd_percentage || 0,
          lastUpdated: bus.last_updated,
          isActive: bus.is_active
        },
        journey: {
          currentStopIndex,
          totalStops,
          progressPercentage,
          upcomingStops,
          previousStops,
          etaToNextStop: bus.eta_to_next_stop,
          etaToDestination,
          totalDistance: bus.total_distance,
          estimatedTime: bus.estimated_time
        },
        stops: stops.map((stop, index) => ({
          ...stop,
          isPassed: index < currentStopIndex,
          isCurrent: index === currentStopIndex,
          isUpcoming: index > currentStopIndex
        })),
        trail: positionTrail
      }
    });

  } catch (error) {
    console.error('Error fetching live tracking data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live tracking data'
    });
  }
});

// Get live tracking for multiple buses on a route
router.get('/route/:routeId/live', async (req, res) => {
  try {
    const { routeId } = req.params;

    const query = `
      SELECT 
        b.id,
        b.bus_number,
        b.current_lat,
        b.current_lng,
        b.speed,
        b.heading,
        b.crowd_level,
        b.current_stop_index,
        b.last_updated
      FROM buses b
      WHERE b.route_id = $1 AND b.is_active = true
      ORDER BY b.current_stop_index DESC
    `;

    const result = await db.query(query, [routeId]);

    res.json({
      success: true,
      data: result.rows.map(bus => ({
        id: bus.id,
        busNumber: bus.bus_number,
        position: {
          lat: parseFloat(bus.current_lat),
          lng: parseFloat(bus.current_lng)
        },
        speed: bus.speed || 0,
        heading: bus.heading || 0,
        crowdLevel: bus.crowd_level,
        currentStopIndex: bus.current_stop_index,
        lastUpdated: bus.last_updated
      })),
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching route live tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route live tracking'
    });
  }
});

// Update bus position (for simulation/testing)
router.post('/:busId/update-position', async (req, res) => {
  try {
    const { busId } = req.params;
    const { lat, lng, speed, heading, currentStopIndex } = req.body;

    const updateQuery = `
      UPDATE buses
      SET 
        current_lat = $1,
        current_lng = $2,
        speed = $3,
        heading = $4,
        current_stop_index = $5,
        last_updated = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      lat, 
      lng, 
      speed || 0, 
      heading || 0,
      currentStopIndex || 0,
      busId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Store position in trail for historical tracking
    const historyKey = `bus:${busId}:trail`;
    const trail = await redis.get(historyKey) || '[]';
    const positions = JSON.parse(trail);
    
    positions.push({
      lat,
      lng,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 positions
    if (positions.length > 50) {
      positions.shift();
    }

    await redis.setex(historyKey, 300, JSON.stringify(positions)); // 5 minutes TTL

    // Emit update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`bus:${busId}`).emit('busPositionUpdate', {
        busId,
        position: { lat, lng },
        speed,
        heading,
        currentStopIndex,
        timestamp: new Date().toISOString()
      });

      // Also emit to route room
      const bus = result.rows[0];
      io.to(`route:${bus.route_id}`).emit('routeBusUpdate', {
        busId,
        busNumber: bus.bus_number,
        position: { lat, lng },
        speed,
        heading,
        currentStopIndex
      });
    }

    res.json({
      success: true,
      message: 'Position updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating bus position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update position'
    });
  }
});

module.exports = router;