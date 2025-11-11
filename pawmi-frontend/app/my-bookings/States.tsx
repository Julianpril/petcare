import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TabType } from './types';

interface LoadingStateProps {}

export function LoadingState({}: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

interface EmptyStateProps {
  activeTab: TabType;
  onSearchPress: () => void;
}

export function EmptyState({ activeTab, onSearchPress }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color="#64748b" />
      <Text style={styles.emptyText}>
        {activeTab === 'upcoming'
          ? 'No tienes reservas próximas'
          : 'No tienes historial de reservas'}
      </Text>
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.searchButtonGradient}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Buscar paseadores</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
