import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsProps {
  onPublish: () => void;
  onViewStats: () => void;
  onAddAppointment: () => void;
}

export function QuickActions({ onPublish, onViewStats, onAddAppointment }: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Gestión rápida</Text>
      <View style={styles.actionsRow}>
        <ActionButton
          onPress={onPublish}
          icon="add-circle"
          gradientColors={['#f093fb', '#f5576c']}
          label="Publicar"
        />
        <ActionButton
          onPress={onViewStats}
          icon="stats-chart"
          gradientColors={['#43e97b', '#38f9d7']}
          label="Estadísticas"
        />
        <ActionButton
          onPress={onAddAppointment}
          icon="calendar"
          gradientColors={['#4facfe', '#00f2fe']}
          label="Citas"
        />
      </View>
    </View>
  );
}

interface ActionButtonProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  label: string;
}

function ActionButton({ onPress, icon, gradientColors, label }: ActionButtonProps) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionGradient}
      >
        <Ionicons name={icon} size={28} color="#fff" />
      </LinearGradient>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  actionGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
