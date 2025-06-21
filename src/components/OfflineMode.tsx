import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle, Download, Upload } from 'lucide-react';

interface OfflineModeProps {
  children: React.ReactNode;
}

const OfflineMode: React.FC<OfflineModeProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
      // Sync pending actions when back online
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    try {
      // In a real implementation, you would sync with your backend
      console.log('Syncing pending actions:', pendingActions);
      
      // Clear pending actions after successful sync
      setPendingActions([]);
      
      // Show success notification
      alert(`Successfully synced ${pendingActions.length} pending actions`);
    } catch (error) {
      console.error('Failed to sync pending actions:', error);
    }
  };

  const addPendingAction = (action: any) => {
    setPendingActions(prev => [...prev, { ...action, timestamp: new Date() }]);
  };

  // Offline Notice Banner
  const OfflineNotice = () => (
    <div className="bg-warning-50 border-b border-warning-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5 text-warning-600" />
          <div>
            <p className="text-warning-800 font-medium">You're currently offline</p>
            <p className="text-warning-700 text-sm">
              Some features may be limited. Changes will sync when connection is restored.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {pendingActions.length > 0 && (
            <div className="flex items-center text-warning-700 text-sm">
              <Upload className="w-4 h-4 mr-1" />
              {pendingActions.length} pending sync
            </div>
          )}
          <button
            onClick={() => setShowOfflineNotice(false)}
            className="text-warning-600 hover:text-warning-800"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );

  // Connection Status Indicator
  const ConnectionStatus = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-success-100 text-success-800 border border-success-200' 
          : 'bg-error-100 text-error-800 border border-error-200'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline</span>
          </>
        )}
      </div>
    </div>
  );

  // Emergency Offline Check-in Form
  const EmergencyCheckIn = () => {
    const [emergencyData, setEmergencyData] = useState({
      visitorName: '',
      hostName: '',
      purpose: '',
      timestamp: new Date()
    });

    const handleEmergencySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Store in localStorage for offline persistence
      const emergencyCheckins = JSON.parse(localStorage.getItem('emergencyCheckins') || '[]');
      emergencyCheckins.push({
        ...emergencyData,
        id: Date.now().toString(),
        status: 'emergency_offline'
      });
      localStorage.setItem('emergencyCheckins', JSON.stringify(emergencyCheckins));
      
      addPendingAction({
        type: 'emergency_checkin',
        data: emergencyData
      });

      alert('Emergency check-in recorded. Will sync when online.');
      setEmergencyData({ visitorName: '', hostName: '', purpose: '', timestamp: new Date() });
    };

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Emergency Offline Check-in</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">
          Use this form for emergency visitor registration when the system is offline.
        </p>
        
        <form onSubmit={handleEmergencySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Visitor Name"
              value={emergencyData.visitorName}
              onChange={(e) => setEmergencyData(prev => ({ ...prev, visitorName: e.target.value }))}
              className="px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
            <input
              type="text"
              placeholder="Host Name"
              value={emergencyData.hostName}
              onChange={(e) => setEmergencyData(prev => ({ ...prev, hostName: e.target.value }))}
              className="px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          <textarea
            placeholder="Purpose of visit"
            value={emergencyData.purpose}
            onChange={(e) => setEmergencyData(prev => ({ ...prev, purpose: e.target.value }))}
            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Record Emergency Check-in
          </button>
        </form>
      </div>
    );
  };

  return (
    <div>
      {!isOnline && showOfflineNotice && <OfflineNotice />}
      
      <div className="relative">
        {children}
        
        {/* Show emergency check-in form when offline */}
        {!isOnline && window.location.pathname.includes('checkin') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <EmergencyCheckIn />
            </div>
          </div>
        )}
      </div>
      
      <ConnectionStatus />
    </div>
  );
};

export default OfflineMode;