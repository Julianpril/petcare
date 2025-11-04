import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

interface TypingIndicatorProps {
  isTyping?: boolean;
  isAnalyzing?: boolean;
  typingAnim: Animated.Value;
}

export default function TypingIndicator({ isTyping, isAnalyzing, typingAnim }: TypingIndicatorProps) {
  if (isAnalyzing) {
    return (
      <View style={styles.typingContainer}>
        <View style={styles.botAvatar}>
          <Ionicons name="analytics" size={16} color="#6366f1" />
        </View>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.analyzingText}>Analizando síntomas...</Text>
        </View>
      </View>
    );
  }

  if (isTyping) {
    return (
      <View style={styles.typingContainer}>
        <View style={styles.botAvatar}>
          <Ionicons name="medical" size={16} color="#6366f1" />
        </View>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, { opacity: typingAnim }]} />
          <Animated.View style={[styles.typingDot, styles.typingDotDelay1, { opacity: typingAnim }]} />
          <Animated.View style={[styles.typingDot, styles.typingDotDelay2, { opacity: typingAnim }]} />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    gap: 6,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  typingDotDelay1: {
    marginLeft: 2,
  },
  typingDotDelay2: {
    marginLeft: 4,
  },
  analyzingText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
