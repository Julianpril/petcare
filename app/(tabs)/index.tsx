import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PetCard from './petsCacrd';

export default function HomeScreen() {
  const pets = [
    {
      id: '1',
      name: 'Max',
      breed: 'Labrador Retriever',
      imageUrl: 'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?q=80&w=256',
      age: '2 años',
      weight: '28 kg',
      traits: ['Amigable', 'Buen hunting']
    },
    {
      id: '2',
      name: 'Luna',
      breed: 'Golden Retriever',
      imageUrl: 'https://www.lavanguardia.com/files/og_thumbnail/uploads/2023/10/24/653782d413b16.jpeg',
      age: '1 año',
      weight: '22 kg',
      traits: ['Juguetona', 'Cariñosa']
    },
    {
      id: '3',
      name: 'Rocky',
      breed: 'Bulldog Francés',
      imageUrl: 'https://images.unsplash.com/photo-1583511666372-62fc211f8377?q=80&w=256',
      age: '3 años',
      weight: '12 kg',
      traits: ['Tranquilo', 'Dormilón']
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Julian 👋</Text>
          <Text style={styles.subtext}>Aquí está el resumen de tus mascotas</Text>
        </View>
        <Image
          source={{ uri: 'https://placekitten.com/100/100' }}
          style={styles.avatar}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.content}>

        {/* Next Reminders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximos recordatorios</Text>
          <View style={styles.reminderRow}>
            <Feather name="bell" size={20} color="#EAEAEA" />
            <Text style={styles.reminderText}>Vacuna de Max - 12 Mayo, 10:00 AM</Text>
          </View>
          <View style={styles.reminderRow}>
            <Feather name="bell" size={20} color="#EAEAEA" />
            <Text style={styles.reminderText}>Desparasitación de Luna - 15 Mayo</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'activity', label: 'Salud' },
            { icon: 'calendar', label: 'Citas' },
            { icon: 'droplet', label: 'Vacunas' },
            { icon: 'coffee', label: 'Comida' },
          ].map(({ icon, label }) => (
            <TouchableOpacity style={styles.actionButton} key={label}>
              <Feather name={icon as any} size={24} color="#555" />
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Pet Cards Section */}
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

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab}>
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122432',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E2A38',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#EAEAEA',
  },
  subtext: {
    fontSize: 14,
    color: '#AAB4C0',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra padding at bottom to account for navbar
  },
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
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    color: '#EAEAEA',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderText: {
    marginLeft: 10,
    color: '#EAEAEA',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  actionLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#1E2A38',
  },
  petsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100, // Adjusted to be above the navbar
    backgroundColor: '#ff6f61',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
  },
});