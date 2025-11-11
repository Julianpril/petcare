import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useResponsive } from '../../../../hooks/useResponsive';
import PetCard from '../../petsCacrd';
import type { Pet } from './types';

interface PetsSectionProps {
  pets: Pet[];
  onRefresh: () => void;
  onSelectPet: (pet: Pet) => void;
  onEditPet: (pet: Pet) => void;
  onDeletePet: (pet: Pet) => void;
  onAddPet: () => void;
}

export function PetsSection({
  pets,
  onRefresh,
  onSelectPet,
  onEditPet,
  onDeletePet,
  onAddPet,
}: PetsSectionProps) {
  const responsive = useResponsive();

  const dynamicStyles = StyleSheet.create({
    section: {
      marginBottom: responsive.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: responsive.spacing.lg,
    },
    sectionTitle: {
      fontSize: responsive.fontSize.xl,
      fontWeight: '800',
      color: '#f8fafc',
      letterSpacing: -0.5,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: responsive.spacing.xl * 2,
      paddingHorizontal: responsive.spacing.lg,
      backgroundColor: '#16181d',
      borderRadius: responsive.isSmall ? 16 : 24,
      borderWidth: 1,
      borderColor: '#1f2937',
    },
    emptyIconContainer: {
      width: responsive.isSmall ? 96 : 128,
      height: responsive.isSmall ? 96 : 128,
      borderRadius: responsive.isSmall ? 48 : 64,
      backgroundColor: '#1f2937',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: responsive.spacing.lg,
      borderWidth: 2,
      borderColor: '#334155',
    },
    emptyText: {
      fontSize: responsive.fontSize.lg,
      color: '#e2e8f0',
      fontWeight: '700',
      marginBottom: responsive.spacing.sm,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    emptySubtext: {
      fontSize: responsive.fontSize.md,
      color: '#64748b',
      marginBottom: responsive.spacing.xl,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
    },
  });

  return (
    <View style={dynamicStyles.section}>
      <View style={dynamicStyles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="paw" size={responsive.isSmall ? 18 : 22} color="#f1f5f9" />
          <Text style={dynamicStyles.sectionTitle}>Mis mascotas</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={responsive.isSmall ? 16 : 18} color="#667eea" />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <View style={dynamicStyles.emptyIconContainer}>
            <Ionicons name="paw-outline" size={responsive.isSmall ? 48 : 64} color="#475569" />
          </View>
          <Text style={dynamicStyles.emptyText}>No tienes mascotas registradas</Text>
          <Text style={dynamicStyles.emptySubtext}>Agrega tu primera mascota usando el boton +</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onAddPet}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Agregar mascota</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
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
    shadowColor: '#6366f1',
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
