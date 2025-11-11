import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ReminderItem } from '../types';

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
  if (reminders.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="notifications" size={22} color="#43e97b" />
          <Text style={styles.cardTitle}>Próximos recordatorios</Text>
        </View>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {reminders.slice(0, 3).map((reminder) => {
        const categoryColor = getCategoryColor(reminder.category);
        const categoryIcon = getCategoryIcon(reminder.category);

        return (
          <View style={styles.reminderItem} key={reminder.id}>
            <View style={[styles.reminderIconContainer, { backgroundColor: `${categoryColor}20` }]}> 
              <Ionicons name={categoryIcon} size={20} color={categoryColor} />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>{reminder.title}</Text>
              <View style={styles.reminderMeta}>
                {reminder.petName && (
                  <View style={styles.reminderMetaItem}>
                    <Ionicons name="paw" size={12} color="#94a3b8" />
                    <Text style={styles.reminderMetaText}>{reminder.petName}</Text>
                  </View>
                )}
                <View style={styles.reminderMetaItem}>
                  <Ionicons name="time" size={12} color="#94a3b8" />
                  <Text style={styles.reminderMetaText}>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  viewAllText: {
    fontSize: 15,
    color: '#43e97b',
    fontWeight: '700',
    letterSpacing: 0.2,
    flexShrink: 0,
    paddingLeft: 8,
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
    flexShrink: 1,
    minWidth: 0,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: -0.2,
    flexWrap: 'wrap',
  },
  reminderMeta: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  reminderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  reminderMetaText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
