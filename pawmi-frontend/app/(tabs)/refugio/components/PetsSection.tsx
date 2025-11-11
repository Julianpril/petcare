import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PetCard from '../../petsCacrd';
import type { Pet } from '../types';

interface PetsSectionProps {
  pets: Pet[];
  onRefresh: () => void;
  onSelectPet: (pet: Pet) => void;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (pet: Pet) => void;
  onPublishPet: () => void;
}

export function PetsSection({
  pets,
  onRefresh,
  onSelectPet,
  onEditPet,
  onDeletePet,
  onPublishPet,
}: PetsSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="heart" size={22} color="#43e97b" />
          <Text style={styles.sectionTitle}>Mascotas en adopción</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={18} color="#43e97b" />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={64} color="#475569" />
          </View>
          <Text style={styles.emptyText}>No hay mascotas publicadas</Text>
          <Text style={styles.emptySubtext}>Publica tu primera mascota para adopción</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onPublishPet}>
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Publicar mascota</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        pets.map((pet) => (
          <PetCard
            key={pet.id}
            name={pet.name}
            breed={pet.breed}
            imageUrl={pet.imageUrl}
            age={pet.age}
            weight={pet.weight}
            traits={pet.traits}
            onPress={() => onSelectPet(pet)}
            onEdit={() => onEditPet(pet)}
            onDelete={() => onDeletePet(pet)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 233, 123, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
    borderColor: 'rgba(67, 233, 123, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    backgroundColor: '#16181d',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  emptyIconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 20,
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
