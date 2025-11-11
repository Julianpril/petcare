import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { HistoryItem } from '../types';

interface HistoryTimelineProps {
  items: HistoryItem[];
  formatDate: (date: string) => string;
}

export function HistoryTimeline({ items, formatDate }: HistoryTimelineProps) {
  return (
    <View style={styles.timeline}>
      {items.map((item) => (
        <HistoryItemCard key={item.id} item={item} formatDate={formatDate} />
      ))}
    </View>
  );
}

interface HistoryItemCardProps {
  item: HistoryItem;
  formatDate: (date: string) => string;
}

function HistoryItemCard({ item, formatDate }: HistoryItemCardProps) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.timelineIndicator}>
        <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}> 
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        </View>
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleRow}>
            <Text style={styles.historyTitle}>{item.title}</Text>
            {item.petName && (
              <View style={styles.petBadge}>
                <Ionicons name="paw" size={12} color="#667eea" />
                <Text style={styles.petBadgeText}>{item.petName}</Text>
              </View>
            )}
          </View>
          <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        </View>

        <Text style={styles.historyDescription}>{item.description}</Text>

        {item.petPhoto && (
          <Image source={{ uri: item.petPhoto }} style={styles.petThumbnail} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    padding: 20,
  },
  historyCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#334155',
    marginTop: 8,
  },
  historyContent: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyHeader: {
    marginBottom: 8,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    flex: 1,
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  petBadgeText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  historyDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  petThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 12,
  },
});
