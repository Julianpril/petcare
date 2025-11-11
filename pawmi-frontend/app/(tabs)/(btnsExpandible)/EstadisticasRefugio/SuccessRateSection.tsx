import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AdoptionStats } from './types';

type SuccessRateSectionProps = {
  stats: AdoptionStats;
};

export function SuccessRateSection({ stats }: SuccessRateSectionProps) {
  const successRate = stats.total > 0 ? ((stats.adopted / stats.total) * 100).toFixed(1) : '0';

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tasa de Éxito</Text>
      <View style={styles.successCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successGradient}
        >
          <View style={styles.successContent}>
            <Text style={styles.successValue}>{successRate}%</Text>
            <Text style={styles.successLabel}>Tasa de adopción exitosa</Text>
            <Text style={styles.successSubtext}>
              {stats.adopted} de {stats.total} mascotas encontraron un hogar
            </Text>
          </View>
        </LinearGradient>
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
  successCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successGradient: {
    padding: 32,
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    gap: 8,
  },
  successValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  successLabel: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    opacity: 0.95,
  },
  successSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
});
