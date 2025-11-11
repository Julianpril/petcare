import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PendingAlertProps {
  pendingCount: number;
  onPress: () => void;
}

export function PendingAlert({ pendingCount, onPress }: PendingAlertProps) {
  return (
    <TouchableOpacity style={styles.alertCard} onPress={onPress}>
      <LinearGradient colors={['#f59e0b', '#ef4444']} style={styles.alertGradient}>
        <Ionicons name="notifications" size={32} color="#fff" />
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>
            {pendingCount} {pendingCount === 1 ? 'Reserva pendiente' : 'Reservas pendientes'}
          </Text>
          <Text style={styles.alertSubtitle}>Toca para revisar y aceptar</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});
