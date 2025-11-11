import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AdoptionStats } from './types';

type StatusSectionProps = {
  stats: AdoptionStats;
};

export function StatusSection({ stats }: StatusSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estado Actual del Refugio</Text>
      <View style={styles.statusCard}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.statusText}>
            {stats.available} mascota{stats.available !== 1 ? 's' : ''} esperando un hogar
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#fbbf24' }]} />
          <Text style={styles.statusText}>
            {stats.pending} en proceso de adopción
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: '#f093fb' }]} />
          <Text style={styles.statusText}>
            {stats.adopted} ya encontraron familia
          </Text>
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
  statusCard: {
    backgroundColor: '#16181d',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '600',
    flex: 1,
  },
});
