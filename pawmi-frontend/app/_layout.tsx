// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { NotificationProvider } from '../lib/notifications/notification-context';

function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 NavigationHandler - Estado:', { 
      isAuthenticated, 
      loading, 
      segments: segments.join('/') || 'root' 
    });
    
    if (loading) {
      console.log('⏳ Esperando carga de autenticación...');
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';
    const inAuthScreens = segments[0] === 'login' || segments[0] === 'register';
    
    console.log('📍 Ubicación:', { 
      inAuthGroup, 
      inAuthScreens,
      currentPath: segments.join('/') || 'root'
    });

    if (!isAuthenticated && inAuthGroup) {
      console.log('🚫 Usuario NO autenticado en zona protegida → Redirigiendo a /login');
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreens) {
      console.log('✅ Usuario autenticado en login/register → Redirigiendo a /(tabs)');
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthScreens && !inAuthGroup) {
      console.log('🔐 Usuario NO autenticado en root → Redirigiendo a /login');
      router.replace('/login');
    } else if (isAuthenticated && !segments.length) {
      console.log('🏠 Usuario autenticado en root → Redirigiendo a /(tabs)');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, loading]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationHandler>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
                presentation: 'fullScreenModal'
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                headerShown: false,
                presentation: 'fullScreenModal'
              }} 
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </NavigationHandler>
      </NotificationProvider>
    </AuthProvider>
  );
}