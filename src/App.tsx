import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import OfflineMode from './components/OfflineMode';
import LoginPage from './pages/LoginPage';
import SecurityDashboard from './pages/SecurityDashboard';
import SecurityCheckIn from './pages/SecurityCheckIn';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VisitorCheckIn from './pages/VisitorCheckIn';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <OfflineMode>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/checkin" element={<VisitorCheckIn />} />
                <Route 
                  path="/security" 
                  element={
                    <ProtectedRoute allowedRoles={['security']}>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/security/checkin" 
                  element={
                    <ProtectedRoute allowedRoles={['security']}>
                      <SecurityCheckIn />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/host" 
                  element={
                    <ProtectedRoute allowedRoles={['host']}>
                      <HostDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </OfflineMode>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;