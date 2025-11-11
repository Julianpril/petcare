import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface NotesInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function NotesInput({ value, onChangeText }: NotesInputProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notas adicionales (opcional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Ej: Mi perro es muy activo, necesita correr mucho..."
        placeholderTextColor="#64748b"
        multiline
        numberOfLines={4}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a3142',
    minHeight: 100,
  },
});
