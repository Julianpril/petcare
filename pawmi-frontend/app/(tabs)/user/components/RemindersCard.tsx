import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useResponsive } from '../../../../hooks/useResponsive';
import type { ReminderItem } from './types';

interface RemindersCardProps {
  reminders: ReminderItem[];
  formatReminderDate: (date: string, time?: string | null) => string;
  getCategoryIcon: (category: string) => keyof typeof Ionicons.glyphMap;
  getCategoryColor: (category: string) => string;
  onViewAll: () => void;
}

export function RemindersCard({
  reminders,
  formatReminderDate,
  getCategoryIcon,
  getCategoryColor,
  onViewAll,
}: RemindersCardProps) {
  const responsive = useResponsive();

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: '#16181d',
      borderRadius: responsive.isSmall ? 16 : 24,
      padding: responsive.spacing.lg,
      marginBottom: responsive.spacing.xl,
      borderWidth: 1,
      borderColor: '#1f2937',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: responsive.spacing.lg,
    },
    cardTitle: {
      fontSize: responsive.fontSize.lg,
      fontWeight: '800',
      color: '#f8fafc',
      letterSpacing: -0.3,
    },
    viewAllText: {
      fontSize: responsive.fontSize.md,
      color: '#6366f1',
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    reminderItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: responsive.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: '#1f2937',
    },
    reminderIconContainer: {
      width: responsive.isSmall ? 36 : 44,
      height: responsive.isSmall ? 36 : 44,
      borderRadius: responsive.isSmall ? 18 : 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: responsive.spacing.sm,
    },
    reminderTitle: {
      fontSize: responsive.fontSize.md,
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: responsive.spacing.xs,
      letterSpacing: -0.2,
    },
    reminderMetaText: {
      fontSize: responsive.fontSize.sm,
      color: '#94a3b8',
      fontWeight: '500',
    },
  });

  if (reminders.length === 0) {
    return null;
  }

  return (
    <View style={dynamicStyles.card}>
      <View style={dynamicStyles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="notifications" size={responsive.isSmall ? 18 : 22} color="#667eea" />
          <Text style={dynamicStyles.cardTitle}>Proximos recordatorios</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={dynamicStyles.viewAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {reminders.slice(0, 3).map((reminder) => {
        const categoryColor = getCategoryColor(reminder.category);
        const categoryIcon = getCategoryIcon(reminder.category);

        return (
          <View style={dynamicStyles.reminderItem} key={reminder.id}>
            <View style={[dynamicStyles.reminderIconContainer, { backgroundColor: `${categoryColor}20` }]}
            >
              <Ionicons name={categoryIcon} size={responsive.isSmall ? 16 : 20} color={categoryColor} />
            </View>
            <View style={styles.reminderContent}>
              <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
              <View style={styles.reminderMeta}>
                {reminder.petName && (
                  <View style={styles.reminderMetaItem}>
                    <Ionicons name="paw" size={12} color="#94a3b8" />
                    <Text style={dynamicStyles.reminderMetaText}>{reminder.petName}</Text>
                  </View>
                )}
                <View style={styles.reminderMetaItem}>
                  <Ionicons name="time" size={12} color="#94a3b8" />
                  <Text style={dynamicStyles.reminderMetaText}>
                    {formatReminderDate(reminder.date, reminder.time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16181d',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  reminderIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  reminderMeta: {
    flexDirection: 'row',
    gap: 14,
  },
  reminderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reminderMetaText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
