import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Pet } from './types';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string;
  onSelectPet: (petId: string) => void;
  loading?: boolean;
}

export function PetSelector({ pets, selectedPetId, onSelectPet, loading }: PetSelectorProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (pets.length === 0) {
    return <Text style={styles.emptyText}>No tienes mascotas registradas</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
      {pets.map(pet => (
        <TouchableOpacity
          key={pet.id}
          style={[styles.petCard, selectedPetId === pet.id && styles.petCardSelected]}
          onPress={() => onSelectPet(pet.id)}
        >
          <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
          <Text style={styles.petName}>{pet.name}</Text>
          {selectedPetId === pet.id && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  petsScroll: {
    flexDirection: 'row',
  },
  petCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    width: 100,
  },
  petCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  petName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
