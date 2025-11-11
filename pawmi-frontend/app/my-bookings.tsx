import { apiClient } from '@/lib/api-client';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { BookingCard } from './my-bookings/BookingCard';
import { BookingsHeader } from './my-bookings/BookingsHeader';
import { EmptyState, LoadingState } from './my-bookings/States';
import type { Booking, TabType } from './my-bookings/types';

export default function MyBookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await apiClient.getMyBookings(false);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error al cargar reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filterBookings = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(
          (b) =>
            (b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress') &&
            new Date(b.scheduled_date) >= now
        ).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
      
      case 'completed':
        return bookings.filter(
          (b) => b.status === 'completed' || b.status === 'cancelled' || new Date(b.scheduled_date) < now
        ).sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
      
      default:
        return bookings;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.updateBookingStatus(bookingId, 'cancelled');
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId ? { ...b, status: 'cancelled' } : b
                )
              );
              Alert.alert('Éxito', 'Reserva cancelada');
            } catch (error: any) {
              console.error('Error al cancelar reserva:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleContactWalker = (walker: any) => {
    Alert.alert(
      'Contactar paseador',
      `${walker.user.full_name}`,
      [
        {
          text: 'Llamar',
          onPress: () => {
            if (walker.user.phone) {
              Linking.openURL(`tel:${walker.user.phone}`);
            } else {
              Alert.alert('Info', 'No hay teléfono disponible');
            }
          },
        },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL(`mailto:${walker.user.email}`);
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  const filteredBookings = filterBookings();

  return (
    <View style={styles.container}>
      <BookingsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => router.back()}
        onRefresh={onRefresh}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        <View style={styles.content}>
          {filteredBookings.length === 0 ? (
            <EmptyState
              activeTab={activeTab}
              onSearchPress={() => router.push('/walker-search' as any)}
            />
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onContact={handleContactWalker}
                onCancel={handleCancelBooking}
              />
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
