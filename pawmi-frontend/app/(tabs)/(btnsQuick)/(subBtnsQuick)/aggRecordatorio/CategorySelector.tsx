import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Category } from './types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategorySelector({ categories, selectedCategory, onSelectCategory }: CategorySelectorProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <Ionicons name="pricetag" size={18} color="#6366f1" />
        <Text style={styles.label}>Categoría</Text>
      </View>
      <View style={styles.categoriesGrid}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipSelected
            ]}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
              <Feather name={cat.icon as any} size={18} color={selectedCategory === cat.id ? '#ffffff' : cat.color} />
            </View>
            <Text style={[
              styles.categoryText,
              selectedCategory === cat.id && styles.categoryTextSelected
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#0a0a0b',
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 140,
  },
  categoryChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
});
