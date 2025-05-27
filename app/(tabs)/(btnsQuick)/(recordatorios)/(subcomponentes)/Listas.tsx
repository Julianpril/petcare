import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppointmentsListProps } from './interfaz';
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

  const allAppointmentsSorted = appointments
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={styles.appointmentsSection}>
      <Text style={styles.sectionTitle}>
        {selectedDate
          ? `Eventos para ${selectedDate}`
          : 'Próximos eventos'
        }
      </Text>

      <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentsSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 12,
  },
  appointmentsList: {
    flex: 1,
  },
});

export default AppointmentsList;