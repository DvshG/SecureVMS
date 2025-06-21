import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Shield, Users, Settings } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'host':
        return <Users className="w-5 h-5" />;
      case 'admin':
        return <Settings className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'security':
        return 'bg-primary-600';
      case 'host':
        return 'bg-secondary-600';
      case 'admin':
        return 'bg-accent-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${getRoleColor()} text-white`}>
                {getRoleIcon()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500 capitalize">{user?.role} Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Center */}
              {user?.role === 'host' && <NotificationCenter />}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.department}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;