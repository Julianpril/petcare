import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PetBreedStats } from './types';

type BreedsSectionProps = {
  breedStats: PetBreedStats[];
};

export function BreedsSection({ breedStats }: BreedsSectionProps) {
  if (breedStats.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Razas Más Comunes</Text>
      <View style={styles.breedsContainer}>
        {breedStats.map((item, index) => (
          <View key={item.breed} style={styles.breedItem}>
            <View style={styles.breedHeader}>
              <View style={styles.breedRank}>
                <Text style={styles.breedRankText}>#{index + 1}</Text>
              </View>
              <Text style={styles.breedName}>{item.breed}</Text>
            </View>
            <View style={styles.breedStats}>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={['#43e97b', '#38f9d7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: `${item.percentage}%` }]}
                />
              </View>
              <Text style={styles.breedCount}>
                {item.count} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        ))}
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
  breedsContainer: {
    gap: 12,
  },
  breedItem: {
    backgroundColor: '#16181d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  breedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breedRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(67, 233, 123, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breedRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#43e97b',
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  breedStats: {
    gap: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breedCount: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'right',
  },
});
