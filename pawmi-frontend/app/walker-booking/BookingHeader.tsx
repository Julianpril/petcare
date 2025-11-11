import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Walker } from './types';

interface BookingHeaderProps {
  walker: Walker;
  onBack: () => void;
}

export function BookingHeader({ walker, onBack }: BookingHeaderProps) {
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Reserva</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.walkerInfo}>
        <View style={styles.walkerAvatar}>
          <Ionicons name="person" size={32} color="#667eea" />
        </View>
        <View style={styles.walkerDetails}>
          <Text style={styles.walkerName}>{walker.user.full_name}</Text>
          <Text style={styles.walkerLocation}>
            {walker.neighborhood ? `${walker.neighborhood}, ` : ''}{walker.city}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.priceValue}>${walker.hourly_rate.toLocaleString('es-CO')}</Text>
          <Text style={styles.priceLabel}>/hora</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  walkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  walkerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walkerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  walkerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  walkerLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});
