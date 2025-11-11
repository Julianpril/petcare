import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PeriodType } from './types';

interface PeriodToggleProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PeriodToggle({ selectedPeriod, onPeriodChange }: PeriodToggleProps) {
  return (
    <View style={styles.periodToggleContainer}>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
        onPress={() => onPeriodChange('monthly')}
      >
        <Text
          style={[
            styles.periodButtonText,
            selectedPeriod === 'monthly' && styles.periodButtonTextActive,
          ]}
        >
          Mensual
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'yearly' && styles.periodButtonActive]}
        onPress={() => onPeriodChange('yearly')}
      >
        <Text
          style={[
            styles.periodButtonText,
            selectedPeriod === 'yearly' && styles.periodButtonTextActive,
          ]}
        >
          Anual
        </Text>
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>Ahorra 17%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  periodToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});
