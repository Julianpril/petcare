import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppointmentCardProps } from './interfaz';
import { getTypeColor, getTypeIcon } from './utilsReordatorios';

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showDate = false
}) => {
  const handleAppointmentPress = () => {
    Alert.alert(
      appointment.title,
      `Mascota: ${appointment.petName}\nFecha: ${appointment.date}${
        appointment.time ? `\nHora: ${appointment.time}` : ''
      }\n\n${appointment.description || ''}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={handleAppointmentPress}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentIcon}>
          {getTypeIcon(appointment.type)}
        </Text>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentTitle}>{appointment.title}</Text>
          <Text style={styles.appointmentPet}>🐾 {appointment.petName}</Text>
          {showDate && (
            <Text style={styles.appointmentDate}>📅 {appointment.date}</Text>
          )}
        </View>
        {appointment.time && (
          <Text style={styles.appointmentTime}>{appointment.time}</Text>
        )}
      </View>
      
      {appointment.description && (
        <Text style={styles.appointmentDescription}>
          {appointment.description}
        </Text>
      )}
      
      <View style={[
        styles.appointmentType,
        { backgroundColor: getTypeColor(appointment.type) + '20' }
      ]}>
        <Text style={[
          styles.appointmentTypeText,
          { color: getTypeColor(appointment.type) }
        ]}>
          {appointment.type.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appointmentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appointmentPet: {
    fontSize: 14,
    color: '#AAB4C0',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#AAB4C0',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  appointmentDescription: {
    fontSize: 14,
    color: '#AAB4C0',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  appointmentType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appointmentTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AppointmentCard;