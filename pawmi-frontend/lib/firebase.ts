// Configuración de Firebase para Google Sign-In
export const firebaseConfig = {
  webClientId: '298440754227-58krj7bdii9gdpbjorfg3u5ib4550dtu.apps.googleusercontent.com',
};

// Nota: Para Android, necesitas agregar la huella digital SHA-1 en:
// Firebase Console > Project Settings > Your apps > Android app
// 
// Para obtener tu SHA-1:
// cd android && ./gradlew signingReport
// (En Windows: cd android && gradlew signingReport)
//
// Busca la línea "SHA1:" en el output y cópiala a Firebase Console
