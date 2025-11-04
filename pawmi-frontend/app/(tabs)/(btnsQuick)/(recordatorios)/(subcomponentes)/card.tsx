import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppointmentCardProps } from '../../../../../lib/recordatorios/types';
import { getTypeColor, getTypeIcon } from '../../../../../lib/recordatorios/utils';

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showDate = false
}) => {
  const getTypeGradient = (type: string): [string, string] => {
    const gradients: { [key: string]: [string, string] } = {
      'veterinario': ['#667eea', '#764ba2'],
      'vacuna': ['#f093fb', '#f5576c'],
      'medicamento': ['#4facfe', '#00f2fe'],
      'grooming': ['#43e97b', '#38f9d7'],
      'otro': ['#fa709a', '#fee140'],
    };
    return gradients[type] || ['#6366f1', '#8b5cf6'];
  };

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
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getTypeGradient(appointment.type)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={getTypeGradient(appointment.type)}
            style={styles.iconGradient}
          >
            <Text style={styles.appointmentIcon}>
              {getTypeIcon(appointment.type)}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentTitle}>{appointment.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="paw" size={14} color="#94a3b8" />
              <Text style={styles.appointmentPet}>{appointment.petName}</Text>
            </View>
            {showDate && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.appointmentDate}>
                  {new Date(appointment.date).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </Text>
              </View>
            )}
          </View>

          {appointment.description && (
            <Text style={styles.appointmentDescription} numberOfLines={2}>
              {appointment.description}
            </Text>
          )}
        </View>

        {appointment.time && (
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={16} color="#6366f1" />
            <Text style={styles.appointmentTime}>{appointment.time}</Text>
          </View>
        )}
      </View>

      <View style={[
        styles.appointmentType,
        { backgroundColor: getTypeColor(appointment.type) + '15' }
      ]}>
        <Text style={[
          styles.appointmentTypeText,
          { color: getTypeColor(appointment.type) }
        ]}>
          {appointment.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#16181d',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  gradientBorder: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentIcon: {
    fontSize: 26,
  },
  appointmentInfo: {
    flex: 1,
    gap: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentPet: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  appointmentDate: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  appointmentDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.2,
  },
  appointmentType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  appointmentTypeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
});

export default AppointmentCard;