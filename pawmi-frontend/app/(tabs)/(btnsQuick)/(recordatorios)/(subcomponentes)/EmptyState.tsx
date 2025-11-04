import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.iconGradient}
        >
          <Ionicons name="calendar-outline" size={48} color="#ffffff" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyStateTitle}>
        Sin eventos programados
      </Text>
      <Text style={styles.emptyStateText}>
        No hay eventos para esta fecha. Toca el botón + para agregar uno nuevo.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: 8,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default EmptyState;