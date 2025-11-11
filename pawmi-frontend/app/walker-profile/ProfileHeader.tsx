import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WalkerProfile } from './types';

type ProfileHeaderProps = {
  walker: WalkerProfile;
  onBack: () => void;
  onContact: () => void;
};

export function ProfileHeader({ walker, onBack, onContact }: ProfileHeaderProps) {
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onContact} style={styles.headerButton}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={48} color="#667eea" />
        </View>
        {walker.is_verified && (
          <View style={styles.verifiedBadgeLarge}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
          </View>
        )}

        <Text style={styles.walkerName}>
          {walker.user?.full_name || 'Paseador'}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.locationText}>
            {walker.neighborhood ? `${walker.neighborhood}, ` : ''}
            {walker.city || 'Ciudad'}
          </Text>
          {walker.distance_km && (
            <Text style={styles.distanceText}>• {walker.distance_km.toFixed(1)} km</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.statRow}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={styles.statValue}>
                {walker.rating_average ? walker.rating_average.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <Text style={styles.statLabel}>{walker.total_reviews} reseñas</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <View style={styles.statRow}>
              <Ionicons name="walk" size={20} color="#667eea" />
              <Text style={styles.statValue}>{walker.total_walks}</Text>
            </View>
            <Text style={styles.statLabel}>paseos</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <View style={styles.statRow}>
              <Ionicons name="time" size={20} color="#94a3b8" />
              <Text style={styles.statValue}>{walker.experience_years}</Text>
            </View>
            <Text style={styles.statLabel}>años exp.</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifiedBadgeLarge: {
    position: 'absolute',
    top: 0,
    right: '30%',
  },
  walkerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  locationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  distanceText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
