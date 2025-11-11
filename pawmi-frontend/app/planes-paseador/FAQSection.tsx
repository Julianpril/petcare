import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function FAQSection() {
  return (
    <View style={styles.faqSection}>
      <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>

      <View style={styles.faqCard}>
        <View style={styles.faqHeader}>
          <Ionicons name="card" size={24} color="#8b5cf6" />
          <Text style={styles.faqQuestion}>¿Cómo funcionan los pagos?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          Procesamos tus pagos semanalmente. Recibes el monto de tus reservas menos la comisión
          correspondiente a tu plan.
        </Text>
      </View>

      <View style={styles.faqCard}>
        <View style={styles.faqHeader}>
          <Ionicons name="trending-up" size={24} color="#8b5cf6" />
          <Text style={styles.faqQuestion}>¿Puedo cambiar de plan?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          Sí, puedes actualizar o cambiar tu plan en cualquier momento. El cambio se aplica desde el
          siguiente ciclo de facturación.
        </Text>
      </View>

      <View style={styles.faqCard}>
        <View style={styles.faqHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
          <Text style={styles.faqQuestion}>¿Necesito verificación?</Text>
        </View>
        <Text style={styles.faqAnswer}>
          Para planes Premium y Empresarial, verificamos tu identidad y antecedentes para dar más
          confianza a los clientes.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  faqSection: {
    marginTop: 40,
    gap: 16,
  },
  faqTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  faqCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginLeft: 36,
  },
});
