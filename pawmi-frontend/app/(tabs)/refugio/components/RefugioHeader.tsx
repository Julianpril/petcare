import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AdoptionStats } from '../types';

interface RefugioHeaderProps {
  shelterName: string;
  adoptionStats: AdoptionStats;
  statsCollapsed: boolean;
  onToggleStats: () => void;
  onRefresh: () => void;
  onOpenMenu: () => void;
}

export function RefugioHeader({
  shelterName,
  adoptionStats,
  statsCollapsed,
  onToggleStats,
  onRefresh,
  onOpenMenu,
}: RefugioHeaderProps) {
  return (
    <LinearGradient
      colors={['#43e97b', '#38f9d7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>🏠 {shelterName}</Text>
            <Text style={styles.subtext}>Panel de gestión de adopciones</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onRefresh} style={styles.headerButton}>
              <Ionicons name="refresh" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenMenu} style={styles.avatarContainer}>
              <Image source={{ uri: 'https://placekitten.com/100/100' }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.statsToggle}
          onPress={onToggleStats}
          activeOpacity={0.7}
        >
          <Ionicons name={statsCollapsed ? 'chevron-down' : 'chevron-up'} size={24} color="#fff" />
        </TouchableOpacity>

        {!statsCollapsed && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={24} color="#fff" />
              <Text style={styles.statNumber}>{adoptionStats.available}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.statNumber}>{adoptionStats.pending}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.statNumber}>{adoptionStats.adopted}</Text>
              <Text style={styles.statLabel}>Adoptados</Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    gap: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 15,
    color: '#e0fff4',
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#43e97b',
  },
  statsToggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginVertical: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#e0fff4',
    opacity: 0.95,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
