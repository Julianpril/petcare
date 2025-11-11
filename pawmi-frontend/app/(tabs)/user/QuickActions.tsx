import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsProps {
  onAddPet?: () => void;
  onNewAppointment?: () => void;
  onViewHistory?: () => void;
}

export function QuickActions({ onAddPet, onNewAppointment, onViewHistory }: QuickActionsProps) {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.quickActionButton} onPress={onAddPet}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionGradient}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Añadir Mascota</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickActionButton} onPress={onNewAppointment}>
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionGradient}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Nueva Cita</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quickActionButton} onPress={onViewHistory}>
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionGradient}
        >
          <Ionicons name="medkit" size={24} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionText}>Historial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
    textAlign: 'center',
  },
});
