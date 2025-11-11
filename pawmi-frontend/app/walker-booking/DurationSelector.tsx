import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DurationSelectorProps {
  duration: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function DurationSelector({ duration, onDecrease, onIncrease }: DurationSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Duración (horas)</Text>
      <View style={styles.durationControls}>
        <TouchableOpacity style={styles.durationButton} onPress={onDecrease}>
          <Ionicons name="remove" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.durationDisplay}>
          <Text style={styles.durationValue}>{duration}</Text>
          <Text style={styles.durationLabel}>horas</Text>
        </View>

        <TouchableOpacity style={styles.durationButton} onPress={onIncrease}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  durationValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  durationLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
});
