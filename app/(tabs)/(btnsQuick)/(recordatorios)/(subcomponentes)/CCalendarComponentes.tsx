import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { CalendarComponentProps } from './interfaz';
import { getTypeColor } from './utilsReordatorios';

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  onDateSelect,
  appointments
}) => {
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    appointments.forEach(appointment => {
      marks[appointment.date] = {
        marked: true,
        dotColor: getTypeColor(appointment.type),
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#3E6D9C',
      };
    }

    return marks;
  }, [selectedDate, appointments]);

  const handleDayPress = useCallback((day: DateData) => {
    onDateSelect(day.dateString);
  }, [onDateSelect]);

  const theme = {
    backgroundColor: '#122432',
    calendarBackground: '#1B2A3A',
    textSectionTitleColor: '#EAEAEA',
    selectedDayBackgroundColor: '#3E6D9C',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#FF9800',
    dayTextColor: '#EAEAEA',
    textDisabledColor: '#555',
    dotColor: '#FF9800',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#EAEAEA',
    monthTextColor: '#EAEAEA',
    indicatorColor: '#EAEAEA',
    textDayFontWeight: '600' as const,
    textMonthFontWeight: '700' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14
  };

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={theme}
        style={styles.calendar}
        hideExtraDays={true}
        firstDay={1}
        showWeekNumbers={false}
        disableMonthChange={false}
        enableSwipeMonths={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#1B2A3A',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
  },
});

export default CalendarComponent;