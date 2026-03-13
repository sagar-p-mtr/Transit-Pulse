const express = require('express');
const router = express.Router();
const db = require('../config/database-adapter');
const redis = require('../config/redis');

// Get all active buses
router.get('/', async (req, res) => {
  try {
    const { city, routeId } = req.query;

    const cacheKey = `buses:${city || 'all'}:${routeId || 'all'}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }

    let query = `
      SELECT 
        b.id, b.bus_number, b.route_id, r.route_name,
        b.current_lat, b.current_lng, b.speed,
        b.crowd_level, b.crowd_percentage,
        b.last_updated, r.city
      FROM buses b
      JOIN routes r ON b.route_id = r.id
      WHERE b.is_active = 1
    `;
    
    const params = [];
    
    if (city) {
      params.push(city);
      query += ` AND r.city = $${params.length}`;
    }
    
    if (routeId) {
      params.push(routeId);
      query += ` AND b.route_id = $${params.length}`;
    }

    query += ' ORDER BY b.last_updated DESC';

    const result = await db.query(query, params);

    await redis.setex(cacheKey, 10, JSON.stringify(result.rows));

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch buses' 
    });
  }
});

// Get routes - MUST come before /:busId to avoid route conflicts
router.get('/routes/all', async (req, res) => {
  try {
    const { city } = req.query;

    let query = 'SELECT * FROM routes WHERE 1=1';
    const params = [];

    if (city) {
      params.push(city);
      query += ` AND city = $${params.length}`;
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routes'
    });
  }
});

// Search bus by bus number (for "Transit Pulse" feature)
// MUST come before /:busId to avoid route conflicts
router.get('/search/:busNumber', async (req, res) => {
  try {
    const { busNumber } = req.params;

    const cacheKey = `bus:search:${busNumber}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }

    const result = await db.query(
      `SELECT 
        b.id, b.bus_number, b.route_id, r.route_name, r.route_number,
        b.current_lat, b.current_lng, b.speed,
        b.crowd_level, b.crowd_percentage,
        b.last_updated, r.city, r.source, r.destination, r.stops
          FROM buses b
          JOIN routes r ON b.route_id = r.id
          WHERE b.bus_number LIKE $1 AND b.is_active = 1
          ORDER BY b.last_updated DESC
          LIMIT 5`,
      [`%${busNumber}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await redis.setex(cacheKey, 5, JSON.stringify(result.rows));

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });

  } catch (error) {
    console.error('Error searching bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search bus'
    });
  }
});

// Get current stop/station for a bus
router.get('/:busId/current-stop', async (req, res) => {
  try {
    const { busId } = req.params;

    // Get bus location and route info
    const busResult = await db.query(
      `SELECT 
        b.id, b.bus_number, b.current_lat, b.current_lng, 
        r.id as route_id, r.route_name, r.stops, r.source, r.destination
      FROM buses b
      JOIN routes r ON b.route_id = r.id
      WHERE b.id = $1 AND b.is_active = true`,
      [busId]
    );

    if (busResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const bus = busResult.rows[0];
    const busLat = parseFloat(bus.current_lat);
    const busLng = parseFloat(bus.current_lng);

    // Parse stops from JSONB
    let stops = [];
    if (bus.stops) {
      try {
        stops = typeof bus.stops === 'string' ? JSON.parse(bus.stops) : bus.stops;
      } catch (e) {
        stops = Array.isArray(bus.stops) ? bus.stops : [];
      }
    }

    // Find nearest stop
    let nearestStop = null;
    let minDistance = Infinity;

    for (const stop of stops) {
      if (stop.latitude && stop.longitude) {
        const stopLat = parseFloat(stop.latitude);
        const stopLng = parseFloat(stop.longitude);
        
        // Calculate distance (Haversine formula simplified for small distances)
        const latDiff = (busLat - stopLat) * 111; // ~111 km per degree
        const lngDiff = (busLng - stopLng) * 111 * Math.cos(stopLat * Math.PI / 180);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 1000; // in meters

        if (distance < minDistance && distance < 500) { // Within 500m
          minDistance = distance;
          nearestStop = {
            ...stop,
            distance: Math.round(distance),
            isAtStop: distance < 50 // Consider "at stop" if within 50m
          };
        }
      }
    }

    // If no nearby stop found, query bus_stops table
    if (!nearestStop && busLat && busLng) {
      const stopResult = await db.query(
        `SELECT 
          id, name, latitude, longitude,
          (
            111 * sqrt(
              pow($1::decimal - latitude, 2) + 
              pow(($2::decimal - longitude) * cos(latitude * pi() / 180), 2)
            ) * 1000
          ) as distance
        FROM bus_stops
        WHERE city = $3
        ORDER BY distance
        LIMIT 1`,
        [busLat, busLng, bus.city || 'Bangalore']
      );

      if (stopResult.rows.length > 0 && stopResult.rows[0].distance < 500) {
        nearestStop = {
          id: stopResult.rows[0].id,
          name: stopResult.rows[0].name,
          latitude: stopResult.rows[0].latitude,
          longitude: stopResult.rows[0].longitude,
          distance: Math.round(parseFloat(stopResult.rows[0].distance)),
          isAtStop: parseFloat(stopResult.rows[0].distance) < 50
        };
      }
    }

    res.json({
      success: true,
      data: {
        bus: {
          id: bus.id,
          bus_number: bus.bus_number,
          current_lat: bus.current_lat,
          current_lng: bus.current_lng,
          route_name: bus.route_name,
          route_id: bus.route_id,
          source: bus.source,
          destination: bus.destination
        },
        currentStop: nearestStop,
        status: nearestStop?.isAtStop ? 'At Station' : nearestStop ? 'Approaching Station' : 'In Transit'
      }
    });

  } catch (error) {
    console.error('Error fetching current stop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current stop'
    });
  }
});

// Get upcoming stops with ETAs for a specific bus
router.get('/:busId/upcoming-stops', async (req, res) => {
  try {
    const { busId } = req.params;

    // Get bus location and route info
    const busResult = await db.query(
      `SELECT 
        b.id, b.bus_number, b.current_lat, b.current_lng, b.speed,
        r.id as route_id, r.route_name, r.stops, r.source, r.destination
      FROM buses b
      JOIN routes r ON b.route_id = r.id
      WHERE b.id = $1 AND b.is_active = true`,
      [busId]
    );

    if (busResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const bus = busResult.rows[0];
    const busLat = parseFloat(bus.current_lat);
    const busLng = parseFloat(bus.current_lng);
    const speed = parseFloat(bus.speed) || 30; // km/h, default 30

    // Parse stops from JSONB
    let stops = [];
    if (bus.stops) {
      try {
        stops = typeof bus.stops === 'string' ? JSON.parse(bus.stops) : bus.stops;
      } catch (e) {
        stops = Array.isArray(bus.stops) ? bus.stops : [];
      }
    }

    // Calculate distance to each stop and find current position index
    const stopsWithDistance = stops.map((stop, index) => {
      if (!stop.latitude || !stop.longitude) return null;
      
      const stopLat = parseFloat(stop.latitude);
      const stopLng = parseFloat(stop.longitude);
      
      const latDiff = (busLat - stopLat) * 111;
      const lngDiff = (busLng - stopLng) * 111 * Math.cos(stopLat * Math.PI / 180);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff); // in km

      return {
        ...stop,
        index,
        distance: Math.round(distance * 1000), // in meters
        distanceKm: Math.round(distance * 100) / 100
      };
    }).filter(s => s !== null);

    // Find current stop index (nearest passed stop)
    let currentIndex = 0;
    for (let i = 0; i < stopsWithDistance.length - 1; i++) {
      if (stopsWithDistance[i].distance > stopsWithDistance[i + 1].distance) {
        currentIndex = i + 1;
      }
    }

    // Get upcoming stops (next 5 stops)
    const upcomingStops = stopsWithDistance
      .slice(currentIndex + 1, currentIndex + 6)
      .map(stop => {
        const etaMinutes = Math.round((stop.distanceKm / speed) * 60);
        return {
          ...stop,
          eta: etaMinutes,
          etaFormatted: etaMinutes < 1 ? 'Less than 1 min' : `${etaMinutes} min`
        };
      });

    res.json({
      success: true,
      data: {
        bus: {
          id: bus.id,
          bus_number: bus.bus_number,
          route_name: bus.route_name
        },
        currentStop: stopsWithDistance[currentIndex]?.name || bus.source,
        upcomingStops,
        totalStopsRemaining: stopsWithDistance.length - currentIndex - 1
      }
    });

  } catch (error) {
    console.error('Error fetching upcoming stops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming stops'
    });
  }
});

// Get bus by ID - MUST be last to avoid route conflicts
router.get('/:busId', async (req, res) => {
  try {
    const { busId } = req.params;

    const result = await db.query(
      `SELECT 
        b.*, r.route_name, r.city
      FROM buses b
      JOIN routes r ON b.route_id = r.id
      WHERE b.id = $1`,
      [busId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bus details' 
    });
  }
});

module.exports = router;

