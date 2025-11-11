import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useResponsive } from '../../../../hooks/useResponsive';
import type { QuickAction, QuickActionRoute } from './types';

interface QuickActionsProps {
  actions: QuickAction[];
  onNavigate: (route: QuickActionRoute) => void;
}

export function QuickActions({ actions, onNavigate }: QuickActionsProps) {
  const responsive = useResponsive();

  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: responsive.spacing.xl,
    },
    sectionTitle: {
      fontSize: responsive.fontSize.xl,
      fontWeight: '800',
      color: '#f8fafc',
      letterSpacing: -0.5,
      marginBottom: responsive.spacing.md,
      paddingHorizontal: responsive.spacing.md,
    },
    scrollContainer: {
      paddingHorizontal: responsive.spacing.md,
    },
    actionButton: {
      alignItems: 'center',
      gap: responsive.spacing.sm,
      width: responsive.isSmall ? 110 : 130,
      marginRight: responsive.spacing.md,
    },
    actionGradient: {
      width: responsive.isSmall ? 100 : 120,
      height: responsive.isSmall ? 100 : 120,
      borderRadius: responsive.isSmall ? 16 : 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    actionLabel: {
      fontSize: responsive.fontSize.sm,
      color: '#e2e8f0',
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 0.3,
      width: '100%',
      flexWrap: 'wrap',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.sectionTitle}>Acciones rápidas</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollContainer}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={dynamicStyles.actionButton}
            onPress={() => onNavigate(action.route)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={dynamicStyles.actionGradient}
            >
              <Ionicons name={action.icon} size={responsive.isSmall ? 24 : 28} color="#fff" />
            </LinearGradient>
            <Text style={dynamicStyles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
