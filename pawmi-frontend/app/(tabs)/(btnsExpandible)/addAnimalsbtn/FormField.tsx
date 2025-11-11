import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

export function FormField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  required = false,
}: FormFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon as any} size={18} color="#6366f1" />
        <Text style={styles.label}>{label}</Text>
        {required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>*</Text>
          </View>
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
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
  requiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    backgroundColor: '#16181d',
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
});
