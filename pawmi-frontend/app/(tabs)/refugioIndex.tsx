import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EditPetModal from '../../components/EditPetModal';
import HamsterLoader from '../../components/loader';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';
import PetDetailModal from '../../components/PetDetailModal';
import ToastNotification from '../../components/ToastNotification';
import ExpandableFAB from '../../components/ui/btnExpandible';
import UserMenuDropdown from '../../components/UserMenuDropdown';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/use-toast';
import AggCita from './(btnsQuick)/(subBtnsQuick)/aggCita';
import { PetsSection } from './refugio/components/PetsSection';
import { QuickActions } from './refugio/components/QuickActions';
import { RefugioHeader } from './refugio/components/RefugioHeader';
import { RemindersCard } from './refugio/components/RemindersCard';
import type { AdoptionStats, IoniconName, Pet, ReminderItem } from './refugio/types';

export default function RefugioHomeScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  const [citaModalVisible, setCitaModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Estadísticas de adopción
  const adoptionStats = pets.reduce<AdoptionStats>((acc, pet) => {
    if (pet.is_for_adoption) {
      if (pet.adoption_status === 'available') acc.available++;
      if (pet.adoption_status === 'pending') acc.pending++;
      if (pet.adoption_status === 'adopted') acc.adopted++;
    }
    return acc;
  }, { available: 0, pending: 0, adopted: 0 });

  const fabOptions = [
    {
      icon: 'add-circle' as IoniconName,
      label: 'Publicar en adopción',
  onPress: () => router.push('/(tabs)/(btnsExpandible)/addAnimalsbtn'),
      color: '#f093fb'
    },
    {
      icon: 'stats-chart' as IoniconName,
      label: 'Estadísticas',
  onPress: () => router.push('/(tabs)/(btnsExpandible)/EstadisticasRefugio'),
      color: '#43e97b'
    },
    {
      icon: 'calendar' as IoniconName,
      label: 'Agregar cita',
      onPress: () => setCitaModalVisible(true),
      color: '#4facfe'
    },
  ];

  const mapPetRecord = (record: any): Pet => ({
    id: record.id,
    name: record.name ?? 'Mascota',
    breed: record.breed ?? 'Sin raza',
    imageUrl: record.image_url || 'https://placehold.co/200x200?text=Pawmi',
    age: record.age ?? (record.age_years ? `${record.age_years} años` : 'Sin edad'),
    weight: record.weight ?? (record.weight_kg ? `${record.weight_kg} kg` : 'Sin peso'),
    traits: record.traits ?? [],
    animal_type: record.animal_type,
    sex: record.sex,
    medical_history: record.medical_history,
    notes: record.notes,
    is_for_adoption: record.is_for_adoption,
    adoption_status: record.adoption_status,
    adoption_fee: record.adoption_fee,
  });

  const formatReminderDate = (date: string, time?: string | null) => {
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
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

  const getCategoryIcon = (category: string): IoniconName => {
    const icons: Record<string, IoniconName> = {
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
      setError('Error al cargar los datos del refugio. Intenta nuevamente.');
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
    showToast(`Mascota ${updatedPet.name} actualizada correctamente`, 'success');
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
    showToast(`Mascota ${petToDelete.name} eliminada`, 'warning');
      } catch (err) {
        console.error('Error eliminando mascota:', err);
        showToast('No se pudo eliminar la mascota', 'error');
      }
    })();
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLogoutModalVisible(false);
      router.replace('/login');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <HamsterLoader />
        <Text style={styles.loadingText}>Cargando datos del refugio...</Text>
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

  const shelterName = (currentUser as any)?.shelter_name || 'Refugio';

  return (
    <View style={styles.container}>
      <RefugioHeader
        shelterName={shelterName}
        adoptionStats={adoptionStats}
        statsCollapsed={statsCollapsed}
        onToggleStats={() => setStatsCollapsed((value) => !value)}
        onRefresh={handleRefresh}
        onOpenMenu={() => setUserMenuVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <QuickActions
          onPublish={() => router.push('/(tabs)/(btnsExpandible)/addAnimalsbtn')}
          onViewStats={() => router.push('/(tabs)/(btnsExpandible)/EstadisticasRefugio')}
          onAddAppointment={() => setCitaModalVisible(true)}
        />

        <RemindersCard
          reminders={reminders}
          formatReminderDate={formatReminderDate}
          getCategoryIcon={getCategoryIcon}
          getCategoryColor={getCategoryColor}
          onViewAll={() => router.push('/(tabs)/(btnsQuick)/(recordatorios)/recordatorios')}
        />

        <PetsSection
          pets={pets}
          onRefresh={handleRefresh}
          onSelectPet={(pet) => {
            setSelectedPet(pet);
            setDetailModalVisible(true);
          }}
          onEditPet={handleEditPet}
          onDeletePet={handleDeletePet}
          onPublishPet={() => router.push('/(tabs)/(btnsExpandible)/addAnimalsbtn')}
        />
      </ScrollView>

      <ExpandableFAB options={fabOptions} radius={90} />

      <PetDetailModal
        visible={detailModalVisible}
        pet={selectedPet}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedPet(null);
        }}
        onEdit={() => {
          setDetailModalVisible(false);
          setEditModalVisible(true);
        }}
      />

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
        duration={toast.duration}
        onHide={hideToast}
      />

      <UserMenuDropdown
        visible={userMenuVisible}
        onClose={() => setUserMenuVisible(false)}
        onProfile={() => router.push('/(tabs)/user')}
        onSettings={() => router.push('/(tabs)/user')}
        onLogout={handleLogout}
      />

      <LogoutConfirmModal
        visible={logoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />

      <AggCita
        visible={citaModalVisible}
        onClose={() => setCitaModalVisible(false)}
        onSaved={() => {
          fetchDashboardData();
          showToast('Cita veterinaria guardada', 'success');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
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
    shadowColor: '#43e97b',
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
});
