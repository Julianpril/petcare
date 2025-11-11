import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchHeaderProps {
  searchCity: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onBack: () => void;
  onToggleFilters: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  maxDistance: number;
}

export function SearchHeader({
  searchCity,
  onSearchChange,
  onClearSearch,
  onBack,
  onToggleFilters,
  userLocation,
  maxDistance,
}: SearchHeaderProps) {
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Paseadores</Text>
        <TouchableOpacity onPress={onToggleFilters} style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ciudad o barrio..."
          placeholderTextColor="#94a3b8"
          value={searchCity}
          onChangeText={onSearchChange}
        />
        {searchCity.length > 0 && (
          <TouchableOpacity onPress={onClearSearch}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {userLocation && (
        <View style={styles.locationInfo}>
          <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationInfoText}>
            Mostrando paseadores a menos de {maxDistance} km
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  locationInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});
