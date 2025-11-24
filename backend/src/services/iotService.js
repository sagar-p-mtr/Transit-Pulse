const mqtt = require('mqtt');
const db = require('../config/database-adapter');

class IoTService {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.isRunning = false;
  }

  start() {
    try {
      // Connect to MQTT broker
      this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com');

      this.client.on('connect', () => {
        console.log('🛰️  Connected to MQTT broker');
        this.isRunning = true;

        // Subscribe to all bus sensor topics
        this.client.subscribe('buses/+/gps');
        this.client.subscribe('buses/+/sensors/crowd');
        this.client.subscribe('buses/+/sensors/door');
        console.log('📡 Subscribed to IoT topics');
      });

      this.client.on('message', async (topic, message) => {
        await this.handleMessage(topic, message);
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
      });

      // Start publishing simulated IoT data
      this.startSimulation();

    } catch (error) {
      console.error('Failed to start IoT service:', error);
    }
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const busId = topicParts[1];
      const sensorType = topicParts[topicParts.length - 1];

      if (sensorType === 'gps') {
        await this.handleGPSData(busId, data);
      } else if (sensorType === 'crowd') {
        await this.handleCrowdData(busId, data);
      } else if (sensorType === 'door') {
        await this.handleDoorData(busId, data);
      }

    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  async handleGPSData(busId, data) {
    // Update bus location in database
    await db.query(
      `UPDATE buses 
       SET current_lat = $1, current_lng = $2, speed = $3, last_updated = datetime('now')
       WHERE id = $4`,
      [data.latitude, data.longitude, data.speed, busId]
    );

    // Broadcast to WebSocket
    this.io.emit('bus:location:update', {
      busId,
      location: { lat: data.latitude, lng: data.longitude },
      speed: data.speed,
      timestamp: Date.now()
    });
  }

  async handleCrowdData(busId, data) {
    // Update crowd level
    await db.query(
      `UPDATE buses 
       SET crowd_percentage = $1, crowd_level = $2
       WHERE id = $3`,
      [data.percentage, data.level, busId]
    );

    this.io.emit('bus:crowd:update', {
      busId,
      crowdPercentage: data.percentage,
      crowdLevel: data.level
    });
  }

  async handleDoorData(busId, data) {
    // Log door open/close events
    if (data.status === 'open') {
      console.log(`🚪 Bus ${busId} door opened at stop ${data.stopId}`);
      
      this.io.emit('bus:door:opened', {
        busId,
        stopId: data.stopId,
        timestamp: Date.now()
      });
    }
  }

  // Simulate IoT device data for testing
  startSimulation() {
    setInterval(() => {
      if (!this.isRunning) return;

      // Simulate GPS data for random buses
      const busIds = ['KA01-1234', 'KA01-5678', 'KA01-9012'];
      
      busIds.forEach(busId => {
        // GPS data
        const gpsData = {
          latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
          speed: 20 + Math.random() * 30,
          timestamp: Date.now()
        };

        this.client.publish(
          `buses/${busId}/gps`,
          JSON.stringify(gpsData)
        );

        // Crowd sensor data
        const crowdData = {
          percentage: Math.floor(Math.random() * 100),
          level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          seats_available: Math.floor(Math.random() * 50)
        };

        this.client.publish(
          `buses/${busId}/sensors/crowd`,
          JSON.stringify(crowdData)
        );
      });

    }, 5000); // Every 5 seconds
  }

  stop() {
    this.isRunning = false;
    if (this.client) {
      this.client.end();
      console.log('🛑 IoT service stopped');
    }
  }
}

module.exports = IoTService;

