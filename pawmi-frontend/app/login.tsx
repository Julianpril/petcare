import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import HamsterLoader from '../components/loader';
import { useAuth } from '../lib/auth-context';
import { getGoogleUserInfo, useGoogleAuth } from '../lib/google-auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { request, response, promptAsync } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Manejar respuesta de Google Sign-In
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
      // Obtener información del usuario (para logging)
      const userInfo = await getGoogleUserInfo(idToken);
      console.log('Google User Info:', userInfo);

      // Enviar id_token al backend
      const response = await fetch('http://localhost:8000/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al autenticar con Google');
      }

      const data = await response.json();
      
      // Guardar token en AsyncStorage
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem('auth_token', data.access_token);

      Alert.alert(
        '✅ Inicio de sesión exitoso',
        `Bienvenido, ${userInfo.name}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            }
          }
        ]
      );

    } catch (err: any) {
      console.error('Error processing Google sign-in:', err);
      setError(err.message || 'Error al procesar la información de Google');
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
        console.log('✅ Redirigiendo a home...');
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
      // Abrir el flujo de autenticación de Google
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={40} color="#fff" />
          </View>
          <Text style={styles.appName}>Pawmi</Text>
          <Text style={styles.appSubtitle}>Cuidado veterinario inteligente</Text>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessContainer}>
          <Text style={styles.subtitle}>Acceso rápido de prueba</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => quickLogin('usuario1@pawmi.com', 'contrasena123')}
              disabled={loading}
            >
              <Ionicons name="person" size={24} color="#CBD5E1" />
              <Text style={styles.quickButtonText}>Usuario 1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => quickLogin('admin@pawmi.com', 'admin12345')}
              disabled={loading}
            >
              <Ionicons name="shield-checkmark" size={24} color="#CBD5E1" />
              <Text style={styles.quickButtonText}>Admin</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => quickLogin('test@pawmi.com', 'test12345')}
              disabled={loading}
            >
              <Ionicons name="settings" size={24} color="#CBD5E1" />
              <Text style={styles.quickButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>O inicia sesión</Text>
          <View style={styles.divider} />
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>

          {/* Google Sign-In Button */}
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>O con tu cuenta</Text>
            <View style={styles.divider} />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ff6f61" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, error && !email && styles.inputWrapperError]}>
              <Ionicons name="mail" size={20} color="#AAB4C0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#AAB4C0"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, error && !password && styles.inputWrapperError]}>
              <Ionicons name="lock-closed" size={20} color="#AAB4C0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#AAB4C0"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#AAB4C0" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>Iniciando...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>¿No tienes cuenta? </Text>
            <Text style={styles.registerButtonTextBold}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Loading Overlay with HamsterLoader */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <HamsterLoader size={200} duration={1200} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#AAB4C0',
  },
  quickAccessContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#AAB4C0',
    marginBottom: 12,
    textAlign: 'center',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#1A1F26',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3340',
  },
  quickButtonText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A3340',
  },
  dividerText: {
    color: '#AAB4C0',
    paddingHorizontal: 12,
    fontSize: 12,
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
  googleButton: {
    backgroundColor: '#DB4437',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232931',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3340',
    paddingHorizontal: 15,
  },
  inputWrapperError: {
    borderColor: '#ff6f61',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#EAEAEA',
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#4A5568',
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  registerButton: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#AAB4C0',
    fontSize: 15,
  },
  registerButtonTextBold: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6f6120',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff6f61',
    fontSize: 14,
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});