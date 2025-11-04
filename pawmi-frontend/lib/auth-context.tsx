import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from './api-client';

export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  role: 'user' | 'admin' | 'veterinarian';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  login: async () => false,
  logout: async () => {},
  loading: true,
});

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const user = await apiClient.getCurrentUser();

      if (user && user.is_active !== false) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Error checking stored session:', error);
      await apiClient.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('🔐 Intentando login con backend:', { email: normalizedEmail });
      
      await apiClient.login(normalizedEmail, password);
      
      const user = await apiClient.getCurrentUser();
      
      if (!user || user.is_active === false) {
        console.log('⚠️ Usuario no encontrado o inactivo');
        return false;
      }

      console.log('✅ Login exitoso con backend');
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Limpiar el token
      await apiClient.logout();
      
      // Limpiar el estado
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout exitoso - Sesión cerrada completamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Aún si hay error, limpiar el estado local
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
