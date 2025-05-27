import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PetCard from './petsCacrd';
import ExpandableFAB from '../../components/ui/btnExpandible';
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
  { icon: 'calendar', label: 'Reordatorios', route: '/recordatorios' },
  { icon: 'coffee', label: 'Comida', route: '/comida' },
];

const reminders = [
  { text: 'Chequeo de Max - 20 Mayo, 9:00 AM' },
  { text: 'Baño de Luna - 22 Mayo, 2:00 PM' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fabOptions = [
    {
      icon: 'plus-circle' as FeatherIconName,
      label: 'Agregar mascota',
      onPress: () => console.log('Agregar mascota'),
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
    const fetchPets = async () => {
      try {
        const response = await fetch('https://mocki.io/v1/42b89a90-f013-4f30-a5db-759b0b33aab7');
        if (!response.ok) {
          throw new Error('Failed to fetch pets');
        }
        const data: Pet[] = await response.json();
        setPets(data);
      } catch (err) {
        setError('Error fetching pets. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
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
        <Image source={{ uri: 'https://placekitten.com/100/100' }} style={styles.avatar} />
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
          <Text style={styles.sectionTitle}>Mis mascotas</Text>
          {pets.map(pet => (
            <PetCard
              key={pet.id}
              name={pet.name}
              breed={pet.breed}
              imageUrl={pet.imageUrl}
              age={pet.age}
              weight={pet.weight}
              traits={pet.traits}
              onPress={() => console.log(`Pet selected: ${pet.name}`)}
            />
          ))}
        </View>
      </ScrollView>

      <ExpandableFAB options={fabOptions} radius={90} />
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#EAEAEA', marginBottom: 16 },
  loadingText: { color: '#EAEAEA', textAlign: 'center', marginTop: 20 },
  errorText: { color: '#FF6F61', textAlign: 'center', marginTop: 20 },
});