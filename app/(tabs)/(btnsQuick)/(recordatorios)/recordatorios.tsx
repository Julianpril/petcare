import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import CalendarComponent from './(subcomponentes)/CCalendarComponentes';
import AppointmentsList from './(subcomponentes)/Listas';
import AddButton from './../../../../components/AddButton'
import AggRecordatorio from '../(subBtnsQuick)/aggRecordatorio';
import { appointments } from './(subcomponentes)/Datos';

export default function Recordatorios() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Citas & Recordatorios</Text>

      <CalendarComponent
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        appointments={appointments}
      />

      <AppointmentsList
        selectedDate={selectedDate}
        appointments={appointments}
      />

      <AddButton onPress={handleOpenModal} />

      <AggRecordatorio
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122432',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EAEAEA',
    textAlign: 'center',
    marginVertical: 20,
    marginTop: 40,
  },
});