import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EditPetModal from '../../components/EditPetModal';
import HamsterLoader from '../../components/loader';
import ToastNotification from '../../components/ToastNotification';
import ExpandableFAB from '../../components/ui/btnExpandible';
import UserMenuDropdown from '../../components/UserMenuDropdown';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import PetCard from './petsCacrd';

const { width } = Dimensions.get('window');

type Pet = {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age: string;
  weight: string;
  traits: string[];
};

type ReminderItem = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  petName?: string | null;
  category: string;
};

type QuickActionRoutes = '/saludChat' | '/recordatorios' | '/comida';

const quickActions: { icon: keyof typeof Ionicons.glyphMap; label: string; route: QuickActionRoutes; gradient: [string, string] }[] = [
  { icon: 'heart-circle', label: 'Salud', route: '/saludChat', gradient: ['#f093fb', '#f5576c'] },
  { icon: 'calendar', label: 'Recordatorios', route: '/recordatorios', gradient: ['#4facfe', '#00f2fe'] },
  { icon: 'restaurant', label: 'Comida', route: '/comida', gradient: ['#43e97b', '#38f9d7'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);

  const fabOptions = [
    {
      icon: 'add-circle' as keyof typeof Ionicons.glyphMap,
      label: 'Agregar mascota',
      onPress: () => router.push('/addAnimalsbtn'), 
      color: '#f093fb'
    },
    {
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      label: 'Agregar cita',
      onPress: () => console.log('Agregar cita'),
      color: '#4facfe'
    },
    {
      icon: 'heart' as keyof typeof Ionicons.glyphMap,
      label: 'Adoptar',
      onPress: () => router.push('/Adoptar'), 
      color: '#43e97b'
    },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const mapPetRecord = (record: any): Pet => ({
    id: record.id,
    name: record.name ?? 'Mascota',
    breed: record.breed ?? 'Sin raza',
    imageUrl: record.image_url || 'https://placehold.co/200x200?text=Pawmi',
    age: record.age ?? (record.age_years ? `${record.age_years} años` : 'Sin edad'),
    weight: record.weight ?? (record.weight_kg ? `${record.weight_kg} kg` : 'Sin peso'),
    traits: record.traits ?? [],
  });

  const formatReminderDate = (date: string, time?: string | null) => {
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      return date;
    }
    const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    if (!time) {
      return formattedDate;
    }
    const [hours, minutes] = time.split(':');
    const timeObj = new Date(dateObj);
    timeObj.setHours(Number(hours ?? 0), Number(minutes ?? 0));
    const formattedTime = timeObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate}, ${formattedTime}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'veterinaria': 'medical',
      'vacuna': 'shield-checkmark',
      'medicamento': 'fitness',
      'aseo': 'water',
      'alimentacion': 'restaurant',
      'default': 'calendar-outline',
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'veterinaria': '#f093fb',
      'vacuna': '#4facfe',
      'medicamento': '#fa709a',
      'aseo': '#43e97b',
      'alimentacion': '#feca57',
      'default': '#667eea',
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const [petsData, remindersData] = await Promise.all([
        apiClient.getPets(),
        apiClient.getReminders(),
      ]);

      const mappedPets = (petsData ?? []).map(mapPetRecord);
      setPets(mappedPets);

      const mappedReminders: ReminderItem[] = (remindersData ?? [])
        .slice(0, 5)
        .map((reminder: any) => ({
          id: reminder.id,
          title: reminder.title,
          date: reminder.start_date,
          time: reminder.time,
          petName: reminder.pet?.name ?? null,
          category: reminder.category,
        }));

      setReminders(mappedReminders);
    } catch (err) {
      console.error(err);
      setError('Error al cargar tus datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) {
        setPets([]);
        setReminders([]);
        setLoading(false);
        return;
      }
      fetchDashboardData();
    }, [currentUser?.id, fetchDashboardData])
  );

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setEditModalVisible(true);
  };

  const handleSavePet = async (updatedPet: Pet) => {
    if (!currentUser) return;

    try {
      await apiClient.updatePet(updatedPet.id, {
        name: updatedPet.name,
        breed: updatedPet.breed,
        age: updatedPet.age,
        weight: updatedPet.weight,
        image_url: updatedPet.imageUrl,
        traits: updatedPet.traits,
      });

      setPets(prevPets => prevPets.map(pet => (pet.id === updatedPet.id ? updatedPet : pet)));
      showToast(`✅ ${updatedPet.name} actualizada correctamente`, 'success');
    } catch (err) {
      console.error('Error actualizando mascota:', err);
      showToast('No se pudo actualizar la mascota', 'error');
    }
  };

  const handleDeletePet = (petToDelete: Pet) => {
    if (!currentUser) return;

    (async () => {
      try {
        await apiClient.deletePet(petToDelete.id);

        setPets(prevPets => prevPets.filter(pet => pet.id !== petToDelete.id));
        showToast(`🗑️ ${petToDelete.name} eliminada`, 'warning');
      } catch (err) {
        console.error('Error eliminando mascota:', err);
        showToast('No se pudo eliminar la mascota', 'error');
      }
    })();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

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
              router.replace('/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <HamsterLoader />
        <Text style={styles.loadingText}>Cargando tus mascotas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryGradient}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Reintentar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Hola, {(currentUser?.full_name || currentUser?.username || 'Pawmi user')} 👋</Text>
              <Text style={styles.subtext}>Aquí está el resumen de tus mascotas</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                <Ionicons name="refresh" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setUserMenuVisible(true)} style={styles.avatarContainer}>
                <Image source={{ uri: 'https://placekitten.com/100/100' }} style={styles.avatar} />
                <View style={styles.onlineBadge} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle para estadísticas */}
          <TouchableOpacity 
            style={styles.statsToggle}
            onPress={() => setStatsCollapsed(!statsCollapsed)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={statsCollapsed ? 'chevron-down' : 'chevron-up'} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          {/* Stats Cards - Colapsables */}
          {!statsCollapsed && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="paw" size={24} color="#fff" />
                <Text style={styles.statNumber}>{pets.length}</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#fff" />
                <Text style={styles.statNumber}>{reminders.length}</Text>
                <Text style={styles.statLabel}>Recordatorios</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={24} color="#fff" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Cuidados</Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            {quickActions.map(({ icon, label, route, gradient }) => (
              <TouchableOpacity
                style={styles.actionButton}
                key={label}
                onPress={() => router.push(route)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name={icon} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminders Card */}
        {reminders.length > 0 && (
          <View style={styles.remindersCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="notifications" size={22} color="#667eea" />
                <Text style={styles.cardTitle}>Próximos recordatorios</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/recordatorios')}>
                <Text style={styles.viewAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {reminders.slice(0, 3).map(reminder => {
              const categoryColor = getCategoryColor(reminder.category);
              const categoryIcon = getCategoryIcon(reminder.category);
              return (
                <View style={styles.reminderItem} key={reminder.id}>
                  <View style={[styles.reminderIconContainer, { backgroundColor: `${categoryColor}20` }]}>
                    <Ionicons name={categoryIcon} size={20} color={categoryColor} />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <View style={styles.reminderMeta}>
                      {reminder.petName && (
                        <View style={styles.reminderMetaItem}>
                          <Ionicons name="paw" size={12} color="#94a3b8" />
                          <Text style={styles.reminderMetaText}>{reminder.petName}</Text>
                        </View>
                      )}
                      <View style={styles.reminderMetaItem}>
                        <Ionicons name="time" size={12} color="#94a3b8" />
                        <Text style={styles.reminderMetaText}>{formatReminderDate(reminder.date, reminder.time)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Pets Section */}
        <View style={styles.petsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="paw" size={22} color="#f1f5f9" />
              <Text style={styles.sectionTitle}>Mis mascotas</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={18} color="#667eea" />
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="paw-outline" size={64} color="#475569" />
              </View>
              <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
              <Text style={styles.emptySubtext}>Agrega tu primera mascota usando el botón +</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/addAnimalsbtn')}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Agregar mascota</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            pets.map(pet => (
              <PetCard
                key={pet.id}
                name={pet.name}
                breed={pet.breed}
                imageUrl={pet.imageUrl}
                age={pet.age}
                weight={pet.weight}
                traits={pet.traits}
                onPress={() => console.log(`Pet selected: ${pet.name}`)}
                onEdit={() => handleEditPet(pet)}
                onDelete={() => handleDeletePet(pet)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <ExpandableFAB options={fabOptions} radius={90} />

      <EditPetModal
        visible={editModalVisible}
        pet={selectedPet}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedPet(null);
        }}
        onSave={handleSavePet}
      />

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <UserMenuDropdown
        visible={userMenuVisible}
        onClose={() => setUserMenuVisible(false)}
        onProfile={() => router.push('/(tabs)/user')}
        onSettings={() => router.push('/(tabs)/user')}
        onLogout={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0b' 
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0a0a0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    letterSpacing: 0.3,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    gap: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtext: { 
    fontSize: 15, 
    color: '#e0e7ff',
    opacity: 0.95,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statsToggle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginVertical: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  statsToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#e0e7ff',
    opacity: 0.95,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: { 
    padding: 24, 
    paddingBottom: 100,
  },
  quickActionsContainer: {
    marginBottom: 28,
  },
  quickActions: { 
    flexDirection: 'row', 
    gap: 14,
  },
  actionButton: { 
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  actionGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLabel: { 
    fontSize: 14, 
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  remindersCard: {
    backgroundColor: '#16181d',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  reminderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  reminderMeta: {
    flexDirection: 'row',
    gap: 14,
  },
  reminderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reminderMetaText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  petsSection: { 
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
    backgroundColor: '#16181d',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  emptyIconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 20,
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#0a0a0b',
  },
  errorText: { 
    color: '#ef4444', 
    textAlign: 'center', 
    fontSize: 19,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 28,
    letterSpacing: -0.2,
  },
  retryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 11, 0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});