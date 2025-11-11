// components/AddReminderNotification.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotifications } from '../lib/notifications/notification-context';

interface AddReminderNotificationProps {
  petName: string;
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export default function AddReminderNotification({
  petName,
  visible,
  onClose,
  onAdded,
}: AddReminderNotificationProps) {
  const { scheduleReminder, permissionStatus } = useNotifications();
  const [reminderType, setReminderType] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSchedule = async () => {
    if (!reminderType.trim()) {
      Alert.alert('Error', 'Por favor ingresa el tipo de recordatorio');
      return;
    }

    if (!permissionStatus?.granted) {
      Alert.alert(
        'Permisos requeridos',
        'Debes activar las notificaciones primero',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const notificationId = await scheduleReminder(
        petName,
        reminderType,
        selectedDate
      );

      if (notificationId) {
        Alert.alert(
          '✅ Recordatorio programado',
          `Se te notificará el ${selectedDate.toLocaleDateString()} a las ${selectedDate.toLocaleTimeString()}`
        );
        setReminderType('');
        setSelectedDate(new Date());
        onAdded?.();
        onClose();
      } else {
        Alert.alert('Error', 'No se pudo programar el recordatorio');
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Ocurrió un error al programar el recordatorio');
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
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours());
      newDate.setMinutes(time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📅 Agregar Recordatorio</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Pet Name */}
          <View style={styles.petInfo}>
            <Ionicons name="paw" size={20} color="#8B5CF6" />
            <Text style={styles.petName}>{petName}</Text>
          </View>

          {/* Reminder Type Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Recordatorio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Medicamento, Vacuna, Baño, etc."
              placeholderTextColor="#666"
              value={reminderType}
              onChangeText={setReminderType}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#8B5CF6" />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date/Time Pickers */}
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
              value={selectedDate}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSchedule}
            >
              <Ionicons name="notifications" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Programar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a1f',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a32',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    marginBottom: 20,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a32',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3a3a42',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2a2a32',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3a3a42',
  },
  dateText: {
    fontSize: 16,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a32',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
