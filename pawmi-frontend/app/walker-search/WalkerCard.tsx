import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SERVICE_TYPES, type Walker } from './types';

interface WalkerCardProps {
  walker: Walker;
  onPress: () => void;
}

export function WalkerCard({ walker, onPress }: WalkerCardProps) {
  return (
    <TouchableOpacity style={styles.walkerCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#667eea" />
          </View>
          {walker.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
          )}
        </View>

        <View style={styles.walkerInfo}>
          <Text style={styles.walkerName}>
            {walker.user?.full_name || 'Paseador'}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#94a3b8" />
            <Text style={styles.locationText}>
              {walker.neighborhood ? `${walker.neighborhood}, ` : ''}
              {walker.city || 'Ciudad'}
            </Text>
            {walker.distance_km && (
              <Text style={styles.distanceText}>• {walker.distance_km.toFixed(1)} km</Text>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.statText}>
                {walker.rating_average ? walker.rating_average.toFixed(1) : 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="walk" size={14} color="#667eea" />
              <Text style={styles.statText}>{walker.total_walks} paseos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#94a3b8" />
              <Text style={styles.statText}>{walker.experience_years} años</Text>
            </View>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${walker.hourly_rate.toLocaleString('es-CO')}</Text>
          <Text style={styles.priceLabel}>/hora</Text>
        </View>
      </View>

      {walker.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {walker.bio}
        </Text>
      )}

      <View style={styles.servicesRow}>
        {walker.services.slice(0, 3).map((service) => {
          const serviceInfo = SERVICE_TYPES.find((s) => s.value === service);
          return (
            <View key={service} style={styles.serviceBadge}>
              <Text style={styles.serviceBadgeText}>{serviceInfo?.label || service}</Text>
            </View>
          );
        })}
        {walker.services.length > 3 && (
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>+{walker.services.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walkerCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F1419',
    borderRadius: 10,
  },
  walkerInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  walkerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  distanceText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  bio: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#2a3142',
  },
  serviceBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
