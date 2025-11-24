import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, Bus, Users, MapPin, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'bus_arrival' | 'route_update' | 'crowd_alert' | 'service_disruption' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  routeId?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationCenterProps {
  user: any;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ user, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'bus_arrival',
          title: 'Bus Arriving Soon',
          message: 'BMTC 500 is arriving at Electronic City in 3 minutes',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          read: false,
          routeId: 'bmtc-500',
          priority: 'high'
        },
        {
          id: '2',
          type: 'crowd_alert',
          title: 'High Crowd Alert',
          message: 'Route 201 buses are currently experiencing high crowd levels. Consider alternative routes.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: false,
          routeId: 'bmtc-201',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'route_update',
          title: 'Route Diversion',
          message: 'BMTC 335 temporarily diverted via Silk Board due to road work.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          read: true,
          routeId: 'bmtc-335',
          priority: 'medium'
        },
        {
          id: '4',
          type: 'service_disruption',
          title: 'Service Disruption',
          message: 'KSRTC services to Mysore delayed by 30 minutes due to heavy traffic.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: 'high'
        },
        {
          id: '5',
          type: 'info',
          title: 'New Feature',
          message: 'You can now set custom alerts for your favorite routes!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'low'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    // API call to mark as read
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bus_arrival':
        return <Bus className="h-5 w-5 text-blue-500" />;
      case 'crowd_alert':
        return <Users className="h-5 w-5 text-orange-500" />;
      case 'route_update':
        return <MapPin className="h-5 w-5 text-purple-500" />;
      case 'service_disruption':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'priority':
        return notif.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-full max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              filter === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('priority')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              filter === 'priority'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Priority
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="h-8 w-8 mb-2" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 border-l-4 ${getPriorityColor(
                    notification.priority
                  )} ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.routeId && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {notification.routeId}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Delete"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
