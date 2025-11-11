import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const tips = [
  'Responde rápido a las solicitudes',
  'Mantén tu perfil actualizado con fotos',
  'Ofrece múltiples servicios',
  'Pide reseñas a clientes satisfechos',
];

export function TipsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💡 Tips para destacar</Text>
      <View style={styles.tipsContainer}>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#cbd5e1',
  },
});
