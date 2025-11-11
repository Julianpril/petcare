// app/historial.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiClient } from '../lib/api-client';
import { HistoryEmptyState } from './historial/components/HistoryEmptyState';
import { HistoryFilters } from './historial/components/HistoryFilters';
import { HistoryHeader } from './historial/components/HistoryHeader';
import { HistoryTimeline } from './historial/components/HistoryTimeline';
import type { HistoryFilterType, HistoryItem } from './historial/types';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  photo_url?: string;
}

interface Reminder {
  id: string;
  pet_id: string;
  title: string;
  description?: string;
  reminder_type: string;
  scheduled_date: string;
  is_completed: boolean;
  completed_at?: string;
  is_active: boolean;
}

export default function HistorialScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<HistoryFilterType>('all');
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      // Cargar mascotas y recordatorios
      const [petsData, remindersData] = await Promise.all([
        apiClient.getPets(),
        apiClient.getReminders(),
      ]);

      setPets(petsData);

      // Crear items de historial
      const items: HistoryItem[] = [];

      // Agregar recordatorios completados
      const completedReminders = remindersData.filter((r: Reminder) => r.is_completed);
      completedReminders.forEach((reminder: Reminder) => {
        const pet = petsData.find((p: Pet) => p.id === reminder.pet_id);
        items.push({
          id: `reminder-${reminder.id}`,
          type: 'reminder',
          title: reminder.title,
          description: reminder.description || 'Recordatorio completado',
          date: reminder.completed_at || reminder.scheduled_date,
          icon: getIconForReminderType(reminder.reminder_type),
          color: getColorForReminderType(reminder.reminder_type),
          petName: pet?.name,
          petPhoto: pet?.photo_url,
        });
      });

      // Agregar creación de mascotas (simulado - en el futuro desde created_at)
      petsData.forEach((pet: Pet) => {
        items.push({
          id: `pet-created-${pet.id}`,
          type: 'pet_created',
          title: `${pet.name} se unió a la familia`,
          description: `${pet.species} ${pet.breed ? `- ${pet.breed}` : ''}`,
          date: new Date().toISOString(), // En el futuro usar pet.created_at
          icon: 'paw',
          color: '#667eea',
          petName: pet.name,
          petPhoto: pet.photo_url,
        });
      });

      // Ordenar por fecha (más reciente primero)
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setHistoryItems(items);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getIconForReminderType = (type: string): string => {
    const icons: { [key: string]: string } = {
      vacuna: 'medical',
      desparasitacion: 'shield-checkmark',
      consulta: 'fitness',
      medicamento: 'medkit',
      baño: 'water',
      corte_uñas: 'cut',
      otro: 'calendar',
    };
    return icons[type] || 'calendar';
  };

  const getColorForReminderType = (type: string): string => {
    const colors: { [key: string]: string } = {
      vacuna: '#4facfe',
      desparasitacion: '#43e97b',
      consulta: '#fa709a',
      medicamento: '#f093fb',
      baño: '#667eea',
      corte_uñas: '#feca57',
      otro: '#764ba2',
    };
    return colors[type] || '#667eea';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
    }
  };

  const filteredItems = historyItems.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'reminders') return item.type === 'reminder';
    if (filterType === 'pets') return item.type === 'pet_created' || item.type === 'pet_updated';
    return true;
  });

  return (
    <View style={styles.container}>
      <HistoryHeader
        totalEvents={historyItems.length}
        reminders={historyItems.filter((item) => item.type === 'reminder').length}
        pets={pets.length}
        onBack={() => router.back()}
      />
      <HistoryFilters value={filterType} onChange={setFilterType} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
          }
        >
          {filteredItems.length === 0 ? (
            <HistoryEmptyState filter={filterType} />
          ) : (
            <HistoryTimeline items={filteredItems} formatDate={formatDate} />
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});
