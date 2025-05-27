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

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Intentando login con:', { username, password });
      
      const response = await fetch('https://mocki.io/v1/0129b912-c783-49b3-89dd-fa1f6c9467a7');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data recibida:', data);
      
      const user = data.users?.find((u: User) => 
        u.username === username && u.password === password
      );
      
      console.log('Usuario encontrado:', user);
      
      if (user) {
        setIsAuthenticated(true);
        console.log('Login exitoso');
        return true;
      } else {
        console.log('Credenciales incorrectas');
        return false;
      }
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