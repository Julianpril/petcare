import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../lib/auth-context';
import { useReminderNotifications } from '../../../../lib/notifications/useReminderNotifications';
import { CategorySelector } from './aggRecordatorio/CategorySelector';
import { DatePicker } from './aggRecordatorio/DatePicker';
import { FormInput } from './aggRecordatorio/FormInput';
import { ModalFooter } from './aggRecordatorio/ModalFooter';
import { ModalHeader } from './aggRecordatorio/ModalHeader';
import { PetSelector } from './aggRecordatorio/PetSelector';
import { categorias, type Pet, type ReminderForm } from './aggRecordatorio/types';

interface AggRecordatorioProps { 
  visible: boolean; 
  onClose: () => void; 
  onSaved?: () => void; 
}

const AggRecordatorio: React.FC<AggRecordatorioProps> = ({ visible, onClose, onSaved }) => {
  const { currentUser } = useAuth();
  const { syncReminderNotification, isReady: notificationsReady } = useReminderNotifications();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ReminderForm>({
    petId: '', nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', categoria: ''
  });
  const [showCal, setShowCal] = useState({ start: false, end: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let isMounted = true;

    const loadPets = async () => {
      if (!currentUser) {
        if (!isMounted) return;
        setPets([]);
        setLoading(false);
        setError('Debes iniciar sesión.');
        return;
      }

      setLoading(true);

      try {
        const data = await apiClient.getPets();

        if (!isMounted) return;

        const mapped: Pet[] = (data ?? []).map((pet: any) => ({
          id: pet.id,
          name: pet.name ?? 'Mascota',
          breed: pet.breed ?? 'Sin raza',
          imageUrl: pet.image_url || 'https://placehold.co/200x200?text=Pawmi',
        }));

        setPets(mapped);
        setError(null);
      } catch (err: unknown) {
        console.error('Error cargando mascotas:', err);
        if (isMounted) {
          setError('Error al cargar tus mascotas');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPets();

    return () => {
      isMounted = false;
    };
  }, [visible, currentUser?.id]);

  const reset = () => {
    setForm({ petId: '', nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', categoria: '' });
    setShowCal({ start: false, end: false });
  };

  const save = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para crear recordatorios.');
      return;
    }

    if (!form.petId || !form.nombre || !form.categoria || !form.fechaInicio) {
      Alert.alert('Campos requeridos', 'Completa los campos obligatorios.');
      return;
    }

    const pet = pets.find(p => p.id === form.petId);
    const cat = categorias.find(c => c.id === form.categoria);
    try {
      setSaving(true);

      const reminderData = await apiClient.createReminder({
        pet_id: form.petId,
        category: form.categoria,
        title: form.nombre.trim(),
        description: form.descripcion.trim() || null,
        start_date: form.fechaInicio,
        end_date: form.fechaFin || null,
        time: null,
      });

      // En web: cerrar automaticamente y mostrar mensaje
      if (Platform.OS === 'web') {
        Alert.alert(
          '✅ Recordatorio creado',
          `${pet?.name ?? 'Mascota'} - ${form.nombre}\n📅 ${form.fechaInicio}${
            form.fechaFin ? ` → ${form.fechaFin}` : ''
          }\n${cat?.name ?? ''}`,
          [{ text: 'OK' }]
        );
        reset();
        onClose();
        onSaved?.();
      } 
      // En movil: preguntar si quiere programar notificacion
      else if (notificationsReady && reminderData) {
        Alert.alert(
          'Recordatorio guardado',
          `${pet?.name ?? 'Mascota'}\n${form.nombre}\n${form.fechaInicio}\n\nDeseas recibir una notificacion para este recordatorio?`,
          [
            {
              text: 'No, gracias',
              style: 'cancel',
              onPress: () => {
                reset();
                onClose();
                onSaved?.();
              }
            },
            {
              text: 'Si, notificarme',
              onPress: async () => {
                try {
                  await syncReminderNotification({
                    id: reminderData.id,
                    title: form.nombre,
                    start_date: form.fechaInicio,
                    time: null,
                    category: form.categoria,
                    pet: { name: pet?.name || 'Mascota' },
                    description: form.descripcion,
                  });
                  Alert.alert('Notificacion programada', 'Te avisaremos cuando llegue el momento');
                } catch (error) {
                  console.error('Error programando notificacion:', error);
                }
                reset();
                onClose();
                onSaved?.();
              }
            }
          ]
        );
      } else {
        // Si no hay notificaciones disponibles, solo mostrar confirmacion
        Alert.alert(
          'Recordatorio guardado',
          `${pet?.name ?? 'Mascota'}\n${form.nombre}\n${form.fechaInicio}${
            form.fechaFin ? ` - ${form.fechaFin}` : ''
          }\n${cat?.name ?? ''}`,
          [{ 
            text: 'OK',
            onPress: () => {
              reset();
              onClose();
              onSaved?.();
            }
          }]
        );
      }
    } catch (err: unknown) {
      console.error('Error guardando recordatorio:', err);
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = !!(form.petId && form.nombre && form.categoria && form.fechaInicio);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ModalHeader onClose={onClose} />

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            <PetSelector
              pets={pets}
              selectedPetId={form.petId}
              loading={loading}
              error={error}
              onSelectPet={(petId) => setForm(prev => ({ ...prev, petId }))}
            />

            <FormInput
              label="Titulo del recordatorio"
              icon="create-outline"
              placeholder="Ej: Vacuna antirrabica"
              value={form.nombre}
              onChange={(v) => setForm(prev => ({ ...prev, nombre: v }))}
            />

            <FormInput
              label="Descripcion (opcional)"
              icon="document-text-outline"
              placeholder="Anade detalles o notas importantes..."
              value={form.descripcion}
              onChange={(v) => setForm(prev => ({ ...prev, descripcion: v }))}
              multiline
            />

            <DatePicker
              label="Fecha de inicio"
              value={form.fechaInicio}
              field="start"
              showCalendar={showCal.start}
              onPress={() => setShowCal({ start: true, end: false })}
              onDayPress={(date) => {
                setForm(prev => ({ ...prev, fechaInicio: date }));
                setShowCal({ start: false, end: false });
              }}
            />

            <DatePicker
              label="Fecha de fin (opcional)"
              value={form.fechaFin}
              field="end"
              showCalendar={showCal.end}
              minDate={form.fechaInicio}
              onPress={() => setShowCal({ start: false, end: true })}
              onDayPress={(date) => {
                setForm(prev => ({ ...prev, fechaFin: date }));
                setShowCal({ start: false, end: false });
              }}
            />

            <CategorySelector
              categories={categorias}
              selectedCategory={form.categoria}
              onSelectCategory={(categoria) => setForm(prev => ({ ...prev, categoria }))}
            />
          </ScrollView>

          <ModalFooter
            isValid={isFormValid}
            saving={saving}
            onCancel={() => { reset(); onClose(); }}
            onSave={save}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 11, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '92%',
    backgroundColor: '#16181d',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
});

export default AggRecordatorio;
