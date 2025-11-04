import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth-context';

type Pet = {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string; traits: string[];
};

type Unit = 'kg' | 'lbs' | 'cups';

const convertAmount = (amountKg: number, unit: Unit): string => {
  switch (unit) {
    case 'kg': return `${amountKg.toFixed(2)} kg`;
    case 'lbs': return `${(amountKg * 2.20462).toFixed(2)} lbs`;
    case 'cups': return `${(amountKg * 4).toFixed(1)} tazas`;
    default: return `${amountKg.toFixed(2)} kg`;
  }
};

const foodRecommendation = (breed: string, weight: string, unit: Unit): string => {
  const weightNum = parseFloat(weight);
  const baseAmount = isNaN(weightNum) ? 1 : weightNum * 0.03;
  const adjustment: Record<string, number> = { 'labrador': 1.1, 'chihuahua': 0.9, 'persa': 1, 'siamés': 1 };
  const adjustedAmount = baseAmount * (adjustment[breed.toLowerCase()] || 1);
  return convertAmount(adjustedAmount, unit);
};

const generateFeedingSchedule = (breed: string, age: string): string[] => {
  const ageNum = parseInt(age, 10);
  if (!isNaN(ageNum) && ageNum < 1) return ['08:00', '12:00', '16:00', '20:00'];
  const schedule: Record<string, string[]> = { 'labrador': ['07:00', '12:00', '18:00'], 'chihuahua': ['08:30', '13:30', '19:30'] };
  return schedule[breed.toLowerCase()] || ['08:00', '13:00', '19:00'];
};

export default function FoodScreen() {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('kg');

  const fetchPets = useCallback(async () => {
    if (!currentUser) {
      setPets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.getPets();

  const mappedPets: Pet[] = (data ?? []).map((pet: any) => ({
        id: pet.id,
        name: pet.name ?? 'Mascota',
        breed: pet.breed ?? 'Sin raza',
        imageUrl: pet.image_url || 'https://placehold.co/200x200?text=Pawmi',
        age: pet.age ?? 'Edad no registrada',
        weight: (() => {
          if (typeof pet.weight_kg === 'number') {
            return pet.weight_kg.toString();
          }
          if (typeof pet.weight === 'string') {
            const parsed = parseFloat(pet.weight.replace(/[^0-9.,]/g, '').replace(',', '.'));
            if (!Number.isNaN(parsed)) {
              return parsed.toString();
            }
          }
          return '0';
        })(),
        traits: pet.traits ?? [],
      }));

      setPets(mappedPets);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('No se pudo obtener la información de tus mascotas.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="restaurant" size={28} color="#ffffff" />
            <Text style={styles.title}>Recomendaciones</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#6366f1" />
          <Text style={styles.statusText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="restaurant" size={28} color="#ffffff" />
            <Text style={styles.title}>Recomendaciones</Text>
          </View>
        </LinearGradient>
        <View style={styles.centerContainer}>
          <Ionicons name="warning" size={48} color="#f59e0b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="restaurant" size={28} color="#ffffff" />
          <Text style={styles.title}>Recomendaciones de Comida</Text>
        </View>
        <Text style={styles.subtitle}>Planes de alimentación personalizados</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de unidades */}
        <View style={styles.unitSelectorContainer}>
          <View style={styles.unitLabel}>
            <Ionicons name="scale-outline" size={18} color="#6366f1" />
            <Text style={styles.unitLabelText}>Unidad de medida</Text>
          </View>
          <View style={styles.unitSelector}>
            {(['kg', 'lbs', 'cups'] as Unit[]).map(u => (
              <TouchableOpacity 
                key={u} 
                onPress={() => setUnit(u)} 
                style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                activeOpacity={0.7}
              >
                {unit === u ? (
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.unitButtonGradient}
                  >
                    <Text style={styles.unitButtonTextActive}>
                      {u === 'kg' ? 'KG' : u === 'lbs' ? 'LBS' : 'TAZAS'}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.unitButtonText}>
                    {u === 'kg' ? 'KG' : u === 'lbs' ? 'LBS' : 'TAZAS'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cards de mascotas */}
        {pets.map(pet => {
          const schedule = generateFeedingSchedule(pet.breed, pet.age);
          const recommendation = foodRecommendation(pet.breed, pet.weight, unit);
          
          return (
            <View key={pet.id} style={styles.card}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardHeader}
              />
              
              <View style={styles.cardContent}>
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
        })}

        {pets.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="paw" size={48} color="#ffffff" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>No hay mascotas registradas</Text>
            <Text style={styles.emptyText}>
              Agrega tus mascotas para obtener recomendaciones personalizadas de alimentación
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  statusText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  unitSelectorContainer: {
    marginBottom: 24,
  },
  unitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  unitLabelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#16181d',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  unitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  unitButtonActive: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  unitButtonTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  emptyIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});