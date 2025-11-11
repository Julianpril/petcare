// lib/notifications/notificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Verificar si las notificaciones están disponibles en esta plataforma
const isNotificationAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

// Configurar cómo se manejan las notificaciones cuando la app está en primer plano
if (isNotificationAvailable) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface ScheduleNotificationParams {
  title: string;
  body: string;
  data?: any;
  trigger: {
    type: 'daily' | 'date' | 'seconds';
    hour?: number;
    minute?: number;
    date?: Date;
    seconds?: number;
    repeats?: boolean;
  };
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Verificar si las notificaciones están disponibles en esta plataforma
   */
  private checkPlatformSupport(): boolean {
    if (!isNotificationAvailable) {
      console.warn('⚠️ Las notificaciones no están disponibles en la plataforma web');
      console.warn('📱 Por favor, prueba en iOS o Android (dispositivo físico o emulador)');
      return false;
    }
    return true;
  }

  /**
   * Solicitar permisos de notificaciones
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      if (!this.checkPlatformSupport()) {
        return {
          granted: false,
          canAskAgain: false,
          status: 'web_not_supported',
        };
      }

      if (!Device.isDevice) {
        console.log('⚠️ Las notificaciones push solo funcionan en dispositivos físicos');
        return {
          granted: false,
          canAskAgain: false,
          status: 'not_device',
        };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        return {
          granted: false,
          canAskAgain: finalStatus === 'undetermined',
          status: finalStatus,
        };
      }

      console.log('✅ Permisos de notificación concedidos');

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return {
        granted: true,
        canAskAgain: false,
        status: finalStatus,
      };
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * Obtener el token de push de Expo (para notificaciones remotas)
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      if (!Device.isDevice) {
        console.log('⚠️ No se puede obtener push token en simulador');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Agregar tu project ID de Expo
      });

      this.expoPushToken = token.data;
      console.log('🔑 Expo Push Token:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error al obtener push token:', error);
      return null;
    }
  }

  /**
   * Programar una notificación local
   */
  async scheduleNotification(params: ScheduleNotificationParams): Promise<string | null> {
    try {
      if (!this.checkPlatformSupport()) {
        return null;
      }

      const { title, body, data, trigger } = params;

      let notificationTrigger: Notifications.NotificationTriggerInput;

      if (trigger.type === 'daily' && trigger.hour !== undefined && trigger.minute !== undefined) {
        // Notificación diaria a una hora específica
        notificationTrigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: trigger.hour,
          minute: trigger.minute,
        };
      } else if (trigger.type === 'date' && trigger.date) {
        // Notificación en una fecha específica
        if (trigger.repeats) {
          // Para repetir, calcular el intervalo desde ahora
          const now = new Date();
          const seconds = Math.floor((trigger.date.getTime() - now.getTime()) / 1000);
          notificationTrigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: seconds > 0 ? seconds : 1,
            repeats: true,
          };
        } else {
          notificationTrigger = {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger.date,
          };
        }
      } else if (trigger.type === 'seconds' && trigger.seconds !== undefined) {
        // Notificación después de X segundos
        notificationTrigger = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: trigger.seconds,
          repeats: trigger.repeats || false,
        };
      } else {
        console.error('❌ Tipo de trigger inválido');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: notificationTrigger,
      });

      console.log('✅ Notificación programada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error al programar notificación:', error);
      return null;
    }
  }

  /**
   * Cancelar una notificación programada
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('🗑️ Notificación cancelada:', notificationId);
    } catch (error) {
      console.error('❌ Error al cancelar notificación:', error);
    }
  }

  /**
   * Cancelar todas las notificaciones programadas
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ Todas las notificaciones canceladas');
    } catch (error) {
      console.error('❌ Error al cancelar notificaciones:', error);
    }
  }

  /**
   * Obtener todas las notificaciones programadas
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Notificaciones programadas:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      return [];
    }
  }

  /**
   * Enviar notificación inmediata (para testing)
   */
  async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      if (!this.checkPlatformSupport()) {
        // Mostrar alert en web para simular notificación
        if (Platform.OS === 'web') {
          Alert.alert(title, body);
        }
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // null = inmediata
      });
      console.log('📬 Notificación inmediata enviada');
    } catch (error) {
      console.error('❌ Error al enviar notificación inmediata:', error);
    }
  }

  /**
   * Programar recordatorio para mascota
   */
  async scheduleReminderNotification(
    petName: string,
    reminderType: string,
    reminderDate: Date,
    reminderData?: any
  ): Promise<string | null> {
    const title = `🐾 Recordatorio: ${petName}`;
    const body = `${reminderType} - ¡No olvides cuidar a ${petName}!`;

    return this.scheduleNotification({
      title,
      body,
      data: {
        type: 'reminder',
        petName,
        reminderType,
        ...reminderData,
      },
      trigger: {
        type: 'date',
        date: reminderDate,
        repeats: false,
      },
    });
  }

  /**
   * Programar recordatorio diario de comida
   */
  async scheduleDailyFoodReminder(
    petName: string,
    hour: number,
    minute: number
  ): Promise<string | null> {
    const title = `🍖 Hora de comer!`;
    const body = `Es hora de alimentar a ${petName}`;

    return this.scheduleNotification({
      title,
      body,
      data: {
        type: 'food',
        petName,
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
        repeats: true,
      },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
