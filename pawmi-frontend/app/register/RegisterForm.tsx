import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { FormData, InputConfig } from './types';
import { INPUT_CONFIGS } from './types';

interface RegisterFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onUpdateField: (field: keyof FormData, value: string) => void;
  disabled?: boolean;
}

export function RegisterForm({ formData, errors, onUpdateField, disabled }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      {INPUT_CONFIGS.map(({ field, placeholder, icon, autoCapitalize, keyboardType, secure }: InputConfig) => (
        <View key={field} style={styles.inputContainer}>
          <View style={[styles.inputWrapper, errors[field] && styles.inputWrapperError]}>
            <Ionicons name={icon} size={20} color="#AAB4C0" style={styles.inputIcon} />
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#AAB4C0"
              value={formData[field]}
              onChangeText={(text) => onUpdateField(field, text)}
              style={styles.input}
              autoCapitalize={autoCapitalize || 'none'}
              autoCorrect={false}
              keyboardType={keyboardType}
              secureTextEntry={
                secure && (field === 'password' ? !showPassword : !showConfirmPassword)
              }
              editable={!disabled}
            />
            {secure && (
              <TouchableOpacity
                onPress={() =>
                  field === 'password'
                    ? setShowPassword(!showPassword)
                    : setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={
                    (field === 'password' ? showPassword : showConfirmPassword) ? 'eye-off' : 'eye'
                  }
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
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 5,
    gap: 4,
  },
  fieldError: {
    color: '#ff6f61',
    fontSize: 12,
  },
});
