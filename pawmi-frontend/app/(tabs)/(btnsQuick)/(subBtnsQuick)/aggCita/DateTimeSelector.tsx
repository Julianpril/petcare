import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DateTimeSelectorProps {
  date: Date;
  time: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}

export function DateTimeSelector({ date, time, onDateChange, onTimeChange }: DateTimeSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeInput, setTimeInput] = useState('09:00');

  const isWeb = Platform.OS === 'web';

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (t: Date) => {
    return t.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      onTimeChange(selectedTime);
    }
  };

  const handleCalendarSelect = (day: any) => {
    const selectedDate = new Date(day.dateString);
    onDateChange(selectedDate);
    setShowCalendar(false);
  };

  const handleTimeInputChange = (text: string) => {
    setTimeInput(text);
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(text)) {
      const [hours, minutes] = text.split(':').map(Number);
      const newTime = new Date(time);
      newTime.setHours(hours, minutes);
      onTimeChange(newTime);
    }
  };

  return (
    <>
      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha *</Text>
        {isWeb ? (
          <>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Ionicons name="calendar" size={20} color="#8B5CF6" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            {showCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleCalendarSelect}
                  markedDates={{
                    [date.toISOString().split('T')[0]]: {
                      selected: true,
                      selectedColor: '#8B5CF6',
                    },
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: '#1a1a1a',
                    calendarBackground: '#1a1a1a',
                    textSectionTitleColor: '#fff',
                    selectedDayBackgroundColor: '#8B5CF6',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#8B5CF6',
                    dayTextColor: '#fff',
                    textDisabledColor: '#666',
                    monthTextColor: '#fff',
                    arrowColor: '#8B5CF6',
                  }}
                />
              </View>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#8B5CF6" />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </>
        )}
      </View>

      {/* Hora */}
      <View style={styles.section}>
        <Text style={styles.label}>Hora *</Text>
        {isWeb ? (
          <View style={styles.timeInputContainer}>
            <Ionicons name="time" size={20} color="#8B5CF6" />
            <TextInput
              style={styles.timeInput}
              value={timeInput}
              onChangeText={handleTimeInputChange}
              placeholder="09:00"
              placeholderTextColor="#666"
              maxLength={5}
            />
            <Text style={styles.timeHelper}>Formato: HH:MM (ej: 09:30)</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time" size={20} color="#8B5CF6" />
              <Text style={styles.dateText}>{formatTime(time)}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </>
        )}
      </View>
    </>
  );
}

export function getTimeString(time: Date, isWeb: boolean, timeInput: string): string {
  return isWeb 
    ? timeInput 
    : `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
  },
  timeInput: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  timeHelper: {
    color: '#666',
    fontSize: 12,
    position: 'absolute',
    bottom: -20,
    left: 32,
  },
});
