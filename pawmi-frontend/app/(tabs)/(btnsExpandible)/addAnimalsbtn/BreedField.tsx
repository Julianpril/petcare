import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { BreedSuggestion } from './types';

interface BreedFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  classifying: boolean;
  suggestions: BreedSuggestion[];
  onSelectSuggestion: (breed: string) => void;
}

export function BreedField({
  value,
  onChangeText,
  classifying,
  suggestions,
  onSelectSuggestion,
}: BreedFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Ionicons name="paw" size={18} color="#6366f1" />
        <Text style={styles.label}>Raza</Text>
        <View style={styles.requiredBadge}>
          <Text style={styles.requiredText}>*</Text>
        </View>
        {classifying && <ActivityIndicator size="small" color="#6366f1" style={{ marginLeft: 8 }} />}
      </View>

      {classifying && (
        <View style={styles.aiDetectingBanner}>
          <Ionicons name="sparkles" size={16} color="#6366f1" />
          <Text style={styles.aiDetectingText}>Detectando raza con IA...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Ej: Golden Retriever, Persa, Mestizo..."
          placeholderTextColor="#64748b"
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.breedSuggestionsContainer}>
          <View style={styles.suggestionHeader}>
            <Ionicons name="sparkles" size={14} color="#6366f1" />
            <Text style={styles.suggestionHeaderText}>Sugerencias de IA:</Text>
          </View>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.breedSuggestion,
                value === suggestion.breed && styles.breedSuggestionSelected,
              ]}
              onPress={() => onSelectSuggestion(suggestion.breed)}
            >
              <View style={styles.suggestionContent}>
                <Text
                  style={[
                    styles.suggestionBreed,
                    value === suggestion.breed && styles.suggestionBreedSelected,
                  ]}
                >
                  {suggestion.breed}
                </Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{suggestion.confidence.toFixed(1)}%</Text>
                </View>
              </View>
              {value === suggestion.breed && (
                <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  requiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  aiDetectingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  aiDetectingText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#16181d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '500',
  },
  breedSuggestionsContainer: {
    marginTop: 12,
    backgroundColor: '#16181d',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  suggestionHeaderText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '700',
  },
  breedSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  breedSuggestionSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  suggestionBreed: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '600',
    flex: 1,
  },
  suggestionBreedSelected: {
    color: '#6366f1',
    fontWeight: '700',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(67, 233, 123, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: '#43e97b',
    fontWeight: '700',
  },
});
