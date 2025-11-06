/**
 * Componente selector de unidades de medida
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Unit } from './types';

type UnitSelectorProps = {
  selectedUnit: Unit;
  onUnitChange: (unit: Unit) => void;
};

const UNITS: { value: Unit; label: string }[] = [
  { value: 'kg', label: 'KG' },
  { value: 'lbs', label: 'LBS' },
  { value: 'cups', label: 'TAZAS' },
];

export default function UnitSelector({ selectedUnit, onUnitChange }: UnitSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Ionicons name="scale-outline" size={18} color="#6366f1" />
        <Text style={styles.labelText}>Unidad de medida</Text>
      </View>
      <View style={styles.selector}>
        {UNITS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            onPress={() => onUnitChange(value)}
            style={[styles.button, selectedUnit === value && styles.buttonActive]}
            activeOpacity={0.7}
          >
            {selectedUnit === value ? (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonTextActive}>{label}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.buttonText}>{label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  selector: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#16181d',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonActive: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  buttonTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
