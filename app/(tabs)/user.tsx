//app/(tabs)/user.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../Auth';
import { useRouter } from 'expo-router';

export default function UserScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const profileOptions = [
    {
      icon: 'user',
      title: 'Información personal',
      subtitle: 'Edita tu perfil y datos personales',
      onPress: () => console.log('Información personal'),
    },
    {
      icon: 'heart',
      title: 'Mis mascotas',
      subtitle: 'Gestiona la información de tus mascotas',
      onPress: () => router.push('/(tabs)'),
    },
    {
      icon: 'calendar',
      title: 'Recordatorios',
      subtitle: 'Configura recordatorios y citas',
      onPress: () => router.push('/recordatorios'),
    },
    {
      icon: 'bell',
      title: 'Notificaciones',
      subtitle: 'Recibe alertas importantes',
      isSwitch: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      icon: 'moon',
      title: 'Modo oscuro',
      subtitle: 'Cambia la apariencia de la app',
      isSwitch: true,
      value: darkModeEnabled,
      onToggle: setDarkModeEnabled,
    },
  ];

  const supportOptions = [
    {
      icon: 'help-circle',
      title: 'Centro de ayuda',
      subtitle: 'Encuentra respuestas a tus preguntas',
      onPress: () => console.log('Centro de ayuda'),
    },
    {
      icon: 'message-circle',
      title: 'Contactar soporte',
      subtitle: 'Envía un mensaje a nuestro equipo',
      onPress: () => console.log('Contactar soporte'),
    },
    {
      icon: 'star',
      title: 'Calificar la app',
      subtitle: 'Ayúdanos a mejorar con tu opinión',
      onPress: () => console.log('Calificar app'),
    },
    {
      icon: 'shield',
      title: 'Privacidad y términos',
      subtitle: 'Lee nuestras políticas',
      onPress: () => console.log('Privacidad'),
    },
  ];

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.onPress}
      disabled={item.isSwitch}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Feather name={item.icon} size={20} color="#47a9ff" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      {item.isSwitch ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#3A4A5A', true: '#47a9ff' }}
          thumbColor={item.value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Feather name="chevron-right" size={20} color="#AAB4C0" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://placekitten.com/150/150' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Julian Rodriguez</Text>
            <Text style={styles.userEmail}>julian@example.com</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Recordatorios</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi perfil</Text>
          {profileOptions.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          {supportOptions.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutContent}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <Feather name="log-out" size={20} color="#ff6f61" />
              </View>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ff6f61" />
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>PetCare App v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 PetCare. Todos los derechos reservados.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122432',
  },
  header: {
    backgroundColor: '#1E2A38',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#47a9ff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EAEAEA',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#AAB4C0',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#47a9ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAB4C0',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#3A4A5A',
    marginHorizontal: 20,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E2A38',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(71, 169, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EAEAEA',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#AAB4C0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 97, 0.2)',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff6f61',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A3A4A',
  },
  appVersion: {
    fontSize: 14,
    color: '#AAB4C0',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});