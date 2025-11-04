import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HamsterLoader from '../components/loader';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../lib/auth-context';

interface InputConfig {
  field: keyof typeof initialFormData;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  autoCapitalize?: 'none' | 'words';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  optional?: boolean;
}

const initialFormData = { username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '' };

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>> & { error?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.username.trim()) newErrors.username = 'Requerido';
    else if (formData.username.length < 3) newErrors.username = 'Mínimo 3 caracteres';
    if (!formData.email.trim()) newErrors.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'No válido';
    if (!formData.password.trim()) newErrors.password = 'Requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Requerida';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'No coinciden';
    if (!formData.fullName.trim()) newErrors.fullName = 'Requerido';
    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      setErrors({});

      const username = formData.username.trim().toLowerCase();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();
      const fullName = formData.fullName.trim();
      const phone = formData.phone.trim();

      // Register via backend API
      await apiClient.register({
        email,
        username,
        password,
        full_name: fullName || undefined,
        phone: phone || undefined,
      });

      // After successful registration, login
      const loginSuccess = await login(username, password);
      if (loginSuccess) {
        router.replace('/(tabs)');
        return;
      }

      router.replace('/login');
    } catch (error: any) {
      console.error('Error:', error);
      setErrors({ error: 'Error al registrar. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando sesión con Google...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Aquí irá la lógica de Google Sign-In
    } catch (error) {
      console.error('Error:', error);
      setErrors({ error: 'Error al iniciar sesión con Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof initialFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const inputs: InputConfig[] = [
    { field: 'fullName', placeholder: 'Nombre completo', icon: 'person', autoCapitalize: 'words' },
    { field: 'username', placeholder: 'Usuario', icon: 'person-circle', autoCapitalize: 'none' },
    { field: 'email', placeholder: 'Email', icon: 'mail', keyboardType: 'email-address', autoCapitalize: 'none' },
    { field: 'phone', placeholder: 'Teléfono (opcional)', icon: 'call', keyboardType: 'phone-pad', optional: true, autoCapitalize: 'none' },
    { field: 'password', placeholder: 'Contraseña', icon: 'lock-closed', secure: true, autoCapitalize: 'none' },
    { field: 'confirmPassword', placeholder: 'Confirmar contraseña', icon: 'lock-closed', secure: true, autoCapitalize: 'none' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>
        
        {errors.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#ff6f61" />
            <Text style={styles.error}>{errors.error}</Text>
          </View>
        )}

        {/* Google Sign-In Button */}
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.googleButtonText}>Continuar con Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>O regístrate con email</Text>
          <View style={styles.divider} />
        </View>

        {/* Form Inputs */}
        {inputs.map(({ field, placeholder, icon, autoCapitalize, keyboardType, secure }) => (
          <View key={field} style={styles.inputContainer}>
            <View style={[styles.inputWrapper, errors[field] && styles.inputWrapperError]}>
              <Ionicons name={icon} size={20} color="#AAB4C0" style={styles.inputIcon} />
              <TextInput
                placeholder={placeholder}
                placeholderTextColor="#AAB4C0"
                value={formData[field]}
                onChangeText={text => updateField(field, text)}
                style={styles.input}
                autoCapitalize={autoCapitalize || 'none'}
                autoCorrect={false}
                keyboardType={keyboardType}
                secureTextEntry={secure && (field === 'password' ? !showPassword : !showConfirmPassword)}
              />
              {secure && (
                <TouchableOpacity
                  onPress={() => field === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={(field === 'password' ? showPassword : showConfirmPassword) ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#AAB4C0" 
                  />
                </TouchableOpacity>
              )}
            </View>
            {errors[field] && (
              <View style={styles.fieldErrorContainer}>
                <Ionicons name="warning" size={12} color="#ff6f61" />
                <Text style={styles.fieldError}>{errors[field]}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Register Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister} 
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Registrando...</Text>
          ) : (
            <>
              <Text style={styles.buttonText}>Crear Cuenta</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>¿Ya tienes cuenta? </Text>
          <Text style={[styles.loginButtonText, styles.loginButtonTextBold]}>Inicia sesión</Text>
        </TouchableOpacity>
      </View>
      
      {/* Loading Overlay with HamsterLoader */}
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <HamsterLoader size={200} duration={1200} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#0F1419', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50 
  },
  form: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#1A1F26', 
    padding: 30, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 16, 
    elevation: 12 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#AAB4C0', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  googleButton: { 
    backgroundColor: '#DB4437', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 20,
    gap: 10
  },
  googleButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  divider: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#2A3340' 
  },
  dividerText: { 
    color: '#AAB4C0', 
    fontSize: 12, 
    marginHorizontal: 10 
  },
  inputContainer: { 
    marginBottom: 16 
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
    borderWidth: 2 
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1,
    color: '#EAEAEA', 
    fontSize: 16, 
    paddingVertical: 15,
  },
  eyeIcon: { 
    padding: 5 
  },
  button: { 
    backgroundColor: '#ff6f61', 
    flexDirection: 'row',
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    gap: 8
  },
  buttonDisabled: { 
    backgroundColor: '#4A5568',
    opacity: 0.6
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  buttonIcon: { 
    marginLeft: 4 
  },
  loginButton: { 
    flexDirection: 'row',
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16
  },
  loginButtonText: { 
    color: '#AAB4C0', 
    fontSize: 15 
  },
  loginButtonTextBold: {
    color: '#47a9ff',
    fontWeight: 'bold'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6f6120',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8
  },
  error: { 
    color: '#ff6f61', 
    fontSize: 14,
    flex: 1
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 5,
    gap: 4
  },
  fieldError: { 
    color: '#ff6f61', 
    fontSize: 12
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});