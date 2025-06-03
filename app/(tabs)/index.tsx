import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import PetCard from './petsCacrd';
import ExpandableFAB from '../../components/ui/btnExpandible';
import EditPetModal from '../../components/EditPetModal';
import ToastNotification from '../../components/ToastNotification';
import UserMenuDropdown from '../../components/UserMenuDropdown';
import { useAuth } from '../Auth';
import { useRouter } from 'expo-router';

type Pet = {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age: string;
  weight: string;
  traits: string[];
};

type FeatherIconName = 'plus-circle' | 'calendar' | 'heart' | 'activity' | 'coffee';

type QuickActionRoutes = '/saludChat' | '/recordatorios' | '/comida';

const quickActions: { icon: FeatherIconName; label: string; route: QuickActionRoutes }[] = [
  { icon: 'activity', label: 'Salud', route: '/saludChat' },
  { icon: 'calendar', label: 'Recordatorios', route: '/recordatorios' },
  { icon: 'coffee', label: 'Comida', route: '/comida' },
];

const reminders = [
  { text: 'Chequeo de Max - 20 Mayo, 9:00 AM' },
  { text: 'Baño de Luna - 22 Mayo, 2:00 PM' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const fabOptions = [
    {
      icon: 'plus-circle' as FeatherIconName,
      label: 'Agregar mascota',
      onPress: () => router.push('/addAnimalsbtn'), 
      color: '#ff6f61'
    },
    {
      icon: 'calendar' as FeatherIconName,
      label: 'Agregar cita',
      onPress: () => console.log('Agregar cita'),
      color: '#47a9ff'
    },
    {
      icon: 'heart' as FeatherIconName,
      label: 'Adoptar',
      onPress: () => router.push('/Adoptar'), 
      color: '#68d391'
    },
  ];

  useEffect(() => {
    fetchPets();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://mocki.io/v1/42b89a90-f013-4f30-a5db-759b0b33aab7');
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }
      const data: Pet[] = await response.json();
      setPets(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar mascotas. Intenta nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setEditModalVisible(true);
  };

  const handleSavePet = (updatedPet: Pet) => {
    setPets(prevPets => 
      prevPets.map(pet => 
        pet.id === updatedPet.id ? updatedPet : pet
      )
    );
    
    showToast(`✅ ${updatedPet.name} actualizada correctamente`, 'success');
  };

  const handleDeletePet = (petToDelete: Pet) => {
    setPets(prevPets => prevPets.filter(pet => pet.id !== petToDelete.id));
    showToast(`🗑️ ${petToDelete.name} eliminada`, 'warning');
  };

  const handleRefresh = () => {
    fetchPets();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tus mascotas...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6f61" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Julian 👋</Text>
          <Text style={styles.subtext}>Aquí está el resumen de tus mascotas</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <Feather name="refresh-cw" size={20} color="#AAB4C0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Feather name="log-out" size={20} color="#ff6f61" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUserMenuVisible(true)}>
            <Image source={{ uri: 'https://placekitten.com/100/100' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximos recordatorios</Text>
          {reminders.map((reminder, index) => (
            <View style={styles.reminderRow} key={index}>
              <Feather name="bell" size={20} color="#EAEAEA" />
              <Text style={styles.reminderText}>{reminder.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          {quickActions.map(({ icon, label, route }) => (
            <TouchableOpacity
              style={styles.actionButton}
              key={label}
              onPress={() => {
                if (route) router.push(route);
              }}
            >
              <Feather name={icon} size={24} color="#555" />
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.petsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis mascotas</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Feather name="refresh-cw" size={16} color="#47a9ff" />
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="heart" size={48} color="#AAB4C0" />
              <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
              <Text style={styles.emptySubtext}>Agrega tu primera mascota usando el botón +</Text>
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
  container: { flex: 1, backgroundColor: '#122432' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E2A38',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { fontSize: 22, fontWeight: '600', color: '#EAEAEA' },
  subtext: { fontSize: 14, color: '#AAB4C0', marginTop: 4 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 234, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  content: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#1E2A38',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontWeight: '600', fontSize: 16, marginBottom: 10, color: '#EAEAEA' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reminderText: { marginLeft: 10, color: '#EAEAEA' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { alignItems: 'center', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, flex: 1, marginHorizontal: 5 },
  actionLabel: { marginTop: 6, fontSize: 12, color: '#1E2A38' },
  petsSection: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#EAEAEA' },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(71, 169, 255, 0.1)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#AAB4C0',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { 
    color: '#EAEAEA', 
    textAlign: 'center', 
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: { 
    color: '#ff6f61', 
    textAlign: 'center', 
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#47a9ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});