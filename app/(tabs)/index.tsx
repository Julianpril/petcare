// app/%28tabs%29/index.tsx
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

export default function HomeScreen() {
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

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximos recordatorios</Text>
          <View style={styles.reminderRow}>
            <Feather name="bell" size={20} color="#444" />
            <Text style={styles.reminderText}>Vacuna de Max - 12 Mayo, 10:00 AM</Text>
          </View>
          <View style={styles.reminderRow}>
            <Feather name="bell" size={20} color="#444" />
            <Text style={styles.reminderText}>Desparasitación de Luna - 15 Mayo</Text>
          </View>
        </View>

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
      </ScrollView>

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
    marginBottom: 40,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 30,
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
