// app/(tabs)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="user" options={{ headerShown: false }} />
      <Stack.Screen name="userIndex" options={{ headerShown: false }} />
      <Stack.Screen name="refugioIndex" options={{ headerShown: false }} />
      <Stack.Screen name="walkerIndex" options={{ headerShown: false }} />
    </Stack>
  );
}