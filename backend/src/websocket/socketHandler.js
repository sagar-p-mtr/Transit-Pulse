const jwt = require('jsonwebtoken');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
  }

  initialize() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
        }
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Subscribe to bus tracking
      socket.on('subscribe:bus', (busId) => {
        socket.join(`bus:${busId}`);
        console.log(`Subscribed to bus: ${busId}`);
      });

      // Subscribe to route tracking
      socket.on('subscribe:route', (routeId) => {
        socket.join(`route:${routeId}`);
      });

      // Subscribe to stop updates
      socket.on('subscribe:stop', (stopId) => {
        socket.join(`stop:${stopId}`);
      });

      // Unsubscribe
      socket.on('unsubscribe', (channel) => {
        socket.leave(channel);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });

    console.log('WebSocket handler initialized');
  }

  emitBusUpdate(busId, data) {
    this.io.to(`bus:${busId}`).emit('bus:location:update', data);
    if (data.routeId) {
      this.io.to(`route:${data.routeId}`).emit('bus:location:update', data);
    }
  }

  emitBusArrival(stopId, data) {
    this.io.to(`stop:${stopId}`).emit('bus:arrival', data);
  }

  sendUserNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  broadcastAlert(alert) {
    this.io.emit('alert', alert);
  }
}

module.exports = SocketHandler;

