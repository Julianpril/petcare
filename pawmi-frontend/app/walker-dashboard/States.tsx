import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { TabType } from './types';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  activeTab: TabType;
}

export function EmptyState({ activeTab }: EmptyStateProps) {
  const messages = {
    pending: 'No tienes reservas pendientes',
    upcoming: 'No tienes reservas próximas',
    completed: 'No tienes historial aún',
  };

  return (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color="#64748b" />
      <Text style={styles.emptyText}>{messages[activeTab]}</Text>
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
  },
});
