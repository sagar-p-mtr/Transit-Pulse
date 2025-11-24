class LiveTrackingHandler {
  constructor(io) {
    this.io = io;
    this.busTrackers = new Map(); // Map to track which sockets are tracking which buses
    this.busPositions = new Map(); // Cache of current bus positions
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected for live tracking: ${socket.id}`);

      // Join bus tracking room
      socket.on('joinBusRoom', ({ busId }) => {
        if (busId) {
          socket.join(`bus:${busId}`);
          this.busTrackers.set(socket.id, busId);
          console.log(`Socket ${socket.id} joined bus room: bus:${busId}`);
          
          // Send current position if available
          if (this.busPositions.has(busId)) {
            socket.emit('busPositionUpdate', this.busPositions.get(busId));
          }
        }
      });

      // Leave bus tracking room
      socket.on('leaveBusRoom', ({ busId }) => {
        if (busId) {
          socket.leave(`bus:${busId}`);
          this.busTrackers.delete(socket.id);
          console.log(`Socket ${socket.id} left bus room: bus:${busId}`);
        }
      });

      // Join route tracking room (to see all buses on a route)
      socket.on('joinRouteRoom', ({ routeId }) => {
        if (routeId) {
          socket.join(`route:${routeId}`);
          console.log(`Socket ${socket.id} joined route room: route:${routeId}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.busTrackers.delete(socket.id);
      });
    });

    // Start simulation for demo purposes
    this.startBusSimulation();
  }

  // Simulate bus movement for demonstration
  startBusSimulation() {
    // Simulate bus movement every 3 seconds
    setInterval(() => {
      // Simulate movement for bus ID 1 (demo bus)
      this.simulateBusMovement('1', 'route1');
    }, 3000);
  }

  simulateBusMovement(busId, routeId) {
    // Get or create bus position
    let busData = this.busPositions.get(busId) || {
      busId,
      routeId,
      position: {
        lat: 12.9716,
        lng: 77.5946,
        heading: 0
      },
      speed: 0,
      currentStopIndex: 0,
      crowdLevel: 'Medium',
      crowdPercentage: 45
    };

    // Simulate movement along a predefined path
    const movementDelta = 0.0005; // Small movement increment
    const speedVariation = Math.random() * 20 + 20; // 20-40 km/h

    // Update position (simple linear movement for demo)
    busData.position.lat += (Math.random() - 0.5) * movementDelta * 2;
    busData.position.lng += (Math.random() - 0.5) * movementDelta * 2;
    
    // Update heading based on movement direction
    busData.position.heading = Math.random() * 360;
    
    // Update speed with some variation
    busData.speed = speedVariation;
    
    // Randomly update stop index (progress along route)
    if (Math.random() > 0.8) {
      busData.currentStopIndex = Math.min(busData.currentStopIndex + 1, 15);
    }
    
    // Randomly update crowd level
    if (Math.random() > 0.9) {
      const crowdLevels = ['Low', 'Medium', 'High'];
      busData.crowdLevel = crowdLevels[Math.floor(Math.random() * crowdLevels.length)];
      busData.crowdPercentage = Math.floor(Math.random() * 60) + 20;
    }

    // Add timestamp
    busData.timestamp = new Date().toISOString();

    // Store updated position
    this.busPositions.set(busId, busData);

    // Emit to all clients tracking this bus
    this.io.to(`bus:${busId}`).emit('busPositionUpdate', busData);

    // Also emit to route room
    this.io.to(`route:${routeId}`).emit('routeBusUpdate', {
      busId,
      busNumber: `BUS-${busId}`,
      position: busData.position,
      speed: busData.speed,
      heading: busData.position.heading,
      currentStopIndex: busData.currentStopIndex,
      crowdLevel: busData.crowdLevel
    });
  }

  // Update bus position from external source (GPS tracker, IoT device, etc.)
  updateBusPosition(busId, positionData) {
    const busData = {
      busId,
      ...positionData,
      timestamp: new Date().toISOString()
    };

    // Store position
    this.busPositions.set(busId, busData);

    // Emit to all tracking clients
    this.io.to(`bus:${busId}`).emit('busPositionUpdate', busData);

    // If route ID is provided, also emit to route room
    if (positionData.routeId) {
      this.io.to(`route:${positionData.routeId}`).emit('routeBusUpdate', busData);
    }
  }

  // Get current trackers count for a bus
  getTrackersCount(busId) {
    const room = this.io.sockets.adapter.rooms.get(`bus:${busId}`);
    return room ? room.size : 0;
  }

  // Get all active bus trackers
  getActiveBuses() {
    return Array.from(this.busPositions.keys());
  }
}

module.exports = LiveTrackingHandler;