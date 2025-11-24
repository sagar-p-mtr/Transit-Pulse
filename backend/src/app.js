require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const db = require('./config/database-adapter');
const redis = require('./config/redis');
const SocketHandler = require('./websocket/socketHandler');
const LiveTrackingHandler = require('./websocket/liveTrackingHandler');

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const mlRoutes = require('./routes/ml');
const notificationRoutes = require('./routes/notifications');
const socialRoutes = require('./routes/social');
const busBuddyRoutes = require('./routes/busBuddy');
const weatherRoutes = require('./routes/weather');
const crowdPredictionRoutes = require('./routes/crowdPrediction');
const liveTrackingRoutes = require('./routes/liveTracking');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize WebSocket handlers
const socketHandler = new SocketHandler(io);
socketHandler.initialize();

// Initialize Live Tracking handler
const liveTrackingHandler = new LiveTrackingHandler(io);
liveTrackingHandler.initialize();

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/bus-buddy', busBuddyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/crowd', crowdPredictionRoutes);
app.use('/api/live-tracking', liveTrackingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start GPS simulator (temporarily disabled for stability)
// const GPSSimulator = require('./services/gpsSimulator');
// const gpsSimulator = new GPSSimulator(io);
// gpsSimulator.start();

// Start IoT MQTT listener (temporarily disabled for stability)
// const IoTService = require('./services/iotService');
// const iotService = new IoTService(io);
// iotService.start();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚌 Where Is My Bus - Backend Server                ║
║                                                       ║
║   🚀 Server: http://localhost:${PORT}                   ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                 ║
║   📡 WebSocket: Active                                ║
║   🛰️  GPS Simulator: Running                          ║
║   📱 IoT Service: Active                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  server.close(async () => {
    if (db.pool && db.pool.end) {
      await db.pool.end();
    }
    await redis.quit();
    // iotService.stop();
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = { app, server, io };

