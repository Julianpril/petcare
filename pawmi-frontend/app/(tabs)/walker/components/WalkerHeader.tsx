import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { WalkerStats } from './types';

interface WalkerHeaderProps {
  userName: string;
  stats: WalkerStats;
  hasProfile: boolean;
  onNavigateToUser: () => void;
}

export function WalkerHeader({ userName, stats, hasProfile, onNavigateToUser }: WalkerHeaderProps) {
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onNavigateToUser} style={styles.headerButton}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.subtitle}>Panel de Paseador Profesional</Text>
        </View>
        <View style={styles.profileCircle}>
          <Ionicons name="walk" size={32} color="#fff" />
        </View>
      </View>

      {hasProfile && (
        <View style={styles.ratingBox}>
          <View style={styles.ratingItem}>
            <Ionicons name="star" size={24} color="#fbbf24" />
            <Text style={styles.ratingValue}>{stats.rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>Rating</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingItem}>
            <Ionicons name="footsteps" size={24} color="#fff" />
            <Text style={styles.ratingValue}>{stats.total_walks}</Text>
            <Text style={styles.ratingLabel}>Paseos</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingItem}>
            <Ionicons name="cash" size={24} color="#10b981" />
            <Text style={styles.ratingValue}>${stats.total_earnings.toLocaleString('es-CO')}</Text>
            <Text style={styles.ratingLabel}>Ganado</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  ratingItem: {
    flex: 1,
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  ratingDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
});
