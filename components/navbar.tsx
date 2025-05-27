import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ICONS = [
  { key: 'index', name: 'home', lib: Feather },
  { key: 'explore', name: 'calendar', lib: Feather },
  { key: 'loader', name: 'wifi', lib: Feather },
  { key: 'doctor', name: 'user-md', lib: Feather },
  { key: 'user', name: 'user', lib: Feather },
];

// Define route mapping to fix TypeScript error
const ROUTE_MAP: Record<string, string> = {
  'index': '/(tabs)',
  'explore': '/(tabs)/explore',
  'loader': '/(tabs)/loader',
  'doctor': '/(tabs)/doctor',
  'user': '/(tabs)/user',
};

type TabRoute = 'index' | 'explore' | 'loader' | 'doctor' | 'user';

export default function Navbar({ state }: BottomTabBarProps) {
  const { index: activeIndex, routes } = state;
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {routes.map((route, i) => {
          const iconDef = ICONS.find(ic => ic.key === route.name);
          if (!iconDef) return null;
          const IconComp = iconDef.lib;
          const isActive = i === activeIndex;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.iconButton}
              onPress={() => {
                const targetRoute = ROUTE_MAP[route.name];
                if (targetRoute) {
                  router.replace(targetRoute as any);
                }
              }}
              activeOpacity={0.7}
            >
              <IconComp name={iconDef.name} size={24} color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: Platform.select({ ios: 30, android: 20 }), left: 0, right: 0, alignItems: 'center' },
  container: { flexDirection: 'row', backgroundColor: 'rgba(45,45,45,0.6)', borderRadius: 32, paddingVertical: 10, paddingHorizontal: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  iconButton: { marginHorizontal: 12 },
});