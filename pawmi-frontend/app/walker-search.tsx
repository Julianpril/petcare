import { apiClient } from '@/lib/api-client';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilterPanel } from './walker-search/FilterPanel';
import { SearchHeader } from './walker-search/SearchHeader';
import { EmptyState, LoadingState } from './walker-search/States';
import { WalkerCard } from './walker-search/WalkerCard';
import type { Walker } from './walker-search/types';

export default function WalkerSearchScreen() {
  const router = useRouter();
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [filteredWalkers, setFilteredWalkers] = useState<Walker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User location
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [locationPermission, setLocationPermission] = useState(false);

  // Filters
  const [searchCity, setSearchCity] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000); // COP
  const [maxDistance, setMaxDistance] = useState<number>(20); // km
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      loadWalkers();
    }
  }, [locationPermission]);

  useEffect(() => {
    applyFilters();
  }, [walkers, searchCity, selectedServices, selectedSize, minRating, maxPrice, maxDistance]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Permiso de ubicaci�n',
          'Para mostrarte paseadores cercanos, necesitamos acceso a tu ubicaci�n.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermission(false);
    }
  };

  const loadWalkers = async () => {
    try {
      setLoading(true);

      const filters: any = {};

      if (userLocation) {
        filters.latitude = userLocation.latitude;
        filters.longitude = userLocation.longitude;
        filters.max_distance_km = maxDistance;
      }

      const data = await apiClient.searchWalkers(filters);
      setWalkers(data);
      setFilteredWalkers(data);
    } catch (error: any) {
      console.error('Error loading walkers:', error);
      Alert.alert('Error', 'No se pudieron cargar los paseadores');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalkers();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...walkers];

    // City filter
    if (searchCity.trim()) {
      filtered = filtered.filter(
        (w) =>
          w.city?.toLowerCase().includes(searchCity.toLowerCase()) ||
          w.neighborhood?.toLowerCase().includes(searchCity.toLowerCase())
      );
    }

    // Services filter
    if (selectedServices.length > 0) {
      filtered = filtered.filter((w) => selectedServices.some((service) => w.services.includes(service)));
    }

    // Pet size filter
    if (selectedSize) {
      filtered = filtered.filter((w) => w.accepted_pet_sizes.includes(selectedSize));
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((w) => (w.rating_average || 0) >= minRating);
    }

    // Price filter
    filtered = filtered.filter((w) => w.hourly_rate <= maxPrice);

    // Distance filter
    if (userLocation && maxDistance > 0) {
      filtered = filtered.filter((w) => !w.distance_km || w.distance_km <= maxDistance);
    }

    // Sort by distance (closest first)
    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = a.distance_km || 999999;
        const distB = b.distance_km || 999999;
        return distA - distB;
      });
    } else {
      // If no location, sort by rating
      filtered.sort((a, b) => {
        const ratingA = a.rating_average || 0;
        const ratingB = b.rating_average || 0;
        return ratingB - ratingA;
      });
    }

    setFilteredWalkers(filtered);
  };

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        searchCity={searchCity}
        onSearchChange={setSearchCity}
        onClearSearch={() => setSearchCity('')}
        onBack={() => router.back()}
        onToggleFilters={() => setShowFilters(!showFilters)}
        userLocation={userLocation}
        maxDistance={maxDistance}
      />

      {showFilters && (
        <FilterPanel
          selectedServices={selectedServices}
          selectedSize={selectedSize}
          maxPrice={maxPrice}
          maxDistance={maxDistance}
          minRating={minRating}
          onToggleService={toggleService}
          onSelectSize={setSelectedSize}
          onChangeMaxPrice={setMaxPrice}
          onChangeMaxDistance={setMaxDistance}
          onChangeMinRating={setMinRating}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredWalkers.length} paseador{filteredWalkers.length !== 1 ? 'es' : ''}{' '}
            {userLocation ? ' cercanos' : ' disponibles'}
          </Text>
        </View>

        {filteredWalkers.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.walkersList}>
            {filteredWalkers.map((walker) => (
              <WalkerCard
                key={walker.id}
                walker={walker}
                onPress={() => router.push(`/walker-profile?id=${walker.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3142',
  },
  resultsCount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  walkersList: {
    padding: 16,
    gap: 16,
  },
});
