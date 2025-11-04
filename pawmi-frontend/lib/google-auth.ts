import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '298440754227-58krj7bdii9gdpbjorfg3u5ib4550dtu.apps.googleusercontent.com';

// Para obtener Android Client ID:
// 1. Ve a Google Cloud Console
// 2. Credentials > Create OAuth client ID > Android
// 3. Agrega tu Package name y SHA-1 fingerprint
// 
// Para obtener SHA-1:
// cd android && ./gradlew signingReport
// (Windows: cd android && gradlew signingReport)

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
    // androidClientId: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Agregar después
    // iosClientId: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com', // Si usas iOS
  });

  return { request, response, promptAsync };
};

export const getGoogleUserInfo = async (idToken: string) => {
  try {
    // Decodificar el JWT id_token para obtener info del usuario
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing ID token:', error);
    throw error;
  }
};
