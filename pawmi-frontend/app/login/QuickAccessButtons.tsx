import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QUICK_LOGIN_USERS } from './types';

interface QuickAccessButtonsProps {
  onQuickLogin: (email: string, password: string) => void;
  disabled?: boolean;
}

export function QuickAccessButtons({ onQuickLogin, disabled }: QuickAccessButtonsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Acceso rápido de prueba</Text>
      <View style={styles.buttonsRow}>
        {QUICK_LOGIN_USERS.map((user) => (
          <TouchableOpacity
            key={user.email}
            style={styles.button}
            onPress={() => onQuickLogin(user.email, user.password)}
            disabled={disabled}
          >
            <Ionicons name={user.icon} size={24} color="#CBD5E1" />
            <Text style={styles.buttonText}>{user.role}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: '#AAB4C0',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    width: '48%',
    backgroundColor: '#1A1F26',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3340',
  },
  buttonText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
});
