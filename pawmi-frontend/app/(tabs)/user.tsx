//app/(tabs)/user.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { AppInfo } from './user/AppInfo';
import { LogoutButton } from './user/LogoutButton';
import { MenuSection } from './user/MenuSection';
import { QuickActions } from './user/QuickActions';
import { LoadingState } from './user/States';
import type { MenuItem } from './user/types';
import { UserHeader } from './user/UserHeader';

export default function UserScreen() {
  const { logout, currentUser } = useAuth();
  const router = useRouter();
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petsCount, setPetsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [pets, reminders] = await Promise.all([
        apiClient.getPets(),
        apiClient.getReminders(),
      ]);
      
      setPetsCount(pets.length);
      setRemindersCount(reminders.filter((r: any) => r.is_active).length);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = async () => {
    try {
      console.log('Usuario confirmo logout');
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLogoutModalVisible(false);
      router.replace('/login');
    }
  };

  const profileOptions: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Información personal',
      subtitle: 'Edita tu perfil y datos personales',
      color: '#667eea',
  onPress: () => router.push('/(tabs)/personalInfo' as any),
    },
    {
      icon: 'paw-outline',
      title: 'Mis mascotas',
      subtitle: 'Gestiona la información de tus mascotas',
      color: '#f093fb',
  onPress: () => router.push('/(tabs)/userIndex'),
    },
    {
      icon: 'diamond-outline',
      title: 'Ver Planes',
      subtitle: 'Descubre nuestros planes premium',
      color: '#fbbf24',
      onPress: () => router.push('/planes' as any),
    },
    ...(currentUser?.role === 'walker' ? [{
      icon: 'briefcase-outline',
      title: 'Panel de Paseador',
      subtitle: 'Gestiona tus reservas y servicios',
      color: '#8b5cf6',
      onPress: () => router.push('/walker-dashboard' as any),
    }] : []),
    {
      icon: 'walk-outline',
      title: 'Buscar Paseadores',
      subtitle: 'Encuentra paseadores profesionales cerca de ti',
      color: '#10b981',
      onPress: () => router.push('/walker-search' as any),
    },
    {
      icon: 'book-outline',
      title: 'Mis Reservas',
      subtitle: 'Ver tus reservas de paseadores',
      color: '#3b82f6',
      onPress: () => router.push('/my-bookings' as any),
    },
    {
      icon: 'calendar-outline',
      title: 'Recordatorios',
      subtitle: 'Configura recordatorios y citas',
      color: '#4facfe',
  onPress: () => router.push('/(tabs)/(btnsQuick)/(recordatorios)/recordatorios'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Configura alertas y recordatorios',
      color: '#fa709a',
  onPress: () => router.push('/(tabs)/notifications' as any),
    },
    {
      icon: 'moon-outline',
      title: 'Modo oscuro',
      subtitle: 'Cambia la apariencia de la app',
      color: '#43e97b',
      isSwitch: true,
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
    },
  ];

  const supportOptions: MenuItem[] = [
    {
      icon: 'help-circle-outline',
      title: 'Centro de ayuda',
      subtitle: 'Encuentra respuestas a tus preguntas',
      color: '#667eea',
  onPress: () => router.push('/(tabs)/helpCenter' as any),
    },
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'Contactar soporte',
      subtitle: 'Envía un mensaje a nuestro equipo',
      color: '#f093fb',
  onPress: () => router.push('/(tabs)/support' as any),
    },
    {
      icon: 'star-outline',
      title: 'Calificar la app',
      subtitle: 'Ayúdanos a mejorar con tu opinión',
      color: '#feca57',
  onPress: () => router.push('/(tabs)/rateApp' as any),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacidad y términos',
      subtitle: 'Lee nuestras políticas',
      color: '#48dbfb',
  onPress: () => router.push('/(tabs)/privacy' as any),
    },
  ];

  const benefitOptions: MenuItem[] = [
    {
      icon: 'gift-outline',
      title: 'Cupones y Aliados',
      subtitle: 'Descubre beneficios exclusivos para tu mascota',
      color: '#ff9f43',
  onPress: () => router.push('/(tabs)/aliados' as any),
    },
  ];

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <UserHeader
              userName={currentUser?.full_name || currentUser?.username || 'Usuario'}
              userEmail={currentUser?.email || 'correo@ejemplo.com'}
              profileImageUrl={currentUser?.profile_image_url}
              stats={{ petsCount, appointmentsCount, remindersCount }}
              onBack={() => router.back()}
            />

            <View style={styles.content}>
              <QuickActions
                onAddPet={() => router.push('/(tabs)/userIndex')}
                onNewAppointment={() => {}}
                onViewHistory={() => router.push('/historial' as any)}
              />

              <MenuSection icon="person" title="Mi Perfil" items={profileOptions} />
              <MenuSection icon="help-circle" title="Soporte" items={supportOptions} />
              <MenuSection icon="gift" title="Beneficios" items={benefitOptions} />

              <LogoutButton onPress={() => setLogoutModalVisible(true)} />

              <AppInfo />
            </View>
          </>
        )}
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
});
