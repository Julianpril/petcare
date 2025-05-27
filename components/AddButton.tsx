import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AddButtonProps } from './../app/(tabs)/(btnsQuick)/(recordatorios)/(subcomponentes)/interfaz';

const AddButton: React.FC<AddButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
    >
      <Text style={styles.addButtonText}>+ Agregar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#FF9800',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddButton;