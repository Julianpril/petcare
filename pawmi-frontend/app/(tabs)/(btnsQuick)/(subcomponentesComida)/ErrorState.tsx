/**
 * Componente de estado de error
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ErrorStateProps = {
  message: string;
};

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={48} color="#f59e0b" />
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
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
});
