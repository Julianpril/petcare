import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabsSelectorProps = {
  selectedTab: 'info' | 'reviews';
  reviewsCount: number;
  onSelectTab: (tab: 'info' | 'reviews') => void;
};

export function TabsSelector({ selectedTab, reviewsCount, onSelectTab }: TabsSelectorProps) {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'info' && styles.tabActive]}
        onPress={() => onSelectTab('info')}
      >
        <Text style={[styles.tabText, selectedTab === 'info' && styles.tabTextActive]}>
          Información
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, selectedTab === 'reviews' && styles.tabActive]}
        onPress={() => onSelectTab('reviews')}
      >
        <Text style={[styles.tabText, selectedTab === 'reviews' && styles.tabTextActive]}>
          Reseñas ({reviewsCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1f2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a3142',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#667eea',
  },
});
