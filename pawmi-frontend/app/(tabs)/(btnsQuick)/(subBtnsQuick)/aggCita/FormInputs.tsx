import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormInputsProps {
  title: string;
  vetName: string;
  location: string;
  notes: string;
  onTitleChange: (text: string) => void;
  onVetNameChange: (text: string) => void;
  onLocationChange: (text: string) => void;
  onNotesChange: (text: string) => void;
}

export function FormInputs({
  title,
  vetName,
  location,
  notes,
  onTitleChange,
  onVetNameChange,
  onLocationChange,
  onNotesChange,
}: FormInputsProps) {
  return (
    <>
      {/* Motivo */}
      <View style={styles.section}>
        <Text style={styles.label}>Motivo de la cita *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={onTitleChange}
          placeholder="Ej: Chequeo anual, Vacunación, Consulta"
          placeholderTextColor="#666"
        />
      </View>

      {/* Veterinario */}
      <View style={styles.section}>
        <Text style={styles.label}>Veterinario (opcional)</Text>
        <TextInput
          style={styles.input}
          value={vetName}
          onChangeText={onVetNameChange}
          placeholder="Nombre del veterinario"
          placeholderTextColor="#666"
        />
      </View>

      {/* Ubicación */}
      <View style={styles.section}>
        <Text style={styles.label}>Ubicación (opcional)</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onLocationChange}
          placeholder="Dirección de la clínica"
          placeholderTextColor="#666"
        />
      </View>

      {/* Notas */}
      <View style={styles.section}>
        <Text style={styles.label}>Notas adicionales (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Detalles adicionales sobre la cita"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
});
