import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LoginLinkProps {
  onPress: () => void;
}

export function LoginLink({ onPress }: LoginLinkProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>¿Ya tienes cuenta? </Text>
      <Text style={[styles.text, styles.textBold]}>Inicia sesión</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  text: {
    color: '#AAB4C0',
    fontSize: 15,
  },
  textBold: {
    color: '#47a9ff',
    fontWeight: 'bold',
  },
});
