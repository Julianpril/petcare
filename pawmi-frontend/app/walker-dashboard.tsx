import { apiClient } from '@/lib/api-client';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { BookingCard } from './walker-dashboard/BookingCard';
import { DashboardHeader } from './walker-dashboard/DashboardHeader';
import { EmptyState, LoadingState } from './walker-dashboard/States';
import type { Booking, Stats, TabType } from './walker-dashboard/types';

export default function WalkerDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all bookings (as walker)
      const bookingsData = await apiClient.getMyBookings(true);
      setBookings(bookingsData);

      // Calculate statistics
      calculateStats(bookingsData);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const pending = bookingsData.filter((b) => b.status === 'pending').length;
    const confirmed = bookingsData.filter((b) => b.status === 'confirmed').length;
    const completed = bookingsData.filter((b) => b.status === 'completed');
    const totalEarnings = completed.reduce((sum, b) => sum + b.total_price, 0);

    setStats({
      total_bookings: bookingsData.length,
      pending_bookings: pending,
      confirmed_bookings: confirmed,
      total_earnings: totalEarnings,
      average_rating: 4.8, // TODO: Get from backend
    });
  };

  const filterBookings = () => {
    const now = new Date();

    switch (activeTab) {
      case 'pending':
        return bookings.filter((b) => b.status === 'pending');

      case 'upcoming':
        return bookings.filter(
          (b) =>
            (b.status === 'confirmed' || b.status === 'in_progress') &&
            new Date(b.scheduled_date) >= now
        );

      case 'completed':
        return bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

      default:
        return bookings;
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  ) => {
    try {
      await apiClient.updateBookingStatus(bookingId, newStatus);

      // Update locally
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));

      // Recalculate stats
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      calculateStats(updatedBookings);

      Alert.alert('Éxito', 'Estado actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const filteredBookings = filterBookings();

  return (
    <View style={styles.container}>
      <DashboardHeader
        stats={stats}
        activeTab={activeTab}
        onBack={() => router.back()}
        onRefresh={onRefresh}
        onTabChange={setActiveTab}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />}
      >
        <View style={styles.content}>
          {filteredBookings.length === 0 ? (
            <EmptyState activeTab={activeTab} />
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
