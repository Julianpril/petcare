// lib/notifications/useReminderNotifications.ts
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useNotifications } from './notification-context';

interface Reminder {
  id: number;
  title: string;
  start_date: string;
  time?: string | null;
  category: string;
  pet?: {
    name: string;
  };
  description?: string;
  notification_id?: string | null;
}

/**
 * Hook para sincronizar recordatorios de la BD con notificaciones locales
 */
export function useReminderNotifications() {
  const { permissionStatus, scheduleReminder } = useNotifications();

  /**
   * Sincronizar un recordatorio con una notificación
   */
  const syncReminderNotification = useCallback(
    async (reminder: Reminder): Promise<string | null> => {
      // Solo en móviles
      if (Platform.OS === 'web') {
        console.log('⚠️ Notificaciones no disponibles en web');
        return null;
      }

      // Verificar permisos
      if (!permissionStatus?.granted) {
        console.log('⚠️ No hay permisos para notificaciones');
        return null;
      }

      try {
        // Construir la fecha completa del recordatorio
        const reminderDate = new Date(reminder.start_date);
        
        if (reminder.time) {
          const [hours, minutes] = reminder.time.split(':');
          reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          // Si no hay hora, notificar a las 9 AM
          reminderDate.setHours(9, 0, 0, 0);
        }

        // Verificar que la fecha sea futura
        if (reminderDate <= new Date()) {
          console.log('⚠️ El recordatorio es en el pasado, no se programa notificación');
          return null;
        }

        // Programar la notificación
        const petName = reminder.pet?.name || 'tu mascota';
        const notificationId = await scheduleReminder(
          petName,
          reminder.title,
          reminderDate,
          {
            reminderId: reminder.id,
            category: reminder.category,
            description: reminder.description,
          }
        );

        console.log('✅ Notificación programada para recordatorio:', reminder.id, '→', notificationId);
        return notificationId;
      } catch (error) {
        console.error('❌ Error al sincronizar notificación:', error);
        return null;
      }
    },
    [permissionStatus, scheduleReminder]
  );

  /**
   * Sincronizar múltiples recordatorios
   */
  const syncMultipleReminders = useCallback(
    async (reminders: Reminder[]): Promise<Map<number, string>> => {
      const notificationMap = new Map<number, string>();

      for (const reminder of reminders) {
        const notificationId = await syncReminderNotification(reminder);
        if (notificationId) {
          notificationMap.set(reminder.id, notificationId);
        }
      }

      console.log(`✅ Sincronizados ${notificationMap.size} de ${reminders.length} recordatorios`);
      return notificationMap;
    },
    [syncReminderNotification]
  );

  return {
    syncReminderNotification,
    syncMultipleReminders,
    isReady: permissionStatus?.granted || false,
  };
}
