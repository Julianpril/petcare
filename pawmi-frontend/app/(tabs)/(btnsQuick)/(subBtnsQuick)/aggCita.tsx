import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../lib/auth-context';
import { useReminderNotifications } from '../../../../lib/notifications/useReminderNotifications';
import { AppointmentHeader } from './aggCita/AppointmentHeader';
import { DateTimeSelector } from './aggCita/DateTimeSelector';
import { FormInputs } from './aggCita/FormInputs';
import { PetSelector } from './aggCita/PetSelector';
import { SubmitButton } from './aggCita/SubmitButton';
import type { AppointmentForm, Pet } from './aggCita/types';

interface AggCitaProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const AggCita: React.FC<AggCitaProps> = ({ visible, onClose, onSaved }) => {
  const { currentUser } = useAuth();
  const { syncReminderNotification, isReady: notificationsReady } = useReminderNotifications();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<AppointmentForm>({
    petId: '',
    title: '',
    vetName: '',
    location: '',
    notes: '',
    date: new Date(),
    time: new Date(),
  });

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!visible) return;

    const loadPets = async () => {
      if (!currentUser) {
        setPets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient.getPets();
        const mapped: Pet[] = (data ?? []).map((pet: any) => ({
          id: pet.id,
          name: pet.name ?? 'Mascota',
          breed: pet.breed ?? 'Sin raza',
          imageUrl: pet.image_url || 'https://placehold.co/200x200?text=Pawmi',
        }));
        setPets(mapped);
      } catch (err) {
        console.error('Error cargando mascotas:', err);
        Alert.alert('Error', 'No se pudieron cargar tus mascotas');
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, [visible, currentUser?.id]);

  const reset = () => {
    setForm({
      petId: '',
      title: '',
      vetName: '',
      location: '',
      notes: '',
      date: new Date(),
      time: new Date(),
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTimeString = () => {
    return `${form.time.getHours().toString().padStart(2, '0')}:${form.time.getMinutes().toString().padStart(2, '0')}`;
  };

  const save = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para crear citas.');
      return;
    }

    if (!form.petId || !form.title) {
      Alert.alert('Campos requeridos', 'Selecciona una mascota y escribe el motivo de la cita.');
      return;
    }

    const pet = pets.find(p => p.id === form.petId);

    try {
      setSaving(true);

      const dateStr = `${form.date.getFullYear()}-${String(form.date.getMonth() + 1).padStart(2, '0')}-${String(form.date.getDate()).padStart(2, '0')}`;
      const timeStr = getTimeString();

      let description = '';
      if (form.vetName) description += `Veterinario: ${form.vetName}\n`;
      if (form.location) description += `Ubicación: ${form.location}\n`;
      if (form.notes) description += `Notas: ${form.notes}`;

      console.log(' Datos de la cita:', {
        pet_id: form.petId,
        user_id: currentUser?.id,
        category: 'consulta',
        title: form.title.trim(),
        description: description.trim() || null,
        start_date: dateStr,
        end_date: null,
        time: timeStr,
      });

      const appointmentData = await apiClient.createReminder({
        pet_id: form.petId,
        user_id: currentUser?.id,
        category: 'consulta',
        title: form.title.trim(),
        description: description.trim() || null,
        start_date: dateStr,
        end_date: null,
        time: timeStr,
      });

      if (Platform.OS !== 'web' && notificationsReady && appointmentData) {
        Alert.alert(
          ' Cita guardada',
          ` ${pet?.name ?? 'Mascota'}\n ${form.title}\n ${formatDate(form.date)}\n ${timeStr}\n\n¿Deseas recibir una notificación para esta cita?`,
          [
            {
              text: 'No, gracias',
              style: 'cancel',
              onPress: () => {
                reset();
                onClose();
                onSaved?.();
              },
            },
            {
              text: ' Sí, notificarme',
              onPress: async () => {
                try {
                  await syncReminderNotification({
                    id: appointmentData.id,
                    title: form.title,
                    start_date: dateStr,
                    time: timeStr,
                    category: 'consulta',
                    pet: { name: pet?.name || 'Mascota' },
                    description: description,
                  });
                  console.log(' Notificación programada para la cita');
                } catch (error) {
                  console.error(' Error programando notificación:', error);
                }
                reset();
                onClose();
                onSaved?.();
              },
            },
          ]
        );
      } else {
        Alert.alert(' Cita guardada', `La cita para ${pet?.name} se ha registrado correctamente en ${timeStr}.`);
        reset();
        onClose();
        onSaved?.();
      }
    } catch (err) {
      console.error('Error guardando cita:', err);
      Alert.alert('Error', 'No se pudo guardar la cita. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <AppointmentHeader onClose={onClose} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>Mascota *</Text>
              <PetSelector
                pets={pets}
                selectedPetId={form.petId}
                onSelectPet={(petId) => setForm({ ...form, petId })}
                loading={loading}
              />
            </View>

            <FormInputs
              title={form.title}
              vetName={form.vetName}
              location={form.location}
              notes={form.notes}
              onTitleChange={(text) => setForm({ ...form, title: text })}
              onVetNameChange={(text) => setForm({ ...form, vetName: text })}
              onLocationChange={(text) => setForm({ ...form, location: text })}
              onNotesChange={(text) => setForm({ ...form, notes: text })}
            />

            <DateTimeSelector
              date={form.date}
              time={form.time}
              onDateChange={(date) => setForm({ ...form, date })}
              onTimeChange={(time) => setForm({ ...form, time })}
            />

            <SubmitButton onPress={save} loading={saving} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default AggCita;
