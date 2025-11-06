/**
 * Componente de estado de carga
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({ message = 'Cargando información...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="hourglass-outline" size={48} color="#6366f1" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
});
