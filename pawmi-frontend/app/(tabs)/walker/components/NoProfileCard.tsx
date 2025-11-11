import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoProfileCardProps {
  onCreateProfile: () => void;
}

export function NoProfileCard({ onCreateProfile }: NoProfileCardProps) {
  return (
    <View style={styles.noProfileCard}>
      <Ionicons name="information-circle" size={48} color="#667eea" />
      <Text style={styles.noProfileTitle}>Completa tu perfil de paseador</Text>
      <Text style={styles.noProfileText}>
        Crea tu perfil profesional para empezar a recibir solicitudes de paseo
      </Text>
      <TouchableOpacity style={styles.createProfileButton} onPress={onCreateProfile}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.createProfileGradient}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.createProfileText}>Crear mi perfil</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  noProfileCard: {
    margin: 16,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  noProfileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  createProfileButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  createProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  createProfileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
