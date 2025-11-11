import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TraitsSectionProps {
  traits: string[];
  newTrait: string;
  onNewTraitChange: (value: string) => void;
  onAddTrait: (trait: string) => void;
  onRemoveTrait: (trait: string) => void;
}

const commonTraits = [
  'Juguetón',
  'Tranquilo',
  'Sociable',
  'Protector',
  'Cariñoso',
  'Energético',
  'Obediente',
  'Independiente',
  'Curioso',
  'Amigable',
];

export default function TraitsSection({
  traits,
  newTrait,
  onNewTraitChange,
  onAddTrait,
  onRemoveTrait,
}: TraitsSectionProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Ionicons name="sparkles" size={18} color="#6366f1" />
        <Text style={styles.label}>Características</Text>
      </View>
      <Text style={styles.subLabel}>Selecciona las características de tu mascota:</Text>

      <View style={styles.commonTraitsContainer}>
        {commonTraits.map((trait) => (
          <TouchableOpacity
            key={trait}
            style={[
              styles.commonTrait,
              traits.includes(trait) && styles.commonTraitSelected,
            ]}
            onPress={() =>
              traits.includes(trait) ? onRemoveTrait(trait) : onAddTrait(trait)
            }
            activeOpacity={0.7}
          >
            {traits.includes(trait) && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#6366f1"
                style={{ marginRight: 4 }}
              />
            )}
            <Text
              style={[
                styles.commonTraitText,
                traits.includes(trait) && styles.commonTraitTextSelected,
              ]}
            >
              {trait}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input personalizado */}
      <View style={styles.customTraitContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
          <TextInput
            style={styles.input}
            value={newTrait}
            onChangeText={onNewTraitChange}
            placeholder="Agregar característica personalizada"
            placeholderTextColor="#64748b"
          />
        </View>
        <TouchableOpacity
          style={styles.addTraitButton}
          onPress={() => onAddTrait(newTrait)}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.addTraitGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Características seleccionadas */}
      {traits.length > 0 && (
        <View style={styles.selectedTraitsContainer}>
          <Text style={styles.subLabel}>Seleccionadas ({traits.length}):</Text>
          <View style={styles.selectedTraits}>
            {traits.map((trait, i) => (
              <View key={i} style={styles.selectedTrait}>
                <Text style={styles.selectedTraitText}>{trait}</Text>
                <TouchableOpacity
                  style={styles.removeTraitButton}
                  onPress={() => onRemoveTrait(trait)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  subLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 12,
    fontWeight: '500',
  },
  commonTraitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  commonTrait: {
    backgroundColor: '#16181d',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  commonTraitSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  commonTraitText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  commonTraitTextSelected: {
    color: '#6366f1',
    fontWeight: '700',
  },
  customTraitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  addTraitButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addTraitGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTraitsContainer: {
    marginTop: 8,
  },
  selectedTraits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedTrait: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  selectedTraitText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '600',
  },
  removeTraitButton: {
    padding: 2,
  },
});
