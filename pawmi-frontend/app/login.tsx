import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';
import { getGoogleUserInfo, useGoogleAuth } from '../lib/google-auth';
import { Divider } from './login/Divider';
import { ErrorMessage } from './login/ErrorMessage';
import { GoogleButton } from './login/GoogleButton';
import { LoginButton } from './login/LoginButton';
import { LoginForm } from './login/LoginForm';
import { LoginHeader } from './login/LoginHeader';
import { QuickAccessButtons } from './login/QuickAccessButtons';
import { RegisterLink } from './login/RegisterLink';
import { LoadingOverlay } from './login/States';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const responsive = useResponsive();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dynamicStyles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: responsive.spacing.lg,
      paddingTop: responsive.spacing.xl * 2,
      paddingBottom: responsive.spacing.xl * 2,
    },
    card: {
      backgroundColor: '#1A1F26',
      borderRadius: responsive.isSmall ? 16 : 20,
      padding: responsive.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
      borderWidth: 1,
      borderColor: '#2A3340',
    },
    cardTitle: {
      fontSize: responsive.fontSize.xl,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: responsive.spacing.lg,
    },
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { params } = response;
      handleGoogleSuccess(params.id_token);
    } else if (response?.type === 'error') {
      console.error('Google Sign-In error:', response.error);
      setError('Error al iniciar sesión con Google');
    }
  }, [response]);

  const handleGoogleSuccess = async (idToken: string | undefined) => {
    if (!idToken) {
      setError('No se pudo obtener el token de Google');
      return;
    }

    setLoading(true);
    try {
      const userInfo = await getGoogleUserInfo(idToken);
      console.log('🔵 Google User Info:', userInfo);
      console.log('🔵 Enviando petición OAuth al backend...');

      await apiClient.loginWithGoogle(idToken);

      console.log('✅ OAuth exitoso, token guardado');

      Alert.alert('✅ Inicio de sesión exitoso', `Bienvenido, ${userInfo.name}!`, [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]);
    } catch (err: any) {
      console.error('❌ Error processing Google sign-in:', err);
      console.error('❌ Error detail:', JSON.stringify(err, null, 2));
      setError(err.detail || err.message || 'Error al procesar la información de Google');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        console.log(' Redirigiendo a home...');
        router.replace('/(tabs)');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error iniciando Google Sign-In:', error);
      setError('Error al iniciar sesión con Google');
    }
  };

  const quickLogin = async (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError('');
    setLoading(true);

    try {
      const success = await login(userEmail, pass);
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Error de autenticación');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={dynamicStyles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollViewStyle}
      >
        <LoginHeader />

        <QuickAccessButtons onQuickLogin={quickLogin} disabled={loading} />

        <Divider text="O inicia sesión" />

        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>Iniciar Sesión</Text>

          <GoogleButton onPress={handleGoogleSignIn} disabled={loading} />

          <Divider text="O con tu cuenta" />

          <ErrorMessage message={error} />

          <LoginForm
            email={email}
            password={password}
            onEmailChange={(text) => {
              setEmail(text);
              setError('');
            }}
            onPasswordChange={(text) => {
              setPassword(text);
              setError('');
            }}
            hasError={!!error}
            disabled={loading}
          />

          <LoginButton onPress={handleLogin} loading={loading} />

          <RegisterLink onPress={() => router.push('/register')} disabled={loading} />
        </View>
      </ScrollView>

      {loading && <LoadingOverlay />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1A1F26',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#2A3340',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
});
