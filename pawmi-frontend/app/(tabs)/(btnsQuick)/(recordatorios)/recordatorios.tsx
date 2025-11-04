import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AggRecordatorio from '../(subBtnsQuick)/aggRecordatorio';
import AddButton from '../../../../components/AddButton';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../lib/auth-context';
import type { Appointment } from '../../../../lib/recordatorios/types';
import CalendarComponent from './(subcomponentes)/CCalendarComponentes';
import AppointmentsList from './(subcomponentes)/Listas';

export default function Recordatorios() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const fetchReminders = useCallback(async () => {
    if (!currentUser) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.getReminders();

      const mapped = (data ?? []).map((reminder: any) => {
        const date = reminder.start_date;
        let timeFormatted: string | undefined;
        if (reminder.time) {
          const [hours, minutes] = reminder.time.split(':');
          const time = new Date(date);
          time.setHours(Number(hours ?? 0), Number(minutes ?? 0));
          timeFormatted = time.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }

        return {
          id: reminder.id,
          title: reminder.title,
          time: timeFormatted,
          date,
          type: reminder.category as Appointment['type'],
          petName: reminder.pet?.name ?? 'Mascota',
          description: reminder.description ?? undefined,
        } satisfies Appointment;
      });

      setAppointments(mapped);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('No se pudo cargar tus recordatorios.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [fetchReminders])
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="calendar" size={28} color="#ffffff" />
          <Text style={styles.title}>Citas & Recordatorios</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="time-outline" size={16} color="#ffffff" />
            <Text style={styles.statText}>{appointments.length} eventos</Text>
          </View>
          {selectedDate && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => setSelectedDate('')}
            >
              <Ionicons name="close-circle" size={16} color="#ffffff" />
              <Text style={styles.clearFilterText}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.statusContainer}>
            <Ionicons name="warning" size={32} color="#f59e0b" />
            <Text style={styles.statusText}>{error}</Text>
          </View>
        ) : null}

        <CalendarComponent
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          appointments={appointments}
        />

        {loading ? (
          <View style={styles.statusContainer}>
            <Ionicons name="hourglass-outline" size={32} color="#6366f1" />
            <Text style={styles.statusText}>Cargando recordatorios...</Text>
          </View>
        ) : (
          <AppointmentsList
            selectedDate={selectedDate}
            appointments={appointments}
          />
        )}
      </ScrollView>

      <AddButton onPress={handleOpenModal} />

      <AggRecordatorio
        visible={modalVisible}
        onClose={handleCloseModal}
        onSaved={fetchReminders}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  clearFilterText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});