import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface BasicInfoFieldsProps {
  name: string;
  breed: string;
  age: string;
  weight: string;
  onChangeName: (value: string) => void;
  onChangeBreed: (value: string) => void;
  onChangeAge: (value: string) => void;
  onChangeWeight: (value: string) => void;
}

export default function BasicInfoFields({
  name,
  breed,
  age,
  weight,
  onChangeName,
  onChangeBreed,
  onChangeAge,
  onChangeWeight,
}: BasicInfoFieldsProps) {
  return (
    <>
      {/* Nombre */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="heart" size={18} color="#6366f1" />
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>*</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={onChangeName}
            placeholder="Nombre de la mascota"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* Raza */}
      <View style={styles.inputGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="paw" size={18} color="#6366f1" />
          <Text style={styles.label}>Raza</Text>
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>*</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={onChangeBreed}
            placeholder="Raza de la mascota"
            placeholderTextColor="#64748b"
          />
        </View>
      </View>

      {/* Edad y Peso en fila */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <View style={styles.labelContainer}>
            <Ionicons name="calendar-outline" size={18} color="#6366f1" />
            <Text style={styles.label}>Edad</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={onChangeAge}
              placeholder="Ej: 2 años"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <View style={styles.labelContainer}>
            <Ionicons name="barbell-outline" size={18} color="#6366f1" />
            <Text style={styles.label}>Peso</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={onChangeWeight}
              placeholder="Ej: 25 kg"
              placeholderTextColor="#64748b"
            />
          </View>
        </View>
      </View>
    </>
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
});
