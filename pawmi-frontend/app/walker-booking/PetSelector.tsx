import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Pet } from './types';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string;
  onSelectPet: (petId: string) => void;
  onAddPet: () => void;
}

export function PetSelector({ pets, selectedPetId, onSelectPet, onAddPet }: PetSelectorProps) {
  if (pets.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mascota</Text>
        <View style={styles.emptyState}>
          <Ionicons name="paw" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
          <TouchableOpacity style={styles.addPetButton} onPress={onAddPet}>
            <Text style={styles.addPetButtonText}>Agregar mascota</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mascota</Text>
      <View style={styles.optionsGrid}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.optionCard,
              selectedPetId === pet.id && styles.optionCardSelected,
            ]}
            onPress={() => onSelectPet(pet.id)}
          >
            <Ionicons
              name="paw"
              size={24}
              color={selectedPetId === pet.id ? '#667eea' : '#94a3b8'}
            />
            <Text
              style={[
                styles.optionText,
                selectedPetId === pet.id && styles.optionTextSelected,
              ]}
            >
              {pet.name}
            </Text>
            {pet.breed && <Text style={styles.optionSubtext}>{pet.breed}</Text>}
            {selectedPetId === pet.id && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              </View>
            )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a3142',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#1e2439',
  },
  optionText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  optionSubtext: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 12,
    marginBottom: 16,
  },
  addPetButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
