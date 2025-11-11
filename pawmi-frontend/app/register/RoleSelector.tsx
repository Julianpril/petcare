import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RoleOption, UserRole } from './types';
import { ROLE_OPTIONS } from './types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRole, onRoleChange, disabled }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué tipo de cuenta deseas?</Text>
      <View style={styles.optionsContainer}>
        {ROLE_OPTIONS.map((role: RoleOption) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.option,
              selectedRole === role.value && styles.optionSelected,
              selectedRole === role.value && { borderColor: role.color },
            ]}
            onPress={() => onRoleChange(role.value)}
            disabled={disabled}
          >
            <View
              style={[
                styles.iconContainer,
                selectedRole === role.value && { backgroundColor: role.color },
              ]}
            >
              <Ionicons
                name={role.icon}
                size={24}
                color={selectedRole === role.value ? '#fff' : '#AAB4C0'}
              />
            </View>
            <Text
              style={[styles.label, selectedRole === role.value && styles.labelSelected]}
            >
              {role.label}
            </Text>
            <Text style={styles.description}>{role.description}</Text>
            {selectedRole === role.value && (
              <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  option: {
    flex: 1,
    backgroundColor: '#232931',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A3340',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  optionSelected: {
    borderWidth: 2,
    backgroundColor: '#1A1F26',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A3340',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AAB4C0',
    marginBottom: 4,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
