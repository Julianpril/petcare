// app/login.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from './Auth'; 

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Iniciando login...');
      const success = await login(username, password);
      
      if (!success) {
        setError('Usuario o contraseña incorrectos');
        console.log('Login falló');
      } else {
        console.log('Login exitoso, navegando...');
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <Text style={styles.testInfo}>
          Usuarios de prueba:{'\n'}
          usuario1 / contrasena1{'\n'}
          usuario2 / contrasena2{'\n'}
          usuario3 / contrasena3
        </Text>
        
        {!!error && <Text style={styles.error}>{error}</Text>}
        
        <TextInput
          placeholder="Usuario"
          placeholderTextColor="#AAB4C0"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError('');
          }}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#AAB4C0"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Iniciando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            setUsername('usuario1');
            setPassword('contrasena1');
          }}
        >
          <Text style={styles.testButtonText}>Usar usuario1</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EAEAEA',
    textAlign: 'center',
    marginBottom: 20,
  },
  testInfo: {
    fontSize: 12,
    color: '#AAB4C0',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#2A3A4A',
    borderRadius: 8,
  },
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
  button: {
    backgroundColor: '#ff6f61',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#47a9ff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  error: {
    color: '#ff6f61',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});

