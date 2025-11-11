import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormInputProps {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export function FormInput({ label, icon, placeholder, value, onChange, multiline = false }: FormInputProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon as any} size={18} color="#6366f1" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  inputContainer: {
    backgroundColor: '#0a0a0b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
});
