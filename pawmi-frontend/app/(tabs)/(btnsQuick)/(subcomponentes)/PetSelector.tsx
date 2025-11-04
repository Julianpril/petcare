import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Pet } from './types';

interface PetSelectorProps {
  pets: Pet[];
  loading: boolean;
  onPetSelect: (pet: Pet) => void;
}

export default function PetSelector({ pets, loading, onPetSelect }: PetSelectorProps) {
  if (loading) {
    return (
      <View style={[styles.petSelectorContainer, { alignItems: 'center', paddingVertical: 20 }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando tus mascotas...</Text>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View style={[styles.petSelectorContainer, { alignItems: 'center', paddingVertical: 20 }]}>
        <View style={styles.emptyStateIcon}>
          <Ionicons name="paw-outline" size={48} color="#6366f1" />
        </View>
        <Text style={styles.emptyStateText}>
          No tienes mascotas registradas.{'\n'}
          Registra una para continuar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.petSelectorContainer}>
      {pets.map((pet: Pet) => (
        <TouchableOpacity
          key={pet.id}
          style={styles.petOptionCard}
          onPress={() => onPetSelect(pet)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.petCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {pet.image_url ? (
              <Image
                source={{ uri: pet.image_url }}
                style={styles.petImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.petImagePlaceholder}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={
                      pet.animal_type === 'dog' || pet.species === 'dog' || pet.animal_type?.toLowerCase() === 'perro'
                        ? 'paw'
                        : pet.animal_type === 'cat' || pet.species === 'cat' || pet.animal_type?.toLowerCase() === 'gato'
                        ? 'paw-outline'
                        : 'fish'
                    }
                    size={32}
                    color="#ffffff"
                  />
                </LinearGradient>
              </View>
            )}
            <View style={styles.petInfo}>
              <View style={styles.petNameRow}>
                <Text style={styles.petName}>{pet.name}</Text>
                <View style={styles.radioCircle}>
                  <View style={styles.radioCircleInner} />
                </View>
              </View>
              <Text style={styles.petSubInfo}>
                {pet.breed || 'Sin raza'} • {pet.age}{' '}
                {typeof pet.age === 'string' && pet.age.includes('año') ? '' : pet.age === 1 ? 'año' : 'años'}
                {pet.weight && ` • ${typeof pet.weight === 'string' ? pet.weight : pet.weight + ' kg'}`}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  petSelectorContainer: {
    marginTop: 16,
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 8,
    fontSize: 14,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  petOptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  petCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f2937',
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  petImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    gap: 6,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: -0.3,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0b',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  radioCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6366f1',
  },
  petSubInfo: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    lineHeight: 20,
  },
});
