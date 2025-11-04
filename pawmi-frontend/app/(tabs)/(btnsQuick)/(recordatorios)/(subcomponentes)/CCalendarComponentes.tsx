import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import type { CalendarComponentProps } from '../../../../../lib/recordatorios/types';
import { getDotColor } from '../../../../../lib/recordatorios/utils';

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  onDateSelect,
  appointments
}) => {
  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};

    const appointmentsByDate: { [key: string]: any[] } = {};
    
    appointments.forEach(appointment => {
      if (!appointmentsByDate[appointment.date]) {
        appointmentsByDate[appointment.date] = [];
      }
      appointmentsByDate[appointment.date].push(appointment);
    });

    Object.keys(appointmentsByDate).forEach(date => {
      const dayAppointments = appointmentsByDate[date];
      
      if (dayAppointments.length === 1) {
        marks[date] = {
          marked: true,
          dotColor: getDotColor(dayAppointments[0].type),
        };
      } else {
        const dots = dayAppointments.slice(0, 3).map(appointment => ({
          color: getDotColor(appointment.type),
        }));
        
        marks[date] = {
          dots: dots,
        };
      }
    });
    if (selectedDate) {
      if (marks[selectedDate]) {
        marks[selectedDate] = {
          ...marks[selectedDate],
          selected: true,
          selectedColor: '#47a9ff',
          selectedTextColor: '#FFFFFF',
        };
      } else {
        marks[selectedDate] = {
          selected: true,
          selectedColor: '#47a9ff',
          selectedTextColor: '#FFFFFF',
        };
      }
    }

    return marks;
  }, [selectedDate, appointments]);

  const handleDayPress = useCallback((day: DateData) => {
    onDateSelect(day.dateString);
  }, [onDateSelect]);

  const theme = {
    backgroundColor: '#0a0a0b',
    calendarBackground: '#16181d',
    textSectionTitleColor: '#f8fafc',
    selectedDayBackgroundColor: '#6366f1',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#8b5cf6',
    dayTextColor: '#f8fafc',
    textDisabledColor: '#475569',
    dotColor: '#6366f1',
    selectedDotColor: '#ffffff',
    arrowColor: '#f8fafc',
    monthTextColor: '#f8fafc',
    indicatorColor: '#6366f1',
    textDayFontWeight: '600' as const,
    textMonthFontWeight: '800' as const,
    textDayHeaderFontWeight: '700' as const,
    textDayFontSize: 15,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 13,
    dotStyle: {
      marginTop: 2,
    },
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
        markingType={'multi-dot'} 
        dayComponent={undefined} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#16181d',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  calendar: {
    borderRadius: 16,
    backgroundColor: '#16181d',
  },
});

export default CalendarComponent;