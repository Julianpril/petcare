import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateTimeSelectorProps {
  selectedDate: Date;
  selectedTime: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  onDateChange: (event: any, date?: Date) => void;
  onTimeChange: (event: any, time?: Date) => void;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
}

export function DateTimeSelector({
  selectedDate,
  selectedTime,
  showDatePicker,
  showTimePicker,
  onDateChange,
  onTimeChange,
  onShowDatePicker,
  onShowTimePicker,
}: DateTimeSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fecha y hora</Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity style={styles.dateTimeButton} onPress={onShowDatePicker}>
          <Ionicons name="calendar" size={20} color="#667eea" />
          <Text style={styles.dateTimeText}>
            {selectedDate.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateTimeButton} onPress={onShowTimePicker}>
          <Ionicons name="time" size={20} color="#667eea" />
          <Text style={styles.dateTimeText}>
            {selectedTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  dateTimeText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
});
