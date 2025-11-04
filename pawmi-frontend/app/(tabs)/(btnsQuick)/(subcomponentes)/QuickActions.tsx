import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  icon: string;
  text: string;
  query: string;
}

interface QuickActionsProps {
  onActionPress: (query: string) => void;
}

const quickActions: QuickAction[] = [
  { icon: 'thermometer', text: 'Fiebre', query: 'Mi mascota tiene fiebre' },
  { icon: 'water', text: 'Vómitos', query: 'Mi mascota está vomitando' },
  { icon: 'fitness', text: 'Diarrea', query: 'Mi mascota tiene diarrea' },
  { icon: 'warning', text: 'Letargo', query: 'Mi mascota está muy decaída' },
];

export default function QuickActions({ onActionPress }: QuickActionsProps) {
  return (
    <View style={styles.quickActionsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.quickActions}
      >
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionButton}
            onPress={() => onActionPress(action.query)}
          >
            <Ionicons name={action.icon as any} size={18} color="#6366f1" />
            <Text style={styles.quickActionText}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  quickActions: {
    gap: 12,
    paddingRight: 24,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16181d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  quickActionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
});
