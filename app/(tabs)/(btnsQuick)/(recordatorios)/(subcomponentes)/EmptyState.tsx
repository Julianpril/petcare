import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No hay eventos programados para esta fecha
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#AAB4C0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EmptyState;