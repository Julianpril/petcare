// app/Auth.tsx (optimizado)
import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  loading: true,
});

type AuthProviderProps = {
  children: React.ReactNode;
};

type User = {
  username: string;
  password: string;
};

// Usuarios locales para autenticación rápida
const LOCAL_USERS: User[] = [
  { username: 'usuario1', password: 'contrasena1' },
  { username: 'usuario2', password: 'contrasena2' },
  { username: 'usuario3', password: 'contrasena3' },
  { username: 'admin', password: 'admin123' },
  { username: 'test', password: 'test123' }
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reducir el tiempo de inicialización
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50); // Reducido de 100ms a 50ms

    return () => clearTimeout(timer);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Intentando login con:', { username });
      
      // Autenticación local instantánea
      const user = LOCAL_USERS.find((u: User) => 
        u.username === username && u.password === password
      );
      
      if (user) {
        console.log('Login exitoso (local)');
        setIsAuthenticated(true);
        return true;
      }

      // Si no encuentra en local, intenta con API (con timeout corto)
      try {
        console.log('Intentando con API externa...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos máximo
        
        const response = await fetch('https://mocki.io/v1/0129b912-c783-49b3-89dd-fa1f6c9467a7', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const apiUser = data.users?.find((u: User) => 
            u.username === username && u.password === password
          );
          
          if (apiUser) {
            console.log('Login exitoso (API)');
            setIsAuthenticated(true);
            return true;
          }
        }
      } catch (apiError) {
        console.log('API no disponible, usando solo autenticación local');
      }
      
      console.log('Credenciales incorrectas');
      return false;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);