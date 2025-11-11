import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FAQItem {
  icon: keyof typeof Ionicons.glyphMap;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    icon: 'help-circle',
    question: '¿Puedo cambiar de plan?',
    answer:
      'Sí, puedes cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente.',
  },
  {
    icon: 'card',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito, débito, PSE y transferencias bancarias.',
  },
  {
    icon: 'refresh',
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí, puedes cancelar tu suscripción cuando quieras sin penalizaciones.',
  },
];

export function FAQSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Preguntas Frecuentes</Text>

      {FAQ_ITEMS.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <Ionicons name={item.icon} size={24} color="#667eea" />
            <Text style={styles.question}>{item.question}</Text>
          </View>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 40,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  answer: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginLeft: 36,
  },
});
