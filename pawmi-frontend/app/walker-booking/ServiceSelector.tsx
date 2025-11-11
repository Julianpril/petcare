import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SERVICE_OPTIONS } from './types';

interface ServiceSelectorProps {
  availableServices: string[];
  selectedService: string;
  onSelectService: (service: string) => void;
}

export function ServiceSelector({
  availableServices,
  selectedService,
  onSelectService,
}: ServiceSelectorProps) {
  const filteredServices = SERVICE_OPTIONS.filter((s) =>
    availableServices.includes(s.value)
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Servicio</Text>
      <View style={styles.optionsGrid}>
        {filteredServices.map((service) => (
          <TouchableOpacity
            key={service.value}
            style={[
              styles.optionCard,
              selectedService === service.value && styles.optionCardSelected,
            ]}
            onPress={() => onSelectService(service.value)}
          >
            <Text style={styles.serviceEmoji}>{service.label.split(' ')[0]}</Text>
            <Text
              style={[
                styles.optionText,
                selectedService === service.value && styles.optionTextSelected,
              ]}
            >
              {service.label.substring(2)}
            </Text>
            <Text style={styles.optionSubtext}>{service.duration}h</Text>
            {selectedService === service.value && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a3142',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#1e2439',
  },
  optionText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  optionSubtext: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  serviceEmoji: {
    fontSize: 32,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
