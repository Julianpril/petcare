import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  formatTime: (date: Date) => string;
}

export default function ChatMessage({ message, formatTime }: ChatMessageProps) {
  return (
    <View
      style={[
        styles.messageContainer,
        message.from === 'user' ? styles.userContainer : styles.botContainer,
      ]}
    >
      {message.from === 'bot' && (
        <View style={styles.botAvatar}>
          <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.avatarGradient}>
            <Ionicons name="medical" size={20} color="#ffffff" />
          </LinearGradient>
        </View>
      )}
      <View style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, message.from === 'user' ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
        {message.timestamp && (
          <Text style={[styles.timestamp, message.from === 'user' && styles.timestampUser]}>
            {formatTime(message.timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  botBubble: {
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#f8fafc',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '400',
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
