//app/(tabs)/user.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/auth-context';

const { width } = Dimensions.get('window');

export default function UserScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      '🚪 Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Redirigir al login
              router.replace('/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta de nuevo.');
            }
          }
        }
      ]
    );
  };

  const profileOptions = [
    {
      icon: 'person-outline',
      title: 'Información personal',
      subtitle: 'Edita tu perfil y datos personales',
      color: '#667eea',
      onPress: () => console.log('Información personal'),
    },
    {
      icon: 'paw-outline',
      title: 'Mis mascotas',
      subtitle: 'Gestiona la información de tus mascotas',
      color: '#f093fb',
      onPress: () => router.push('/(tabs)'),
    },
    {
      icon: 'calendar-outline',
      title: 'Recordatorios',
      subtitle: 'Configura recordatorios y citas',
      color: '#4facfe',
      onPress: () => router.push('/recordatorios'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Recibe alertas importantes',
      color: '#fa709a',
      isSwitch: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
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

  const supportOptions = [
    {
      icon: 'help-circle-outline',
      title: 'Centro de ayuda',
      subtitle: 'Encuentra respuestas a tus preguntas',
      color: '#667eea',
      onPress: () => console.log('Centro de ayuda'),
    },
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'Contactar soporte',
      subtitle: 'Envía un mensaje a nuestro equipo',
      color: '#f093fb',
      onPress: () => console.log('Contactar soporte'),
    },
    {
      icon: 'star-outline',
      title: 'Calificar la app',
      subtitle: 'Ayúdanos a mejorar con tu opinión',
      color: '#feca57',
      onPress: () => console.log('Calificar app'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacidad y términos',
      subtitle: 'Lee nuestras políticas',
      color: '#48dbfb',
      onPress: () => console.log('Privacidad'),
    },
  ];

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.onPress}
      disabled={item.isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
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
          trackColor={{ false: '#334155', true: item.color }}
          thumbColor={item.value ? '#fff' : '#cbd5e1'}
          ios_backgroundColor="#334155"
        />
      ) : (
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://placekitten.com/150/150' }}
                style={styles.avatar}
              />
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Julian Rodriguez</Text>
              <Text style={styles.userEmail}>julian@example.com</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="paw" size={20} color="#667eea" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Mascotas</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={20} color="#f093fb" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Citas</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="notifications" size={20} color="#4facfe" />
              </View>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Alertas</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Añadir Mascota</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <Ionicons name="calendar" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Nueva Cita</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <Ionicons name="medkit" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Historial</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#cbd5e1" />
            <Text style={styles.sectionTitle}>Mi Perfil</Text>
          </View>
          {profileOptions.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color="#cbd5e1" />
            <Text style={styles.sectionTitle}>Soporte</Text>
          </View>
          {supportOptions.map((item, index) => (
            <MenuItem key={index} item={item} />
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a6f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <View style={styles.logoutContent}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Ionicons name="paw" size={24} color="#475569" style={styles.appInfoIcon} />
          <Text style={styles.appVersion}>Pawmi v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Pawmi. Todos los derechos reservados.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    gap: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#43e97b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#667eea',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#e0e7ff',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 3,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 8,
  },
  appInfoIcon: {
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  appCopyright: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
});