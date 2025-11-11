import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { HistoryFilterType } from '../types';

interface HistoryEmptyStateProps {
  filter: HistoryFilterType;
}

export function HistoryEmptyState({ filter }: HistoryEmptyStateProps) {
  const message = (() => {
    if (filter === 'all') {
      return 'Completa recordatorios y gestiona tus mascotas para ver su historial aquí';
    }
    if (filter === 'reminders') {
      return 'No hay recordatorios completados';
    }
    return 'No hay eventos de mascotas';
  })();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyIcon}
      >
        <Ionicons name="time-outline" size={48} color="#fff" />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No hay historial aún</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
