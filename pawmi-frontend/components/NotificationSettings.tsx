// components/NotificationSettings.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../lib/notifications/notification-context';

const isWeb = Platform.OS === 'web';

export default function NotificationSettings() {
  const {
    permissionStatus,
    requestPermissions,
    sendTestNotification,
    cancelAllNotifications,
    isInitialized,
  } = useNotifications();

  const [scheduledCount, setScheduledCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledCount(notifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setLoading(true);
    try {
      await requestPermissions();
      await loadScheduledNotifications();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'No se pudieron solicitar los permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!permissionStatus?.granted) {
      Alert.alert(
        'Permisos requeridos',
        'Primero debes activar las notificaciones',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await sendTestNotification();
      Alert.alert(
        '✅ Notificación enviada',
        'Deberías ver la notificación en un momento'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la notificación');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Cancelar notificaciones',
      '¿Estás seguro de que quieres cancelar todas las notificaciones programadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              await loadScheduledNotifications();
              Alert.alert('✅ Listo', 'Todas las notificaciones han sido canceladas');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron cancelar las notificaciones');
            }
          },
        },
      ]
    );
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="notifications" size={32} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <Text style={styles.headerSubtitle}>
          Configura recordatorios para el cuidado de tus mascotas
        </Text>
      </View>

      {/* Web Warning */}
      {isWeb && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={32} color="#F59E0B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>⚠️ Plataforma Web</Text>
            <Text style={styles.warningText}>
              Las notificaciones no están disponibles en la versión web.
            </Text>
            <Text style={styles.warningText}>
              📱 Para probar notificaciones, por favor usa:
            </Text>
            <Text style={styles.warningSubtext}>
              • Dispositivo Android (físico o emulador)
            </Text>
            <Text style={styles.warningSubtext}>
              • Dispositivo iOS (físico o simulador)
            </Text>
            <Text style={styles.warningSubtext}>
              • Expo Go en tu teléfono
            </Text>
          </View>
        </View>
      )}

      {/* Permission Status */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={permissionStatus?.granted ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={permissionStatus?.granted ? '#10B981' : '#F59E0B'}
          />
          <Text style={styles.cardTitle}>Estado de Permisos</Text>
        </View>
        
        <Text style={styles.statusText}>
          {permissionStatus?.granted
            ? '✅ Notificaciones activadas'
            : '⚠️ Notificaciones desactivadas'}
        </Text>

        {!permissionStatus?.granted && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRequestPermissions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Activar Notificaciones</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Actions */}
      {permissionStatus?.granted && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTestNotification}
          >
            <View style={styles.actionButtonLeft}>
              <Ionicons name="send" size={24} color="#8B5CF6" />
              <Text style={styles.actionButtonText}>Enviar notificación de prueba</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={24} color="#666" />
            <Text style={styles.infoText}>
              Notificaciones programadas: {scheduledCount}
            </Text>
          </View>

          {scheduledCount > 0 && (
            <>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.dangerButtonText}>
                  Cancelar todas las notificaciones
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
        <Text style={styles.infoCardText}>
          Las notificaciones te ayudarán a recordar las comidas, medicamentos,
          citas veterinarias y otros cuidados importantes de tus mascotas.
        </Text>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Consejos</Text>
        <Text style={styles.tipText}>
          • Las notificaciones diarias se repetirán automáticamente
        </Text>
        <Text style={styles.tipText}>
          • Puedes configurar recordatorios desde la pantalla de cada mascota
        </Text>
        <Text style={styles.tipText}>
          • Los recordatorios de comida se pueden programar para múltiples horas del día
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0b',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f23',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1a1a1f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a32',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#2a2a32',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#1a2332',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    flexDirection: 'row',
    gap: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#1a1a1f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a32',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 20,
  },
  warningCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#2a1f0f',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: '#e5e7eb',
    marginBottom: 8,
    lineHeight: 22,
  },
  warningSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    marginBottom: 4,
  },
});
