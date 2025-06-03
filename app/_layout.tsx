// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from './Auth';

function NavigationHandler({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('NavigationHandler - Estado:', { isAuthenticated, loading, segments });
    
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inAuthScreens = segments[0] === 'login' || segments[0] === 'register';
    
    console.log('En grupo auth (tabs):', inAuthGroup);
    console.log('En pantallas de auth:', inAuthScreens);

    if (!isAuthenticated && inAuthGroup) {
      console.log('Usuario no autenticado, redirigiendo a login');
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreens) {
      console.log('Usuario autenticado en login/register, redirigiendo a tabs');
      router.replace('/(tabs)');
    } else if (isAuthenticated && !segments.length) {
      console.log('Usuario autenticado en root, redirigiendo a tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, loading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
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
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="saludChat" />
          <Stack.Screen name="recordatorios" />
          <Stack.Screen name="comida" />
          <Stack.Screen name="Adoptar" />
        </Stack>
      </NavigationHandler>
    </AuthProvider>
  );
}