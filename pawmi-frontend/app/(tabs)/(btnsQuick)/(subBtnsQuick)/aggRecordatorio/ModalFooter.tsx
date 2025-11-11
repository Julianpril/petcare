import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModalFooterProps {
  isValid: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ModalFooter({ isValid, saving, onCancel, onSave }: ModalFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Ionicons name="close-circle-outline" size={20} color="#f8fafc" />
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!isValid || saving) && styles.saveButtonDisabled
        ]}
        onPress={onSave}
        disabled={!isValid || saving}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            (isValid && !saving)
              ? ['#667eea', '#764ba2']
              : ['#475569', '#334155']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButtonGradient}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.saveButtonText}>Guardando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#16181d',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1f2937',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
