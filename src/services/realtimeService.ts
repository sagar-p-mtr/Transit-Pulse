import { io, Socket } from 'socket.io-client';
import { ENABLE_REALTIME, REALTIME_URL } from '../config/runtime';

export interface RealtimeConfig {
  url: string;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

export interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  lastConnectedAt: Date | null;
  reconnectAttempt: number;
}

class RealtimeService {
  private socket: Socket | null = null;
  private config: RealtimeConfig;
  private connectionState: ConnectionState = {
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnectedAt: null,
    reconnectAttempt: 0
  };
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: RealtimeConfig) {
    this.config = {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      ...config
    };
  }

  connect(): void {
    if (!ENABLE_REALTIME) {
      console.log('Realtime service disabled (local/offline mode)');
      return;
    }

    if (this.socket?.connected) {
      console.log('Already connected to realtime service');
      return;
    }

    try {
      this.socket = io(this.config.url, {
        transports: ['websocket', 'polling'],
        reconnection: false, // We'll handle reconnection manually
        timeout: this.config.timeout,
      });

      this.setupEventHandlers();
      this.startHeartbeat();
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      this.updateConnectionState({ error: 'Failed to initialize connection' });
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to realtime service');
      this.updateConnectionState({
        isConnected: true,
        isReconnecting: false,
        error: null,
        lastConnectedAt: new Date(),
        reconnectAttempt: 0
      });
      this.emit('connection:established', this.connectionState);
      
      // Subscribe to necessary topics
      this.socket?.emit('subscribe', { 
        topics: ['bus_updates', 'route_updates', 'alerts'] 
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from realtime service:', reason);
      this.updateConnectionState({
        isConnected: false,
        error: `Disconnected: ${reason}`
      });
      this.emit('connection:lost', { reason });
      this.scheduleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.updateConnectionState({
        isConnected: false,
        error: error.message
      });
      this.emit('connection:error', { error: error.message });
    });

    // Handle incoming data
    this.socket.on('bus_update', (data) => {
      this.emit('bus:update', data);
    });

    this.socket.on('route_update', (data) => {
      this.emit('route:update', data);
    });

    this.socket.on('alert', (data) => {
      this.emit('alert:new', data);
    });

    this.socket.on('pong', () => {
      // Heartbeat response received
      this.emit('heartbeat:pong', { timestamp: Date.now() });
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const { reconnectAttempt } = this.connectionState;
    const { reconnectionAttempts, reconnectionDelay } = this.config;

    if (reconnectAttempt >= (reconnectionAttempts || 10)) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionState({
        isReconnecting: false,
        error: 'Max reconnection attempts reached'
      });
      this.emit('connection:failed', { 
        attempts: reconnectAttempt,
        error: 'Max reconnection attempts reached' 
      });
      return;
    }

    const delay = Math.min(
      (reconnectionDelay || 1000) * Math.pow(1.5, reconnectAttempt),
      30000
    );

    this.updateConnectionState({
      isReconnecting: true,
      reconnectAttempt: reconnectAttempt + 1
    });

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempt + 1})`);
    this.emit('connection:reconnecting', { 
      attempt: reconnectAttempt + 1,
      delay 
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  private reconnect(): void {
    this.disconnect();
    this.connect();
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.updateConnectionState({
      isConnected: false,
      isReconnecting: false,
      error: null
    });
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    this.emit('connection:stateChange', this.connectionState);
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event emitter methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  // Send data to server
  send(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send data: not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  // Request data with acknowledgment
  request(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Create singleton instance
let realtimeServiceInstance: RealtimeService | null = null;

export const initializeRealtimeService = (config: RealtimeConfig): RealtimeService => {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService(config);
  }
  return realtimeServiceInstance;
};

export const getRealtimeService = (): RealtimeService | null => {
  return realtimeServiceInstance;
};

// Export singleton instance with default configuration
export const realtimeService = initializeRealtimeService({
  url: REALTIME_URL,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

export default RealtimeService;
