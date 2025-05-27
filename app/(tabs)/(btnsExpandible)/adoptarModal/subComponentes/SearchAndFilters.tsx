// components/SearchAndFilters.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type FilterType = 'all' | 'dog' | 'cat' | 'small';

type SearchAndFiltersProps = {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  resultsCount: number;
};

const SearchAndFilters = ({
  searchText,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  resultsCount
}: SearchAndFiltersProps) => {
  const filters = [
    { key: 'all', label: 'Todos', icon: 'grid' },
    { key: 'dog', label: 'Perros', icon: 'heart' },
    { key: 'cat', label: 'Gatos', icon: 'star' },
    { key: 'small', label: 'Pequeños', icon: 'circle' }
  ] as const;

  return (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#AAB4C0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mascota por nombre, raza o ciudad..."
          placeholderTextColor="#AAB4C0"
          value={searchText}
          onChangeText={onSearchChange}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Feather name="x" size={20} color="#AAB4C0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
      >
        {filters.map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterButton,
              selectedFilter === key && styles.activeFilterButton
            ]}
            onPress={() => onFilterChange(key)}
          >
            <Feather 
              name={icon} 
              size={16} 
              color={selectedFilter === key ? '#EAEAEA' : '#AAB4C0'} 
            />
            <Text style={[
              styles.filterText,
              selectedFilter === key && styles.activeFilterText
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <Text style={styles.resultsText}>
        {resultsCount} mascota{resultsCount !== 1 ? 's' : ''} disponible{resultsCount !== 1 ? 's' : ''}
        {searchText && ` para "${searchText}"`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A38',
    margin: 20,
    padding: 15,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#EAEAEA',
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A38',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#47a9ff',
  },
  filterText: {
    marginLeft: 6,
    color: '#AAB4C0',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#EAEAEA',
  },
  resultsText: {
    color: '#AAB4C0',
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 14,
  },
});

export default SearchAndFilters;