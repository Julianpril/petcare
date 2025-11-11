// lib/notifications/notification-context.tsx
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { NotificationPermissionStatus, notificationService } from './notificationService';

interface NotificationContextType {
  permissionStatus: NotificationPermissionStatus | null;
  requestPermissions: () => Promise<void>;
  scheduleReminder: (petName: string, type: string, date: Date, data?: any) => Promise<string | null>;
  scheduleDailyFood: (petName: string, hour: number, minute: number) => Promise<string | null>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  isInitialized: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Verificar permisos al iniciar
    checkPermissions();

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notificación recibida:', notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Usuario tocó la notificación:', response);
      const data = response.notification.request.content.data;

      // Aquí puedes navegar a pantallas específicas según el tipo
      if (data.type === 'reminder') {
        console.log('Navegando a recordatorios...');
        // TODO: Implementar navegación
      } else if (data.type === 'food') {
        console.log('Navegando a comida...');
        // TODO: Implementar navegación
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus({
        granted: status === 'granted',
        canAskAgain: status === 'undetermined',
        status,
      });
      setIsInitialized(true);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsInitialized(true);
    }
  };

  const requestPermissions = async () => {
    const status = await notificationService.requestPermissions();
    setPermissionStatus(status);
    
    if (status.granted) {
      // Obtener push token si es necesario
      await notificationService.getExpoPushToken();
    }
  };

  const scheduleReminder = async (
    petName: string,
    type: string,
    date: Date,
    data?: any
  ): Promise<string | null> => {
    if (!permissionStatus?.granted) {
      console.log('⚠️ No hay permisos para notificaciones');
      return null;
    }

    return notificationService.scheduleReminderNotification(petName, type, date, data);
  };

  const scheduleDailyFood = async (
    petName: string,
    hour: number,
    minute: number
  ): Promise<string | null> => {
    if (!permissionStatus?.granted) {
      console.log('⚠️ No hay permisos para notificaciones');
      return null;
    }

    return notificationService.scheduleDailyFoodReminder(petName, hour, minute);
  };

  const cancelNotification = async (id: string) => {
    await notificationService.cancelNotification(id);
  };

  const cancelAllNotifications = async () => {
    await notificationService.cancelAllNotifications();
  };

  const sendTestNotification = async () => {
    await notificationService.sendImmediateNotification(
      '🐾 Notificación de prueba',
      '¡Las notificaciones están funcionando correctamente!',
      { test: true }
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        permissionStatus,
        requestPermissions,
        scheduleReminder,
        scheduleDailyFood,
        cancelNotification,
        cancelAllNotifications,
        sendTestNotification,
        isInitialized,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
