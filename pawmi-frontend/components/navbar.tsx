import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ICONS = [
  { key: 'index', name: 'home', lib: Feather },
  { key: 'explore', name: 'calendar', lib: Feather },
  { key: 'loader', name: 'wifi', lib: Feather },
  { key: 'doctor', name: 'user-md', lib: Feather },
  { key: 'user', name: 'user', lib: Feather },
];

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
        <View style={styles.navContent}>
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
                {isActive ? (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeIconContainer}
                  >
                    <IconComp name={iconDef.name} size={22} color="#ffffff" />
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveIconContainer}>
                    <IconComp name={iconDef.name} size={22} color="#94a3b8" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.select({ ios: 30, android: 20 }),
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#16181d',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});