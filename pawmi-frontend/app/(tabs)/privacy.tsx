import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyScreen() {
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
        <Text style={styles.headerTitle}>Privacidad y términos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="shield-checkmark" size={60} color="#8B5CF6" />
          <Text style={styles.heroTitle}>Tu privacidad es importante</Text>
          <Text style={styles.heroSubtitle}>
            Lee nuestras políticas de privacidad y términos de uso
          </Text>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Política de Privacidad</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Datos que recopilamos</Text>
            <Text style={styles.cardText}>
              • Información de cuenta (nombre, email){'\n'}
              • Datos de tus mascotas (nombre, especie, edad){'\n'}
              • Recordatorios y citas veterinarias{'\n'}
              • Fotos que subas voluntariamente
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔒 Cómo protegemos tus datos</Text>
            <Text style={styles.cardText}>
              • Encriptación de datos en tránsito y reposo{'\n'}
              • Servidores seguros con certificados SSL{'\n'}
              • Acceso restringido solo a personal autorizado{'\n'}
              • Cumplimiento con regulaciones de protección de datos
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>👥 Compartir información</Text>
            <Text style={styles.cardText}>
              Nunca vendemos tus datos personales a terceros. Solo compartimos información con:{'\n\n'}
              • Veterinarios autorizados por ti{'\n'}
              • Servicios necesarios para el funcionamiento de la app{'\n'}
              • Autoridades cuando sea requerido por ley
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>✅ Tus derechos</Text>
            <Text style={styles.cardText}>
              • Acceder a todos tus datos personales{'\n'}
              • Modificar o actualizar tu información{'\n'}
              • Eliminar tu cuenta y datos permanentemente{'\n'}
              • Exportar todos tus datos en formato portable
            </Text>
          </View>
        </View>

        {/* Terms of Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Términos de Uso</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 Uso de la aplicación</Text>
            <Text style={styles.cardText}>
              Al usar PawMI aceptas:{'\n\n'}
              • Proporcionar información precisa y actualizada{'\n'}
              • No usar la app para fines ilegales{'\n'}
              • Respetar la privacidad de otros usuarios{'\n'}
              • Mantener la seguridad de tu cuenta
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚕️ Información médica</Text>
            <Text style={styles.cardText}>
              PawMI NO sustituye el consejo veterinario profesional. Siempre consulta con un veterinario certificado para diagnósticos y tratamientos.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔄 Actualizaciones</Text>
            <Text style={styles.cardText}>
              Nos reservamos el derecho de actualizar estos términos. Te notificaremos sobre cambios importantes mediante email o notificación en la app.
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿Preguntas sobre privacidad?</Text>
          <Text style={styles.contactText}>
            Contáctanos en: privacy@pawmi.com
          </Text>
          <Text style={styles.lastUpdated}>
            Última actualización: Noviembre 2025
          </Text>
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
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardText: {
    color: '#999',
    fontSize: 14,
    lineHeight: 22,
  },
  contactSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactText: {
    color: '#8B5CF6',
    fontSize: 14,
    marginBottom: 16,
  },
  lastUpdated: {
    color: '#666',
    fontSize: 12,
  },
});
