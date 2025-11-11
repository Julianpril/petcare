import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Pet } from './types';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string;
  loading: boolean;
  error: string | null;
  onSelectPet: (petId: string) => void;
}

export function PetSelector({ pets, selectedPetId, loading, error, onSelectPet }: PetSelectorProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <Ionicons name="paw" size={18} color="#6366f1" />
        <Text style={styles.label}>Selecciona tu mascota</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando mascotas...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={24} color="#f59e0b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
          {pets.map(pet => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petCard, pet.id === selectedPetId && styles.petCardSelected]}
              onPress={() => onSelectPet(pet.id)}
              activeOpacity={0.8}
            >
              <View style={styles.petImageContainer}>
                <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
                {pet.id === selectedPetId && (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.selectedBadge}
                  >
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  </LinearGradient>
                )}
              </View>
              <Text style={[styles.petName, pet.id === selectedPetId && styles.petNameSelected]} numberOfLines={1}>
                {pet.name}
              </Text>
              <Text style={styles.petBreed} numberOfLines={1}>{pet.breed}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  petsScroll: {
    gap: 16,
    paddingVertical: 4,
  },
  petCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#0a0a0b',
    borderWidth: 2,
    borderColor: 'transparent',
    width: 110,
  },
  petCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  petImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16181d',
  },
  petName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 4,
  },
  petNameSelected: {
    color: '#6366f1',
  },
  petBreed: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});
