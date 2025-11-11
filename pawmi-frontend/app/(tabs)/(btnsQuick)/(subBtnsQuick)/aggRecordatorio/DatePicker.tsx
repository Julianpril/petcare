import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DatePickerProps {
  label: string;
  value: string;
  field: 'start' | 'end';
  showCalendar: boolean;
  minDate?: string;
  onPress: () => void;
  onDayPress: (date: string) => void;
}

export function DatePicker({ label, value, field, showCalendar, minDate, onPress, onDayPress }: DatePickerProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <Ionicons name="calendar-outline" size={18} color="#6366f1" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TouchableOpacity style={styles.dateButton} onPress={onPress}>
        <Ionicons name="calendar" size={20} color={value ? "#f8fafc" : "#64748b"} />
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : `Seleccionar ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={day => onDayPress(day.dateString)}
            theme={{
              backgroundColor: '#16181d',
              calendarBackground: '#16181d',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#8b5cf6',
              dayTextColor: '#f8fafc',
              textDisabledColor: '#475569',
              dotColor: '#6366f1',
              arrowColor: '#f8fafc',
              monthTextColor: '#f8fafc',
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
            }}
            minDate={minDate || new Date().toISOString().split('T')[0]}
            style={styles.calendar}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0a0a0b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  calendarContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  calendar: {
    borderRadius: 16,
  },
});
