// app/_layout.tsx (Layout principal)
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
    console.log('En grupo auth (tabs):', inAuthGroup);

    if (!isAuthenticated && inAuthGroup) {
      console.log('Usuario no autenticado, redirigiendo a login');
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      console.log('Usuario autenticado en login, redirigiendo a tabs');
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