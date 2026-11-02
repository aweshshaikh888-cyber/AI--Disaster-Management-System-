import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const defaultUser: User = {
  id: 1,
  username: "admin_commander",
  email: "admin@disasterai.gov",
  role: "ADMIN",
  full_name: "Major General R. Sharma",
  agency: "National Disaster Management Authority (HQ)",
  badge_number: "NDMA-HQ-001"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('disasterai_token') || 'demo_token');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('disasterai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(defaultUser);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ username, password });
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('disasterai_token', res.access_token);
      localStorage.setItem('disasterai_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('disasterai_token', res.access_token);
      localStorage.setItem('disasterai_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem('disasterai_token', res.access_token);
      localStorage.setItem('disasterai_user', JSON.stringify(res.user));
    } catch {
      // Fallback local instant switch
      const fallbackMap: Record<UserRole, User> = {
        ADMIN: {
          id: 1,
          username: "admin_commander",
          email: "admin@disasterai.gov",
          role: "ADMIN",
          full_name: "Major General R. Sharma",
          agency: "National Disaster Management Authority (HQ)"
        },
        OFFICER: {
          id: 2,
          username: "officer_ops",
          email: "officer@disasterai.gov",
          role: "OFFICER",
          full_name: "Captain Priya Patel",
          agency: "Emergency Operations Center"
        },
        RESCUE: {
          id: 3,
          username: "rescue_unit9",
          email: "rescue@disasterai.gov",
          role: "RESCUE",
          full_name: "Lt. David Vance",
          agency: "Urban Search & Rescue (USAR Unit 9)"
        },
        ANALYST: {
          id: 4,
          username: "analyst_geoint",
          email: "analyst@disasterai.gov",
          role: "ANALYST",
          full_name: "Dr. Aisha Rao",
          agency: "Geospatial Intelligence Division"
        }
      };
      const fallbackUser = fallbackMap[role];
      setUser(fallbackUser);
      localStorage.setItem('disasterai_user', JSON.stringify(fallbackUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('disasterai_token');
    localStorage.removeItem('disasterai_user');
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'OFFICER',
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
