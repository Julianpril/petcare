import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomBarProps {
  total: number;
  duration: number;
  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
}

export function BottomBar({ total, duration, submitting, disabled, onSubmit }: BottomBarProps) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomTotal}>Total: ${total.toLocaleString('es-CO')}</Text>
        <Text style={styles.bottomSubtotal}>
          {duration} hora{duration !== 1 ? 's' : ''}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.submitButton, (submitting || disabled) && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={submitting || disabled}
      >
        <LinearGradient
          colors={submitting || disabled ? ['#94a3b8', '#64748b'] : ['#667eea', '#764ba2']}
          style={styles.submitButtonGradient}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Confirmar Reserva</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1f2e',
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    alignItems: 'center',
  },
  bottomInfo: {
    flex: 1,
  },
  bottomTotal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomSubtotal: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
