import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpCenterScreen() {
  const faqItems = [
    {
      question: '¿Cómo agrego una nueva mascota?',
      answer: 'Ve a la pantalla principal y presiona el botón "+" para agregar una nueva mascota. Completa los datos requeridos como nombre, especie, raza y edad.',
    },
    {
      question: '¿Cómo programo un recordatorio?',
      answer: 'Toca el botón de recordatorios en el menú principal, luego presiona "+" y selecciona la fecha, hora y tipo de recordatorio que necesitas.',
    },
    {
      question: '¿Puedo subir fotos de mis mascotas?',
      answer: 'Sí, al crear o editar una mascota, puedes tocar el ícono de la cámara para seleccionar una foto de tu galería.',
    },
    {
      question: '¿Cómo cambio mi información personal?',
      answer: 'Ve a tu perfil, selecciona "Información personal" y edita los campos que desees. No olvides guardar los cambios.',
    },
    {
      question: '¿Las notificaciones funcionan en segundo plano?',
      answer: 'Sí, una vez configuradas, las notificaciones se enviarán automáticamente aunque la app esté cerrada.',
    },
    {
      question: '¿Puedo usar la app sin conexión?',
      answer: 'Algunas funciones requieren conexión a internet, como subir fotos o sincronizar datos. La mayoría de la información se guarda localmente.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centro de ayuda</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="help-circle" size={60} color="#8B5CF6" />
          <Text style={styles.heroTitle}>¿Cómo podemos ayudarte?</Text>
          <Text style={styles.heroSubtitle}>
            Encuentra respuestas a las preguntas más frecuentes
          </Text>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
          
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.questionRow}>
                <Ionicons name="help-circle-outline" size={20} color="#8B5CF6" />
                <Text style={styles.question}>{item.question}</Text>
              </View>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>¿No encuentras lo que buscas?</Text>
          <Text style={styles.contactText}>
            Contáctanos y te ayudaremos personalmente
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/(tabs)/support' as any)}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contactar soporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  question: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  answer: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  contactCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  contactTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
