/**
 * Componente de tarjeta de mascota con recomendaciones de comida
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { foodRecommendation, generateFeedingSchedule } from './foodUtils';
import { Pet, Unit } from './types';

type PetFoodCardProps = {
  pet: Pet;
  unit: Unit;
};

export default function PetFoodCard({ pet, unit }: PetFoodCardProps) {
  const schedule = generateFeedingSchedule(pet.breed, pet.age);
  const recommendation = foodRecommendation(pet.breed, pet.weight, unit);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardHeader}
      />

      <View style={styles.cardContent}>
        {/* Header con imagen y datos básicos */}
        <View style={styles.petHeader}>
          <View style={styles.petImageContainer}>
            <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
            <View style={styles.petBadge}>
              <Ionicons name="nutrition" size={16} color="#ffffff" />
            </View>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.petDetails}>
              <View style={styles.petDetailItem}>
                <Ionicons name="paw" size={14} color="#94a3b8" />
                <Text style={styles.petDetailText}>{pet.breed}</Text>
              </View>
              <View style={styles.petDetailItem}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.petDetailText}>{pet.age}</Text>
              </View>
            </View>
            <View style={styles.weightBadge}>
              <Ionicons name="barbell-outline" size={14} color="#6366f1" />
              <Text style={styles.weightText}>{pet.weight} kg</Text>
            </View>
          </View>
        </View>

        {/* Recomendación diaria */}
        <View style={styles.recommendationSection}>
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            style={styles.recommendationBadge}
          >
            <Ionicons name="restaurant" size={20} color="#ffffff" />
          </LinearGradient>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationLabel}>Cantidad diaria</Text>
            <Text style={styles.recommendationAmount}>{recommendation}</Text>
          </View>
        </View>

        {/* Horarios */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Ionicons name="time" size={18} color="#6366f1" />
            <Text style={styles.scheduleTitle}>Horarios recomendados</Text>
          </View>
          <View style={styles.scheduleGrid}>
            {schedule.map((time, idx) => (
              <View key={idx} style={styles.timeChip}>
                <Ionicons name="alarm-outline" size={16} color="#6366f1" />
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Consejos */}
        <View style={styles.tipsSection}>
          <Ionicons name="bulb" size={16} color="#f59e0b" />
          <Text style={styles.tipsText}>
            Divide la cantidad en {schedule.length} porciones iguales
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16181d',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    height: 4,
  },
  cardContent: {
    padding: 20,
  },
  petHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  petImageContainer: {
    position: 'relative',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  petBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#43e97b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16181d',
  },
  petInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  petDetails: {
    gap: 6,
    marginBottom: 8,
  },
  petDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petDetailText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  weightText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },
  recommendationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#0a0a0b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  recommendationBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#43e97b',
    letterSpacing: -0.5,
  },
  scheduleSection: {
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  tipsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
    lineHeight: 18,
  },
});
