import { apiClient } from '@/lib/api-client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BottomBar } from './walker-profile/BottomBar';
import { InfoTab } from './walker-profile/InfoTab';
import { ProfileHeader } from './walker-profile/ProfileHeader';
import { ReviewsTab } from './walker-profile/ReviewsTab';
import { ErrorState, LoadingState } from './walker-profile/States';
import { TabsSelector } from './walker-profile/TabsSelector';
import type { Review, WalkerProfile } from './walker-profile/types';

export default function WalkerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const walkerId = params.id as string;

  const [walker, setWalker] = useState<WalkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    if (walkerId) {
      loadWalkerProfile();
      loadReviews();
    }
  }, [walkerId]);

  const loadWalkerProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getWalkerProfile(walkerId);
      setWalker(data);
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del paseador');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await apiClient.getWalkerReviews(walkerId);
      setReviews(data);
    } catch (error: any) {
      console.error('Error al cargar rese�as:', error);
    }
  };

  const handleContact = () => {
    if (!walker) return;

    Alert.alert(
      'Contactar paseador',
      `¿Cómo quieres contactar a ${walker.user?.full_name || 'este paseador'}?`,
      [
        {
          text: 'WhatsApp',
          onPress: () => {
            const phone = walker.user?.phone?.replace(/\D/g, '');
            if (phone) {
              Linking.openURL(`whatsapp://send?phone=${phone}`);
            } else {
              Alert.alert('Error', 'No hay teléfono disponible');
            }
          },
        },
        {
          text: 'Llamar',
          onPress: () => {
            if (walker.user?.phone) {
              Linking.openURL(`tel:${walker.user.phone}`);
            } else {
              Alert.alert('Error', 'No hay teléfono disponible');
            }
          },
        },
        {
          text: 'Email',
          onPress: () => {
            if (walker.user?.email) {
              Linking.openURL(`mailto:${walker.user.email}`);
            } else {
              Alert.alert('Error', 'No hay email disponible');
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleBooking = () => {
    router.push({
      pathname: '/walker-booking',
      params: { walkerId },
    } as any);
  };

  const openMap = () => {
    if (!walker?.latitude || !walker?.longitude) return;

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${walker.latitude},${walker.longitude}`;
    const label = walker.user?.full_name || 'Paseador';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!walker) {
    return <ErrorState onBack={() => router.back()} />;
  }

  return (
    <View style={styles.container}>
      <ProfileHeader walker={walker} onBack={() => router.back()} onContact={handleContact} />

      <TabsSelector
        selectedTab={selectedTab}
        reviewsCount={reviews.length}
        onSelectTab={setSelectedTab}
      />

      <ScrollView style={styles.scrollView}>
        {selectedTab === 'info' ? (
          <InfoTab walker={walker} onOpenMap={openMap} />
        ) : (
          <ReviewsTab reviews={reviews} />
        )}
      </ScrollView>

      <BottomBar onContact={handleContact} onBooking={handleBooking} />
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
});
