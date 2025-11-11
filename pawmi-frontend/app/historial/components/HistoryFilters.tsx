import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { HistoryFilterType } from '../types';

interface HistoryFiltersProps {
  value: HistoryFilterType;
  onChange: (filter: HistoryFilterType) => void;
}

export function HistoryFilters({ value, onChange }: HistoryFiltersProps) {
  const options: Array<{ type: HistoryFilterType; label: string; icon: string }> = [
    { type: 'all', label: 'Todo', icon: 'apps' },
    { type: 'reminders', label: 'Recordatorios', icon: 'notifications' },
    { type: 'pets', label: 'Mascotas', icon: 'paw' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(({ type, label, icon }) => {
          const isActive = value === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => onChange(type)}
            >
              <Ionicons name={icon as any} size={18} color={isActive ? '#fff' : '#94a3b8'} />
              <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});
