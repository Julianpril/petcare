import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatCard } from './StatCard';
import type { AdoptionStats } from './types';

type OverviewSectionProps = {
  stats: AdoptionStats;
};

export function OverviewSection({ stats }: OverviewSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen General</Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon="heart-outline"
          label="Total en adopción"
          value={stats.total}
          color="#43e97b"
          gradient={['#43e97b', '#38f9d7']}
        />
        <StatCard
          icon="checkmark-circle"
          label="Disponibles"
          value={stats.available}
          color="#10b981"
          gradient={['#10b981', '#059669']}
        />
        <StatCard
          icon="time-outline"
          label="Pendientes"
          value={stats.pending}
          color="#fbbf24"
          gradient={['#fbbf24', '#f59e0b']}
        />
        <StatCard
          icon="heart"
          label="Adoptadas"
          value={stats.adopted}
          color="#f093fb"
          gradient={['#f093fb', '#f5576c']}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
