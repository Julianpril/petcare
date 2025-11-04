import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChangeText, onSend, disabled }: ChatInputProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.inputWrapper}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!value.trim() || disabled) && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!value.trim() || disabled}
        >
          <LinearGradient
            colors={value.trim() && !disabled ? ['#6366f1', '#8b5cf6'] : ['#374151', '#1f2937']}
            style={styles.sendButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    backgroundColor: '#0a0a0b',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#16181d',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 15,
    maxHeight: 120,
    fontWeight: '500',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
