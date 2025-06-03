import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { CalendarComponentProps } from './interfaz';
import { getDotColor } from './utilsReordatorios';

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
    backgroundColor: '#122432',
    calendarBackground: '#1E2A38',
    textSectionTitleColor: '#EAEAEA',
    selectedDayBackgroundColor: '#47a9ff',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#ff6f61',
    dayTextColor: '#EAEAEA',
    textDisabledColor: '#555',
    dotColor: '#47a9ff',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#EAEAEA',
    monthTextColor: '#EAEAEA',
    indicatorColor: '#EAEAEA',
    textDayFontWeight: '600' as const,
    textMonthFontWeight: '700' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
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
    backgroundColor: '#1E2A38',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendar: {
    borderRadius: 8,
    backgroundColor: '#1E2A38',
  },
});

export default CalendarComponent;