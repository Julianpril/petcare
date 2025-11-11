import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AdoptionStats } from './types';

type PeriodSectionProps = {
  stats: AdoptionStats;
};

export function PeriodSection({ stats }: PeriodSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Adopciones por Período</Text>
      <View style={styles.periodGrid}>
        <View style={styles.periodCard}>
          <View style={styles.periodIconContainer}>
            <Ionicons name="calendar-outline" size={24} color="#4facfe" />
          </View>
          <Text style={styles.periodValue}>{stats.thisMonth}</Text>
          <Text style={styles.periodLabel}>Este mes</Text>
        </View>
        <View style={styles.periodCard}>
          <View style={styles.periodIconContainer}>
            <Ionicons name="calendar" size={24} color="#f093fb" />
          </View>
          <Text style={styles.periodValue}>{stats.thisYear}</Text>
          <Text style={styles.periodLabel}>Este año</Text>
        </View>
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
  periodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  periodCard: {
    flex: 1,
    backgroundColor: '#16181d',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  periodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -1,
  },
  periodLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
