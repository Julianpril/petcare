import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SERVICE_LABELS, STATUS_LABELS, type Booking } from './types';

interface BookingCardProps {
  booking: Booking;
  onUpdateStatus: (
    bookingId: string,
    newStatus: 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  ) => void;
}

export function BookingCard({ booking, onUpdateStatus }: BookingCardProps) {
  const statusInfo = STATUS_LABELS[booking.status];
  const scheduledDate = new Date(booking.scheduled_date);
  const isPast = scheduledDate < new Date();

  const confirmAction = (
    title: string,
    message: string,
    status: 'confirmed' | 'cancelled' | 'in_progress' | 'completed'
  ) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: status === 'cancelled' ? 'destructive' : 'default',
        onPress: () => onUpdateStatus(booking.id, status),
      },
    ]);
  };

  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceTag}>
          <Text style={styles.serviceTagText}>
            {SERVICE_LABELS[booking.service_type] || booking.service_type}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Ionicons name={statusInfo.icon as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.bookingBody}>
        <View style={styles.petInfo}>
          <View style={styles.petIcon}>
            <Ionicons name="paw" size={24} color="#667eea" />
          </View>
          <View style={styles.petDetails}>
            <Text style={styles.petName}>{booking.pet.name}</Text>
            <Text style={styles.petBreed}>
              {booking.pet.breed || booking.pet.species}
              {booking.pet.size ? ` • ${booking.pet.size}` : ''}
            </Text>
            <Text style={styles.ownerName}>Dueño: {booking.pet.owner.full_name}</Text>
          </View>
        </View>

        <View style={styles.bookingInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#94a3b8" />
            <Text style={styles.infoText}>
              {scheduledDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color="#94a3b8" />
            <Text style={styles.infoText}>
              {scheduledDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="hourglass" size={16} color="#94a3b8" />
            <Text style={styles.infoText}>
              {booking.duration_hours} hora{booking.duration_hours !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {booking.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notas:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>${booking.total_price.toLocaleString('es-CO')}</Text>
        </View>
      </View>

      {/* Acciones según el estado */}
      <View style={styles.bookingActions}>
        {booking.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() =>
                confirmAction(
                  'Rechazar reserva',
                  '¿Estás seguro de que quieres rechazar esta reserva?',
                  'cancelled'
                )
              }
            >
              <Ionicons name="close" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => confirmAction('Aceptar reserva', '¿Confirmar esta reserva?', 'confirmed')}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </>
        )}

        {booking.status === 'confirmed' && !isPast && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() =>
              confirmAction('Iniciar servicio', '¿Marcar como en progreso?', 'in_progress')
            }
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Iniciar</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() =>
              confirmAction(
                'Completar servicio',
                '¿Marcar este servicio como completado?',
                'completed'
              )
            }
          >
            <Ionicons name="checkmark-done" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Completar</Text>
          </TouchableOpacity>
        )}

        {/* Botón de contacto siempre disponible */}
        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => Alert.alert('Contactar', `${booking.pet.owner.email}`, [{ text: 'OK' }])}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Contactar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3142',
  },
  serviceTag: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingBody: {
    padding: 16,
  },
  petInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  petIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 13,
    color: '#64748b',
  },
  bookingInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  notesBox: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  notesLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  notesText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  priceValue: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookingActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  startButton: {
    backgroundColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#8b5cf6',
  },
  contactButton: {
    backgroundColor: '#64748b',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
