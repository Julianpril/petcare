// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Navbar from '../../components/navbar';

function ConditionalNavbar(props: BottomTabBarProps) {
  const currentRoute = props.state.routes[props.state.index];

  if (currentRoute.name === 'index') {
    return null;
  }

  return <Navbar {...props} />;
}

export default function TabsLayout() {

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <ConditionalNavbar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="loader" options={{ title: 'Loader' }} />
      <Tabs.Screen name="doctor" options={{ title: 'Doctor' }} />
      <Tabs.Screen name="user" options={{ title: 'Profile' }} />
    </Tabs>
  );
}