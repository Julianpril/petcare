import React, { useState } from 'react';
import { ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

interface InputConfig {
  field: keyof typeof initialFormData;
  placeholder: string;
  autoCapitalize?: 'none' | 'words';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  optional?: boolean;
}

const initialFormData = { username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '' };

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialFormData, string>> & { error?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Registrando:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/login');
    } catch (error) {
      console.error('Error:', error);
      setErrors({ error: 'Error al registrar' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof initialFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const inputs: InputConfig[] = [
    { field: 'fullName', placeholder: 'Nombre completo', autoCapitalize: 'words' },
    { field: 'username', placeholder: 'Usuario', autoCapitalize: 'none' },
    { field: 'email', placeholder: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
    { field: 'phone', placeholder: 'Teléfono (opcional)', keyboardType: 'phone-pad', optional: true, autoCapitalize: 'none' },
    { field: 'password', placeholder: 'Contraseña', secure: true, autoCapitalize: 'none' },
    { field: 'confirmPassword', placeholder: 'Confirmar contraseña', secure: true, autoCapitalize: 'none' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Crear Cuenta</Text>
        {errors.error && <Text style={styles.error}>{errors.error}</Text>}
        {inputs.map(({ field, placeholder, autoCapitalize, keyboardType, secure }) => (
          <View key={field} style={styles.inputContainer}>
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#AAB4C0"
              value={formData[field]}
              onChangeText={text => updateField(field, text)}
              style={[styles.input, errors[field] && styles.inputError]}
              autoCapitalize={autoCapitalize || 'none'}
              autoCorrect={false}
              keyboardType={keyboardType}
              secureTextEntry={secure}
            />
            {errors[field] && <Text style={styles.fieldError}>{errors[field]}</Text>}
          </View>
        ))}
        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Registrando...' : 'Crear'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#122432', justifyContent: 'center', alignItems: 'center', padding: 20, paddingTop: 50 },
  form: { width: '100%', maxWidth: 400, backgroundColor: '#1E2A38', padding: 30, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#EAEAEA', textAlign: 'center', marginBottom: 30 },
  inputContainer: { marginBottom: 15 },
  input: { backgroundColor: '#2A3A4A', color: '#EAEAEA', fontSize: 16, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#3A4A5A' },
  inputError: { borderColor: '#ff6f61', borderWidth: 2 },
  button: { backgroundColor: '#ff6f61', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#666' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginButton: { backgroundColor: 'transparent', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#47a9ff' },
  loginButtonText: { color: '#47a9ff', fontSize: 16 },
  error: { color: '#ff6f61', marginBottom: 15, textAlign: 'center', fontSize: 14 },
  fieldError: { color: '#ff6f61', fontSize: 12, marginTop: 5, marginLeft: 5 },
});