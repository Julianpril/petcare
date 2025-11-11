import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BottomBarProps = {
  onContact: () => void;
  onBooking: () => void;
};

export function BottomBar({ onContact, onBooking }: BottomBarProps) {
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.contactButton} onPress={onContact}>
        <Ionicons name="chatbubble" size={24} color="#667eea" />
        <Text style={styles.contactButtonText}>Contactar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bookButton} onPress={onBooking}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.bookButtonGradient}>
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.bookButtonText}>Reservar</Text>
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
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a3142',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  contactButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
