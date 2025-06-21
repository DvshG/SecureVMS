import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'security' | 'host' | 'admin';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo - in production, this would be handled by your auth service
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Security Officer Johnson',
    email: 'security@company.com',
    role: 'security',
    department: 'Security'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'host',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    department: 'IT'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('vms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check mock users first
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('vms_user', JSON.stringify(foundUser));
      return true;
    }

    // Check registered hosts from localStorage
    const registeredHosts = JSON.parse(localStorage.getItem('vms_registered_hosts') || '[]');
    const foundHost = registeredHosts.find((h: any) => h.email === email && h.password === password && h.isApproved);
    
    if (foundHost) {
      const hostUser: User = {
        id: foundHost.id,
        name: foundHost.name,
        email: foundHost.email,
        role: 'host',
        department: foundHost.department
      };
      setUser(hostUser);
      setIsAuthenticated(true);
      localStorage.setItem('vms_user', JSON.stringify(hostUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};