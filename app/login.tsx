import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from './Auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return setError('Por favor completa todos los campos');
    setIsLoading(true);
    setError('');
    try {
      console.log('Iniciando login...');
      if (!(await login(username, password))) {
        setError('Usuario o contraseña incorrectos');
        console.log('Login falló');
      } else {
        console.log('Login exitoso, navegando...');
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <View style={styles.testInfo}>
          <Text style={styles.testTitle}>Usuarios de prueba:</Text>
          <View style={styles.quickButtons}>
            {[
              ['usuario1', 'contrasena1'],
              ['usuario2', 'contrasena2'],
              ['admin', 'admin123'],
            ].map(([user, pass]) => (
              <TouchableOpacity
                key={user}
                style={styles.quickButton}
                onPress={() => quickLogin(user, pass)}
              >
                <Text style={styles.quickButtonText}>{user}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          placeholder="Usuario"
          placeholderTextColor="#AAB4C0"
          value={username}
          onChangeText={(text) => { setUsername(text); setError(''); }}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#AAB4C0"
          secureTextEntry
          value={password}
          onChangeText={(text) => { setPassword(text); setError(''); }}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Iniciando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122432',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E2A38',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#EAEAEA', textAlign: 'center', marginBottom: 20 },
  testInfo: { backgroundColor: '#2A3A4A', borderRadius: 8, padding: 15, marginBottom: 20 },
  testTitle: { fontSize: 14, color: '#EAEAEA', textAlign: 'center', marginBottom: 10, fontWeight: '600' },
  quickButtons: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 8 },
  quickButton: { backgroundColor: '#47a9ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, minWidth: 70 },
  quickButtonText: { color: '#fff', fontSize: 12, textAlign: 'center', fontWeight: '500' },
  input: {
    backgroundColor: '#2A3A4A',
    color: '#EAEAEA',
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3A4A5A',
  },
  button: { backgroundColor: '#ff6f61', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#666' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerButton: { backgroundColor: 'transparent', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#47a9ff' },
  registerButtonText: { color: '#47a9ff', fontSize: 14 },
  error: { color: '#ff6f61', marginBottom: 15, textAlign: 'center', fontSize: 14 },
});