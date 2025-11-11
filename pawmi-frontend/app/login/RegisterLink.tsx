import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface RegisterLinkProps {
  onPress: () => void;
  disabled?: boolean;
}

export function RegisterLink({ onPress, disabled }: RegisterLinkProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>¿No tienes cuenta? </Text>
      <Text style={styles.textBold}>Regístrate</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#AAB4C0',
    fontSize: 15,
  },
  textBold: {
    color: '#667eea',
    fontWeight: 'bold',
  },
});
