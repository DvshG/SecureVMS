import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, User, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'visitor_request' | 'visitor_approved' | 'visitor_denied' | 'system_alert';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
  visitorId?: string;
  checkInId?: string;
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { getPendingApprovals, updateVisitorCheckIn } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on pending approvals
  useEffect(() => {
    const pendingApprovals = getPendingApprovals();
    const hostPendingApprovals = pendingApprovals.filter(
      ({ checkIn }) => checkIn.hostId === user?.id
    );

    const newNotifications: Notification[] = hostPendingApprovals.map(({ visitor, checkIn }) => ({
      id: `pending_${checkIn.id}`,
      type: 'visitor_request',
      title: 'New Visitor Request',
      message: `${visitor.name} from ${visitor.company || 'Unknown Company'} is requesting to visit you.`,
      timestamp: checkIn.checkInTime,
      read: false,
      actionable: true,
      visitorId: visitor.id,
      checkInId: checkIn.id
    }));

    // Add system alerts for long waiting times
    const longWaitingNotifications: Notification[] = hostPendingApprovals
      .filter(({ checkIn }) => {
        const waitTime = (new Date().getTime() - checkIn.checkInTime.getTime()) / (1000 * 60);
        return waitTime > 15;
      })
      .map(({ visitor, checkIn }) => ({
        id: `urgent_${checkIn.id}`,
        type: 'system_alert',
        title: 'Urgent: Visitor Waiting',
        message: `${visitor.name} has been waiting for ${Math.floor((new Date().getTime() - checkIn.checkInTime.getTime()) / (1000 * 60))} minutes for your approval.`,
        timestamp: new Date(),
        read: false,
        actionable: true,
        visitorId: visitor.id,
        checkInId: checkIn.id
      }));

    const allNotifications = [...newNotifications, ...longWaitingNotifications];
    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter(n => !n.read).length);
  }, [getPendingApprovals, user?.id]);

  const handleApprove = (visitorId: string, checkInId: string) => {
    const badgeNumber = `VMS${String(Date.now()).slice(-3)}`;
    updateVisitorCheckIn(visitorId, checkInId, {
      status: 'approved',
      badgeNumber,
      qrCode: `QR_${badgeNumber}`
    });
    
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => 
        n.visitorId === visitorId && n.checkInId === checkInId 
          ? { ...n, read: true, actionable: false }
          : n
      )
    );
  };

  const handleDeny = (visitorId: string, checkInId: string) => {
    updateVisitorCheckIn(visitorId, checkInId, {
      status: 'denied'
    });
    
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => 
        n.visitorId === visitorId && n.checkInId === checkInId 
          ? { ...n, read: true, actionable: false }
          : n
      )
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'visitor_request':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'system_alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-gray-50';
    
    switch (type) {
      case 'visitor_request':
        return 'bg-blue-50 border-blue-200';
      case 'system_alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationBg(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {format(notification.timestamp, 'h:mm a')}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        {/* Action Buttons for Visitor Requests */}
                        {notification.actionable && notification.visitorId && notification.checkInId && (
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => handleApprove(notification.visitorId!, notification.checkInId!)}
                              className="flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeny(notification.visitorId!, notification.checkInId!)}
                              className="flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;