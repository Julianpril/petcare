import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from './api-client';

export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  address?: string;
  profile_image_url?: string;
  role: 'user' | 'admin' | 'shelter' | 'walker';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  shelter_name?: string;
  shelter_description?: string;
  shelter_license?: string;
  is_verified_shelter?: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
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
        // Usuario inactivo, limpiar sesión
        await AsyncStorage.removeItem('auth_token');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Sesión inválida o expirada, limpiar silenciosamente
      console.log('⚠️ Sesión guardada inválida, limpiando...');
      await AsyncStorage.removeItem('auth_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
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
      console.log('👤 Usuario:', { email: user.email, role: user.role, full_name: user.full_name });
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
      console.log('🚪 Iniciando logout...');
      
      // Limpiar el token del backend
      await apiClient.logout();
      
      // Limpiar el estado local
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout exitoso - Sesión cerrada completamente');
      console.log('Estado actualizado: isAuthenticated =', false);
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Aún si hay error en el backend, limpiar el estado local
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // No lanzar el error, solo loguearlo
      console.log('⚠️ Sesión local limpiada a pesar del error');
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refrescando información del usuario...');
      const user = await apiClient.getCurrentUser();
      
      if (user && user.is_active !== false) {
        setCurrentUser(user);
        console.log('✅ Usuario actualizado:', user);
      }
    } catch (error) {
      console.error('❌ Error refrescando usuario:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
