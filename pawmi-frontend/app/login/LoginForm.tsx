import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  hasError,
  disabled,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, hasError && !email && styles.inputWrapperError]}>
          <Ionicons name="mail" size={20} color="#AAB4C0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#AAB4C0"
            value={email}
            onChangeText={onEmailChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!disabled}
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, hasError && !password && styles.inputWrapperError]}>
          <Ionicons name="lock-closed" size={20} color="#AAB4C0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#AAB4C0"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#AAB4C0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
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
});
