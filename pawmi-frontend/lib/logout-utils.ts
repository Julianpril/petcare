import { Alert, Platform } from 'react-native';

const LOGOUT_TITLE = '🚪 Cerrar sesión';
const LOGOUT_MESSAGE = '¿Estás seguro de que quieres cerrar sesión?';

export async function confirmLogout(): Promise<boolean> {
  if (Platform.OS === 'web') {
    const text = `${LOGOUT_TITLE}\n\n${LOGOUT_MESSAGE}`;
    if (typeof globalThis.confirm === 'function') {
      return globalThis.confirm(text) === true;
    }
    return true;
  }

  return new Promise(resolve => {
    Alert.alert(
      LOGOUT_TITLE,
      LOGOUT_MESSAGE,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => resolve(true) },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(false),
      }
    );
  });
}
