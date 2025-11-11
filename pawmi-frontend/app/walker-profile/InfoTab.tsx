import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PET_SIZE_LABELS, PET_TYPE_LABELS, SERVICE_ICONS, SERVICE_LABELS, type WalkerProfile } from './types';

type InfoTabProps = {
  walker: WalkerProfile;
  onOpenMap: () => void;
};

export function InfoTab({ walker, onOpenMap }: InfoTabProps) {
  return (
    <View style={styles.content}>
      {/* Precio */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tarifa por hora</Text>
          <View style={styles.priceAmount}>
            <Text style={styles.priceValue}>${walker.hourly_rate.toLocaleString('es-CO')}</Text>
            <Text style={styles.priceUnit}>/hora</Text>
          </View>
        </View>
      </View>

      {/* Sobre mí */}
      {walker.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>{walker.bio}</Text>
        </View>
      )}

      {/* Servicios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios ofrecidos</Text>
        <View style={styles.servicesGrid}>
          {walker.services.map((service) => (
            <View key={service} style={styles.serviceCard}>
              <Ionicons
                name={SERVICE_ICONS[service] as any || 'paw'}
                size={24}
                color="#667eea"
              />
              <Text style={styles.serviceText}>
                {SERVICE_LABELS[service] || service}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Certificaciones */}
      {walker.certifications && walker.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificaciones</Text>
          {walker.certifications.map((cert, index) => (
            <View key={index} style={styles.certItem}>
              <Ionicons name="ribbon" size={20} color="#10b981" />
              <Text style={styles.certText}>{cert}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Mascotas aceptadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mascotas que acepto</Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Tipos:</Text>
          <View style={styles.tagsRow}>
            {walker.accepted_pet_types.map((type) => (
              <View key={type} style={styles.tag}>
                <Text style={styles.tagText}>{PET_TYPE_LABELS[type] || type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Tamaños:</Text>
          <View style={styles.tagsRow}>
            {walker.accepted_pet_sizes.map((size) => (
              <View key={size} style={styles.tag}>
                <Text style={styles.tagText}>{PET_SIZE_LABELS[size] || size}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Verificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verificaciones</Text>
        <View style={styles.verificationsList}>
          <View style={styles.verificationItem}>
            <Ionicons
              name={walker.is_verified ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={walker.is_verified ? '#10b981' : '#94a3b8'}
            />
            <Text style={styles.verificationText}>Perfil verificado</Text>
          </View>
          <View style={styles.verificationItem}>
            <Ionicons
              name={walker.background_check_completed ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={walker.background_check_completed ? '#10b981' : '#94a3b8'}
            />
            <Text style={styles.verificationText}>Antecedentes verificados</Text>
          </View>
        </View>
      </View>

      {/* Ubicación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={20} color="#667eea" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationCity}>
                {walker.neighborhood ? `${walker.neighborhood}, ${walker.city}` : walker.city}
              </Text>
              <Text style={styles.locationRadius}>
                Radio de servicio: {walker.service_radius_km} km
              </Text>
            </View>
          </View>
          {walker.latitude && walker.longitude && (
            <TouchableOpacity style={styles.mapButton} onPress={onOpenMap}>
              <Ionicons name="map" size={20} color="#fff" />
              <Text style={styles.mapButtonText}>Ver mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  priceCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3142',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 16,
  },
  priceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceValue: {
    color: '#667eea',
    fontSize: 28,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#94a3b8',
    fontSize: 16,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
    alignItems: 'center',
    minWidth: 100,
  },
  serviceText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  certText: {
    color: '#cbd5e1',
    fontSize: 15,
    flex: 1,
  },
  subSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2a3142',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  verificationsList: {
    gap: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  locationCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  locationInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationCity: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRadius: {
    color: '#94a3b8',
    fontSize: 14,
  },
  mapButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
