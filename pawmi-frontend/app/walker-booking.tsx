import { apiClient } from '@/lib/api-client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { BookingHeader } from './walker-booking/BookingHeader';
import { BottomBar } from './walker-booking/BottomBar';
import { DateTimeSelector } from './walker-booking/DateTimeSelector';
import { DurationSelector } from './walker-booking/DurationSelector';
import { NotesInput } from './walker-booking/NotesInput';
import { PetSelector } from './walker-booking/PetSelector';
import { PriceSummary } from './walker-booking/PriceSummary';
import { ServiceSelector } from './walker-booking/ServiceSelector';
import { ErrorState, LoadingState } from './walker-booking/States';
import { SERVICE_OPTIONS, type Pet, type Walker } from './walker-booking/types';

export default function WalkerBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const walkerId = params.walkerId as string;

  const [walker, setWalker] = useState<Walker | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadData();
  }, [walkerId]);

  useEffect(() => {
    // Auto-calculate duration based on service
    const service = SERVICE_OPTIONS.find((s) => s.value === selectedService);
    if (service) {
      setDuration(service.duration);
    }
  }, [selectedService]);

  const loadData = async () => {
    try {
      setLoading(true);

      const walkerData = await apiClient.getWalkerProfile(walkerId);
      setWalker(walkerData);

      const petsData = await apiClient.getPets();
      setPets(petsData);

      if (petsData.length > 0) {
        setSelectedPet(petsData[0].id);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!walker) return 0;
    return walker.hourly_rate * duration;
  };

  const handleSubmit = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Debes seleccionar una mascota');
      return;
    }
    if (!selectedService) {
      Alert.alert('Error', 'Debes seleccionar un servicio');
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());

    if (scheduledDateTime <= new Date()) {
      Alert.alert('Error', 'La fecha debe ser en el futuro');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        walker_id: walkerId,
        pet_id: selectedPet,
        service_type: selectedService,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_hours: duration,
        notes: notes.trim() || undefined,
      };

      await apiClient.createWalkerBooking(bookingData);

      Alert.alert(
        '�Reserva creada!',
        'Tu solicitud ha sido enviada al paseador. Te notificaremos cuando sea confirmada.',
        [
          {
            text: 'Ver mis reservas',
            onPress: () => router.push('/my-bookings' as any),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', error.detail || 'No se pudo crear la reserva. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!walker) {
    return <ErrorState onBack={() => router.back()} />;
  }

  const total = calculateTotal();

  return (
    <View style={styles.container}>
      <BookingHeader walker={walker} onBack={() => router.back()} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <PetSelector
            pets={pets}
            selectedPetId={selectedPet}
            onSelectPet={setSelectedPet}
            onAddPet={() => router.push('/(tabs)/index' as any)}
          />

          <ServiceSelector
            availableServices={walker.services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />

          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            showDatePicker={showDatePicker}
            showTimePicker={showTimePicker}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
            onShowDatePicker={() => setShowDatePicker(true)}
            onShowTimePicker={() => setShowTimePicker(true)}
          />

          <DurationSelector
            duration={duration}
            onDecrease={() => setDuration(Math.max(1, duration - 1))}
            onIncrease={() => setDuration(duration + 1)}
          />

          <NotesInput value={notes} onChangeText={setNotes} />

          <PriceSummary hourlyRate={walker.hourly_rate} duration={duration} total={total} />
        </View>
      </ScrollView>

      <BottomBar
        total={total}
        duration={duration}
        submitting={submitting}
        disabled={pets.length === 0}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 120,
  },
});
