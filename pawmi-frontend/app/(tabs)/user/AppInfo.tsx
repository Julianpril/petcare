import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AppInfo() {
  return (
    <View style={styles.appInfo}>
      <Ionicons name="paw" size={24} color="#475569" style={styles.appInfoIcon} />
      <Text style={styles.appVersion}>Pawmi v1.0.0</Text>
      <Text style={styles.appCopyright}>© 2024 Pawmi. Todos los derechos reservados.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 8,
  },
  appInfoIcon: {
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  appCopyright: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
});
