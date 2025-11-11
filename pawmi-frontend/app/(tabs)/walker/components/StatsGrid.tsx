import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WalkerStats } from './types';

interface StatsGridProps {
  stats: WalkerStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="time" size={28} color="#f59e0b" />
        </View>
        <Text style={styles.statValue}>{stats.pending_count}</Text>
        <Text style={styles.statLabel}>Pendientes</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
          <Ionicons name="calendar" size={28} color="#10b981" />
        </View>
        <Text style={styles.statValue}>{stats.upcoming_count}</Text>
        <Text style={styles.statLabel}>Próximas</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#ede9fe' }]}>
          <Ionicons name="checkmark-done" size={28} color="#8b5cf6" />
        </View>
        <Text style={styles.statValue}>{stats.completed_count}</Text>
        <Text style={styles.statLabel}>Completadas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
