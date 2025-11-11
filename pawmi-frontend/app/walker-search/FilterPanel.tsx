import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_SIZES, SERVICE_TYPES } from './types';

interface FilterPanelProps {
  selectedServices: string[];
  selectedSize: string | null;
  maxPrice: number;
  maxDistance: number;
  minRating: number;
  onToggleService: (service: string) => void;
  onSelectSize: (size: string | null) => void;
  onChangeMaxPrice: (price: number) => void;
  onChangeMaxDistance: (distance: number) => void;
  onChangeMinRating: (rating: number) => void;
}

export function FilterPanel({
  selectedServices,
  selectedSize,
  maxPrice,
  maxDistance,
  minRating,
  onToggleService,
  onSelectSize,
  onChangeMaxPrice,
  onChangeMaxDistance,
  onChangeMinRating,
}: FilterPanelProps) {
  return (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Filtro de servicios */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Servicios:</Text>
          <View style={styles.filterChips}>
            {SERVICE_TYPES.map((service) => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.filterChip,
                  selectedServices.includes(service.value) && styles.filterChipActive,
                ]}
                onPress={() => onToggleService(service.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedServices.includes(service.value) && styles.filterChipTextActive,
                  ]}
                >
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtro de tamaño */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Tamaño mascota:</Text>
          <View style={styles.filterChips}>
            {PET_SIZES.map((size) => (
              <TouchableOpacity
                key={size.value}
                style={[
                  styles.filterChip,
                  selectedSize === size.value && styles.filterChipActive,
                ]}
                onPress={() => onSelectSize(selectedSize === size.value ? null : size.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSize === size.value && styles.filterChipTextActive,
                  ]}
                >
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Controles de precio y distancia */}
      <View style={styles.slidersContainer}>
        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Precio máximo: ${maxPrice.toLocaleString('es-CO')} COP/h</Text>
          <View style={styles.sliderButtons}>
            {[10000, 20000, 30000, 50000, 100000].map((price) => (
              <TouchableOpacity
                key={price}
                style={[styles.sliderButton, maxPrice === price && styles.sliderButtonActive]}
                onPress={() => onChangeMaxPrice(price)}
              >
                <Text
                  style={[
                    styles.sliderButtonText,
                    maxPrice === price && styles.sliderButtonTextActive,
                  ]}
                >
                  ${(price / 1000).toFixed(0)}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>Distancia máxima: {maxDistance} km</Text>
          <View style={styles.sliderButtons}>
            {[5, 10, 20, 50].map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.sliderButton,
                  maxDistance === distance && styles.sliderButtonActive,
                ]}
                onPress={() => onChangeMaxDistance(distance)}
              >
                <Text
                  style={[
                    styles.sliderButtonText,
                    maxDistance === distance && styles.sliderButtonTextActive,
                  ]}
                >
                  {distance}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sliderSection}>
          <Text style={styles.sliderLabel}>
            Rating mínimo: {minRating > 0 ? `${minRating}⭐` : 'Todos'}
          </Text>
          <View style={styles.sliderButtons}>
            {[0, 3, 4, 4.5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.sliderButton, minRating === rating && styles.sliderButtonActive]}
                onPress={() => onChangeMinRating(rating)}
              >
                <Text
                  style={[
                    styles.sliderButtonText,
                    minRating === rating && styles.sliderButtonTextActive,
                  ]}
                >
                  {rating > 0 ? `${rating}⭐` : 'Todos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: '#1a1f2e',
    paddingVertical: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
  },
  filterLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2a3142',
    borderWidth: 1,
    borderColor: '#3a4152',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  slidersContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  sliderSection: {
    gap: 8,
  },
  sliderLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2a3142',
    borderWidth: 1,
    borderColor: '#3a4152',
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sliderButtonText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  sliderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
