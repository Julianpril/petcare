import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FormFooterProps {
  loading: boolean;
  uploadingImage: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function FormFooter({ loading, uploadingImage, onCancel, onSave }: FormFooterProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color="#94a3b8" />
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={loading ? ['#64748b', '#475569'] : ['#43e97b', '#38f9d7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveButtonText}>
                {uploadingImage ? 'Subiendo foto...' : 'Guardando...'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Mascota</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
    backgroundColor: '#0a0a0b',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#16181d',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
