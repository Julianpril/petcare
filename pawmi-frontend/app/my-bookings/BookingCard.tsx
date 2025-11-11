import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Booking } from './types';
import { SERVICE_LABELS, STATUS_LABELS } from './types';

interface BookingCardProps {
  booking: Booking;
  onContact: (walker: any) => void;
  onCancel: (bookingId: string) => void;
}

export function BookingCard({ booking, onContact, onCancel }: BookingCardProps) {
  const statusInfo = STATUS_LABELS[booking.status];
  const scheduledDate = new Date(booking.scheduled_date);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

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
        {/* Info del paseador */}
        <View style={styles.walkerInfo}>
          <View style={styles.walkerIcon}>
            <Ionicons name="person" size={24} color="#667eea" />
          </View>
          <View style={styles.walkerDetails}>
            <Text style={styles.walkerName}>{booking.walker.user.full_name}</Text>
            <Text style={styles.walkerRate}>${booking.walker.hourly_rate.toLocaleString('es-CO')}/hora</Text>
          </View>
        </View>

        {/* Info de la mascota */}
        <View style={styles.petInfo}>
          <Ionicons name="paw" size={16} color="#94a3b8" />
          <Text style={styles.petText}>
            {booking.pet.name} ({booking.pet.breed || booking.pet.species})
          </Text>
        </View>

        {/* Fecha y hora */}
        <View style={styles.bookingInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#94a3b8" />
            <Text style={styles.infoText}>
              {scheduledDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
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

      {/* Acciones */}
      <View style={styles.bookingActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => onContact(booking.walker)}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Contactar</Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(booking.id)}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
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
  walkerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  walkerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walkerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  walkerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  walkerRate: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3142',
  },
  petText: {
    color: '#cbd5e1',
    fontSize: 14,
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
    gap: 12,
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
  contactButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
