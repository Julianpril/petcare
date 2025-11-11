import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppointmentsListProps } from '../../../../../lib/recordatorios/types';
import AppointmentCard from './card';
import EmptyState from './EmptyState';

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  selectedDate,
  appointments
}) => {
  const getAppointmentsForDate = useCallback((date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  }, [appointments]);

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const allAppointmentsSorted = useMemo(() => {
    return [...appointments].sort((a, b) => {
      // Parsear fechas como locales, no UTC
      const [yearA, monthA, dayA] = a.date.split('-').map(Number);
      const [yearB, monthB, dayB] = b.date.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });
  }, [appointments]);

  return (
    <View style={styles.appointmentsSection}>
      <View style={styles.sectionHeader}>
        <Ionicons 
          name={selectedDate ? "calendar" : "list"} 
          size={20} 
          color="#6366f1" 
        />
        <Text style={styles.sectionTitle}>
          {selectedDate
            ? (() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const dateObj = new Date(year, month - 1, day);
                return `Eventos del ${dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
              })()
            : 'Próximos eventos'
          }
        </Text>
      </View>

      <View style={styles.appointmentsList}>
        {selectedDate ? (
          selectedAppointments.length > 0 ? (
            selectedAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showDate={false}
              />
            ))
          ) : (
            <EmptyState />
          )
        ) : (
          allAppointmentsSorted.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              showDate={true}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentsSection: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
    flex: 1,
  },
  appointmentsList: {
    gap: 16,
  },
});

export default AppointmentsList;