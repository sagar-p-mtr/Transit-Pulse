import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { realtimeService } from '../services/realtimeService';

const ConnectionStatus: React.FC = () => {
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [showStatus, setShowStatus] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  useEffect(() => {
    // Start with connected state to avoid showing connecting message
    setConnectionState('connected');
    setShowStatus(false);

    // Listen to connection state changes
    const handleConnect = () => {
      setConnectionState('connected');
      setReconnectAttempt(0);
      // Don't show success message to avoid clutter
      setShowStatus(false);
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
      setShowStatus(true);
    };

    const handleReconnecting = (attempt: number) => {
      setConnectionState('connecting');
      setReconnectAttempt(attempt);
      // Only show reconnecting after first attempt
      if (attempt > 1) {
        setShowStatus(true);
      }
    };

    const handleError = () => {
      setConnectionState('disconnected');
      setShowStatus(true);
    };

    // Subscribe to events
    realtimeService.on('connection:established', handleConnect);
    realtimeService.on('connection:lost', handleDisconnect);
    realtimeService.on('connection:reconnecting', (data: any) => handleReconnecting(data.attempt));
    realtimeService.on('connection:error', handleError);

    // Don't check initial state to avoid showing connecting message
    // Assume connected by default for demo purposes
    
    return () => {
      realtimeService.off('connection:established', handleConnect);
      realtimeService.off('connection:lost', handleDisconnect);
      realtimeService.off('connection:reconnecting', (data: any) => handleReconnecting(data.attempt));
      realtimeService.off('connection:error', handleError);
    };
  }, []);

  // Only show when explicitly set to show (disconnected or reconnecting after attempts)
  const shouldShow = showStatus && connectionState !== 'connected';

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          pulseColor: 'bg-green-400'
        };
      case 'connecting':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: reconnectAttempt > 0 ? `Reconnecting... (${reconnectAttempt}/5)` : 'Connecting...',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          pulseColor: 'bg-yellow-400'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline - Using cached data',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          pulseColor: 'bg-red-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 right-4 z-50"
        >
          <div className={`${config.bgColor} ${config.textColor} px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
            <div className="relative">
              {config.icon}
              {connectionState === 'connecting' && (
                <span className={`absolute -top-1 -right-1 h-2 w-2 ${config.pulseColor} rounded-full animate-pulse`} />
              )}
            </div>
            <span className="text-sm font-medium">{config.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
