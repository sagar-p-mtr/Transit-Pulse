import { useEffect, useState, useCallback, useRef } from 'react';
import { getRealtimeService, initializeRealtimeService, ConnectionState } from '../services/realtimeService';
import { ENABLE_REALTIME, REALTIME_URL } from '../config/runtime';

export interface UseRealtimeUpdatesOptions {
  url?: string;
  autoConnect?: boolean;
  onBusUpdate?: (data: any) => void;
  onRouteUpdate?: (data: any) => void;
  onAlert?: (data: any) => void;
  onConnectionChange?: (state: ConnectionState) => void;
}

export interface UseRealtimeUpdatesReturn {
  connectionState: ConnectionState;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  sendMessage: (event: string, data: any) => void;
  requestData: (event: string, data: any) => Promise<any>;
}

export const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}): UseRealtimeUpdatesReturn => {
  const {
    url = REALTIME_URL,
    autoConnect = ENABLE_REALTIME,
    onBusUpdate,
    onRouteUpdate,
    onAlert,
    onConnectionChange
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    lastConnectedAt: null,
    reconnectAttempt: 0
  });

  const serviceRef = useRef(getRealtimeService());
  const listenersRef = useRef<Array<() => void>>([]);

  // Initialize service if not already initialized
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = initializeRealtimeService({
        url,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000
      });
    }
  }, [url]);

  // Setup event listeners
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    // Clean up previous listeners
    listenersRef.current.forEach(cleanup => cleanup());
    listenersRef.current = [];

    // Connection state listener
    const handleStateChange = (state: ConnectionState) => {
      setConnectionState(state);
      onConnectionChange?.(state);
    };
    service.on('connection:stateChange', handleStateChange);
    listenersRef.current.push(() => service.off('connection:stateChange', handleStateChange));

    // Bus update listener
    if (onBusUpdate) {
      service.on('bus:update', onBusUpdate);
      listenersRef.current.push(() => service.off('bus:update', onBusUpdate));
    }

    // Route update listener
    if (onRouteUpdate) {
      service.on('route:update', onRouteUpdate);
      listenersRef.current.push(() => service.off('route:update', onRouteUpdate));
    }

    // Alert listener
    if (onAlert) {
      service.on('alert:new', onAlert);
      listenersRef.current.push(() => service.off('alert:new', onAlert));
    }

    // Connection event listeners
    const handleConnectionEstablished = () => {
      console.log('Connection established in hook');
    };
    service.on('connection:established', handleConnectionEstablished);
    listenersRef.current.push(() => service.off('connection:established', handleConnectionEstablished));

    const handleConnectionLost = (data: any) => {
      console.log('Connection lost in hook:', data);
    };
    service.on('connection:lost', handleConnectionLost);
    listenersRef.current.push(() => service.off('connection:lost', handleConnectionLost));

    const handleConnectionError = (data: any) => {
      console.error('Connection error in hook:', data);
    };
    service.on('connection:error', handleConnectionError);
    listenersRef.current.push(() => service.off('connection:error', handleConnectionError));

    const handleReconnecting = (data: any) => {
      console.log('Reconnecting in hook:', data);
    };
    service.on('connection:reconnecting', handleReconnecting);
    listenersRef.current.push(() => service.off('connection:reconnecting', handleReconnecting));

    const handleConnectionFailed = (data: any) => {
      console.error('Connection failed in hook:', data);
    };
    service.on('connection:failed', handleConnectionFailed);
    listenersRef.current.push(() => service.off('connection:failed', handleConnectionFailed));

    return () => {
      listenersRef.current.forEach(cleanup => cleanup());
      listenersRef.current = [];
    };
  }, [onBusUpdate, onRouteUpdate, onAlert, onConnectionChange]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && serviceRef.current) {
      serviceRef.current.connect();
    }

    return () => {
      if (autoConnect && serviceRef.current) {
        serviceRef.current.disconnect();
      }
    };
  }, [autoConnect]);

  // Connect function
  const connect = useCallback(() => {
    serviceRef.current?.connect();
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
  }, []);

  // Send message function
  const sendMessage = useCallback((event: string, data: any) => {
    serviceRef.current?.send(event, data);
  }, []);

  // Request data function
  const requestData = useCallback((event: string, data: any): Promise<any> => {
    if (!serviceRef.current) {
      return Promise.reject(new Error('Service not initialized'));
    }
    return serviceRef.current.request(event, data);
  }, []);

  return {
    connectionState,
    connect,
    disconnect,
    isConnected: connectionState.isConnected,
    isReconnecting: connectionState.isReconnecting,
    error: connectionState.error,
    sendMessage,
    requestData
  };
};

// Hook for subscribing to specific bus routes
export const useBusRouteUpdates = (routeIds: string[]) => {
  const [busData, setBusData] = useState<Map<string, any>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleBusUpdate = useCallback((data: any) => {
    if (routeIds.includes(data.routeId)) {
      setBusData(prev => {
        const newMap = new Map(prev);
        newMap.set(data.id, data);
        return newMap;
      });
      setLastUpdate(new Date());
    }
  }, [routeIds]);

  const { connectionState, ...rest } = useRealtimeUpdates({
    onBusUpdate: handleBusUpdate
  });

  useEffect(() => {
    if (connectionState.isConnected && routeIds.length > 0) {
      rest.sendMessage('subscribe:routes', { routeIds });
    }
  }, [connectionState.isConnected, routeIds, rest]);

  return {
    busData: Array.from(busData.values()),
    lastUpdate,
    connectionState,
    ...rest
  };
};

// Hook for subscribing to alerts
export const useAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleAlert = useCallback((alert: any) => {
    setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
    setUnreadCount(prev => prev + 1);
  }, []);

  const { connectionState, ...rest } = useRealtimeUpdates({
    onAlert: handleAlert
  });

  const markAsRead = useCallback((alertId?: string) => {
    if (alertId) {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } else {
      setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    }
    setUnreadCount(0);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  return {
    alerts,
    unreadCount,
    markAsRead,
    clearAlerts,
    connectionState,
    ...rest
  };
};

export default useRealtimeUpdates;
