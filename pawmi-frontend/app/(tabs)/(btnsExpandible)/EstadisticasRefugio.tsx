import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth-context';

const { width } = Dimensions.get('window');

type AdoptionStats = {
  total: number;
  available: number;
  pending: number;
  adopted: number;
  thisMonth: number;
  thisYear: number;
};

type PetBreedStats = {
  breed: string;
  count: number;
  percentage: number;
};

export default function EstadisticasRefugio() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdoptionStats>({
    total: 0,
    available: 0,
    pending: 0,
    adopted: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [breedStats, setBreedStats] = useState<PetBreedStats[]>([]);
  const [pets, setPets] = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const petsData = await apiClient.getPets();
      setPets(petsData || []);

      // Calcular estadísticas
      const adoptionPets = (petsData || []).filter((pet: any) => pet.is_for_adoption);
      
      const available = adoptionPets.filter((pet: any) => pet.adoption_status === 'available').length;
      const pending = adoptionPets.filter((pet: any) => pet.adoption_status === 'pending').length;
      const adopted = adoptionPets.filter((pet: any) => pet.adoption_status === 'adopted').length;

      // Adopciones del mes y año actual
      const now = new Date();
      const thisMonthAdopted = adoptionPets.filter((pet: any) => {
        if (pet.adoption_status !== 'adopted' || !pet.updated_at) return false;
        const updatedDate = new Date(pet.updated_at);
        return updatedDate.getMonth() === now.getMonth() && 
               updatedDate.getFullYear() === now.getFullYear();
      }).length;

      const thisYearAdopted = adoptionPets.filter((pet: any) => {
        if (pet.adoption_status !== 'adopted' || !pet.updated_at) return false;
        const updatedDate = new Date(pet.updated_at);
        return updatedDate.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        total: adoptionPets.length,
        available,
        pending,
        adopted,
        thisMonth: thisMonthAdopted,
        thisYear: thisYearAdopted,
      });

      // Estadísticas por raza
      const breedCount: { [key: string]: number } = {};
      adoptionPets.forEach((pet: any) => {
        const breed = pet.breed || 'Sin raza';
        breedCount[breed] = (breedCount[breed] || 0) + 1;
      });

      const breedStatsData = Object.entries(breedCount)
        .map(([breed, count]) => ({
          breed,
          count,
          percentage: (count / adoptionPets.length) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setBreedStats(breedStatsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color, 
    gradient 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: number | string; 
    color: string; 
    gradient: [string, string];
  }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#43e97b', '#38f9d7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas de Adopción</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#43e97b" />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  const successRate = stats.total > 0 ? ((stats.adopted / stats.total) * 100).toFixed(1) : '0';
  const shelterName = (currentUser as any)?.shelter_name || 'Refugio';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Estadísticas de Adopción</Text>
          <Text style={styles.headerSubtitle}>{shelterName}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="heart-outline"
              label="Total en adopción"
              value={stats.total}
              color="#43e97b"
              gradient={['#43e97b', '#38f9d7']}
            />
            <StatCard
              icon="checkmark-circle"
              label="Disponibles"
              value={stats.available}
              color="#10b981"
              gradient={['#10b981', '#059669']}
            />
            <StatCard
              icon="time-outline"
              label="Pendientes"
              value={stats.pending}
              color="#fbbf24"
              gradient={['#fbbf24', '#f59e0b']}
            />
            <StatCard
              icon="heart"
              label="Adoptadas"
              value={stats.adopted}
              color="#f093fb"
              gradient={['#f093fb', '#f5576c']}
            />
          </View>
        </View>

        {/* Tasa de Éxito */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasa de Éxito</Text>
          <View style={styles.successCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successGradient}
            >
              <View style={styles.successContent}>
                <Text style={styles.successValue}>{successRate}%</Text>
                <Text style={styles.successLabel}>Tasa de adopción exitosa</Text>
                <Text style={styles.successSubtext}>
                  {stats.adopted} de {stats.total} mascotas encontraron un hogar
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Adopciones por Período */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adopciones por Período</Text>
          <View style={styles.periodGrid}>
            <View style={styles.periodCard}>
              <View style={styles.periodIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#4facfe" />
              </View>
              <Text style={styles.periodValue}>{stats.thisMonth}</Text>
              <Text style={styles.periodLabel}>Este mes</Text>
            </View>
            <View style={styles.periodCard}>
              <View style={styles.periodIconContainer}>
                <Ionicons name="calendar" size={24} color="#f093fb" />
              </View>
              <Text style={styles.periodValue}>{stats.thisYear}</Text>
              <Text style={styles.periodLabel}>Este año</Text>
            </View>
          </View>
        </View>

        {/* Razas Más Comunes */}
        {breedStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Razas Más Comunes</Text>
            <View style={styles.breedsContainer}>
              {breedStats.map((item, index) => (
                <View key={item.breed} style={styles.breedItem}>
                  <View style={styles.breedHeader}>
                    <View style={styles.breedRank}>
                      <Text style={styles.breedRankText}>#{index + 1}</Text>
                    </View>
                    <Text style={styles.breedName}>{item.breed}</Text>
                  </View>
                  <View style={styles.breedStats}>
                    <View style={styles.progressBarContainer}>
                      <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${item.percentage}%` }]}
                      />
                    </View>
                    <Text style={styles.breedCount}>
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Estado Actual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado Actual del Refugio</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.statusText}>
                {stats.available} mascota{stats.available !== 1 ? 's' : ''} esperando un hogar
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#fbbf24' }]} />
              <Text style={styles.statusText}>
                {stats.pending} en proceso de adopción
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#f093fb' }]} />
              <Text style={styles.statusText}>
                {stats.adopted} ya encontraron familia
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0fff4',
    opacity: 0.9,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statGradient: {
    padding: 20,
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '600',
  },
  successCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  successGradient: {
    padding: 32,
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    gap: 8,
  },
  successValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  successLabel: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    opacity: 0.95,
  },
  successSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  periodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  periodCard: {
    flex: 1,
    backgroundColor: '#16181d',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  periodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 172, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -1,
  },
  periodLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  breedsContainer: {
    gap: 12,
  },
  breedItem: {
    backgroundColor: '#16181d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  breedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breedRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(67, 233, 123, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breedRankText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#43e97b',
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  breedStats: {
    gap: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breedCount: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'right',
  },
  statusCard: {
    backgroundColor: '#16181d',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '600',
    flex: 1,
  },
});
