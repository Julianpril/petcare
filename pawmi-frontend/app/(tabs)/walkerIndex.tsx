import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import CreateWalkerProfileModal from '../../components/CreateWalkerProfileModal';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { NoProfileCard } from './walker/components/NoProfileCard';
import { PendingAlert } from './walker/components/PendingAlert';
import { QuickActions } from './walker/components/QuickActions';
import { StatsGrid } from './walker/components/StatsGrid';
import { TipsSection } from './walker/components/TipsSection';
import { WalkerHeader } from './walker/components/WalkerHeader';
import type { QuickAction, WalkerStats } from './walker/components/types';

export default function WalkerHomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [walkerProfile, setWalkerProfile] = useState<any>(null);
  const [stats, setStats] = useState<WalkerStats>({
    pending_count: 0,
    upcoming_count: 0,
    completed_count: 0,
    total_earnings: 0,
    rating: 0,
    total_walks: 0,
  });
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Intentar cargar perfil de paseador
      try {
        const profile = await apiClient.getMyWalkerProfile();
        setHasProfile(true);
        setWalkerProfile(profile);

        // Cargar reservas
        const bookings = await apiClient.getMyBookings(true);

        const pending = bookings.filter((b: any) => b.status === 'pending');
        const upcoming = bookings.filter(
          (b: any) =>
            (b.status === 'confirmed' || b.status === 'in_progress') &&
            new Date(b.scheduled_date) >= new Date()
        );
        const completed = bookings.filter((b: any) => b.status === 'completed');
        const totalEarnings = completed.reduce((sum: number, b: any) => sum + b.total_price, 0);

        setStats({
          pending_count: pending.length,
          upcoming_count: upcoming.length,
          completed_count: completed.length,
          total_earnings: totalEarnings,
          rating: profile.rating_average || 0,
          total_walks: profile.total_walks || 0,
        });
      } catch (error) {
        // No tiene perfil de paseador aun
        setHasProfile(false);
        setWalkerProfile(null);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'bookings',
      icon: 'calendar-outline',
      label: 'Ver Reservas',
      color: '#f59e0b',
      onPress: () => router.push('/walker-dashboard' as any),
      show: hasProfile,
    },
    {
      id: 'dashboard',
      icon: 'briefcase',
      label: 'Panel de Control',
      color: '#8b5cf6',
      onPress: () => router.push('/walker-dashboard' as any),
      show: hasProfile,
    },
    {
      id: 'profile',
      icon: 'person-circle',
      label: hasProfile ? 'Editar Perfil' : 'Crear Perfil',
      color: '#667eea',
      onPress: () => setShowProfileModal(true),
      show: true,
    },
    {
      id: 'plans',
      icon: 'diamond',
      label: 'Ver Planes',
      color: '#fbbf24',
      onPress: () => router.push('/planes-paseador' as any),
      show: true,
    },
    {
      id: 'earnings',
      icon: 'cash',
      label: 'Mis Ganancias',
      color: '#10b981',
      onPress: () => router.push('/walker-dashboard' as any),
      show: hasProfile,
    },
    {
      id: 'calendar',
      icon: 'calendar',
      label: 'Calendario',
      color: '#3b82f6',
      onPress: () => router.push('/walker-dashboard' as any),
      show: hasProfile,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const userName = currentUser?.full_name || 'Paseador';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        <WalkerHeader
          userName={userName}
          stats={stats}
          hasProfile={hasProfile}
          onNavigateToUser={() => router.push('/(tabs)/user')}
        />

        {hasProfile && stats.pending_count > 0 && (
          <PendingAlert
            pendingCount={stats.pending_count}
            onPress={() => router.push('/walker-dashboard' as any)}
          />
        )}

        {!hasProfile && <NoProfileCard onCreateProfile={() => setShowProfileModal(true)} />}

        {hasProfile && <StatsGrid stats={stats} />}

        <QuickActions actions={quickActions} />

        <TipsSection />
      </ScrollView>

      <CreateWalkerProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => {
          setShowProfileModal(false);
          loadDashboardData();
        }}
        existingProfile={walkerProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
});
