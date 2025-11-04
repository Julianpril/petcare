import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../lib/auth-context';

export interface Pet {
  id: string;
  name: string;
  breed?: string;
  imageUrl: string;
  age?: string;
  weight?: string;
  traits?: string[];
}

interface AggRecordatorioProps { visible: boolean; onClose: () => void; onSaved?: () => void; }

const categorias = [
  { id: 'vacuna', name: 'Vacuna', icon: 'shield', color: '#f093fb' },
  { id: 'desparasitacion', name: 'Desparasitación', icon: 'heart', color: '#43e97b' },
  { id: 'consulta', name: 'Consulta veterinaria', icon: 'user-check', color: '#667eea' },
  { id: 'peluqueria', name: 'Peluquería', icon: 'scissors', color: '#fa709a' },
  { id: 'alimento', name: 'Compra de alimento', icon: 'shopping-bag', color: '#8b5cf6' },
  { id: 'paseo', name: 'Paseo', icon: 'map-pin', color: '#4facfe' },
  { id: 'otro', name: 'Otro', icon: 'more-horizontal', color: '#94a3b8' },
];

const AggRecordatorio: React.FC<AggRecordatorioProps> = ({ visible, onClose, onSaved }) => {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
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

      await apiClient.createReminder({
        pet_id: form.petId,
        category: form.categoria,
        title: form.nombre.trim(),
        description: form.descripcion.trim() || null,
        start_date: form.fechaInicio,
        end_date: form.fechaFin || null,
        time: null,
      });

      Alert.alert(
        'Recordatorio guardado',
        `🐾 ${pet?.name ?? 'Mascota'}\n📝 ${form.nombre}\n📅 ${form.fechaInicio}${
          form.fechaFin ? ` - ${form.fechaFin}` : ''
        }\n🏷️ ${cat?.name ?? ''}`,
        [{ text: 'OK' }]
      );

      reset();
      onClose();
      onSaved?.();
    } catch (err: unknown) {
      console.error('Error guardando recordatorio:', err);
      Alert.alert('Error', 'No se pudo guardar el recordatorio.');
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ label, icon, placeholder, value, onChange, multiline = false }: any) => (
    <View style={s.section}>
      <View style={s.labelContainer}>
        <Ionicons name={icon} size={18} color="#6366f1" />
        <Text style={s.label}>{label}</Text>
      </View>
      <View style={s.inputContainer}>
        <TextInput
          style={[s.input, multiline && s.textArea]}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  const DatePicker = ({
    label,
    value,
    field,
  }: {
    label: string;
    value: string;
    field: 'start' | 'end';
  }) => (
    <View style={s.section}>
      <View style={s.labelContainer}>
        <Ionicons name="calendar-outline" size={18} color="#6366f1" />
        <Text style={s.label}>{label}</Text>
      </View>
      <TouchableOpacity
        style={s.dateButton}
        onPress={() => setShowCal({ start: field === 'start', end: field === 'end' })}
      >
        <Ionicons name="calendar" size={20} color={value ? "#f8fafc" : "#64748b"} />
        <Text style={value ? s.dateText : s.placeholderText}>
          {value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : `Seleccionar ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>
      {showCal[field] && (
        <View style={s.calendarContainer}>
          <Calendar
            onDayPress={day => {
              setForm(prev => ({ ...prev, [field === 'start' ? 'fechaInicio' : 'fechaFin']: day.dateString }));
              setShowCal({ start: false, end: false });
            }}
            theme={{
              backgroundColor: '#16181d',
              calendarBackground: '#16181d',
              selectedDayBackgroundColor: '#6366f1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#8b5cf6',
              dayTextColor: '#f8fafc',
              textDisabledColor: '#475569',
              dotColor: '#6366f1',
              arrowColor: '#f8fafc',
              monthTextColor: '#f8fafc',
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
            }}
            minDate={field === 'end' ? form.fechaInicio : new Date().toISOString().split('T')[0]}
            style={s.calendar}
          />
        </View>
      )}
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Header con gradiente */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.header}
          >
            <View style={s.headerContent}>
              <Ionicons name="add-circle" size={28} color="#ffffff" />
              <Text style={s.title}>Nuevo Recordatorio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sección de mascotas */}
            <View style={s.section}>
              <View style={s.labelContainer}>
                <Ionicons name="paw" size={18} color="#6366f1" />
                <Text style={s.label}>Selecciona tu mascota</Text>
              </View>
              {loading ? (
                <View style={s.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text style={s.loadingText}>Cargando mascotas...</Text>
                </View>
              ) : error ? (
                <View style={s.errorContainer}>
                  <Ionicons name="warning" size={24} color="#f59e0b" />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petsScroll}>
                  {pets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[s.petCard, pet.id === form.petId && s.petCardSelected]}
                      onPress={() => setForm(prev => ({ ...prev, petId: pet.id }))}
                      activeOpacity={0.8}
                    >
                      <View style={s.petImageContainer}>
                        <Image source={{ uri: pet.imageUrl }} style={s.petImage} />
                        {pet.id === form.petId && (
                          <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={s.selectedBadge}
                          >
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                          </LinearGradient>
                        )}
                      </View>
                      <Text style={[s.petName, pet.id === form.petId && s.petNameSelected]} numberOfLines={1}>
                        {pet.name}
                      </Text>
                      <Text style={s.petBreed} numberOfLines={1}>{pet.breed}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Input de nombre */}
            <Input 
              label="Título del recordatorio" 
              icon="create-outline" 
              placeholder="Ej: Vacuna antirrábica" 
              value={form.nombre} 
              onChange={(v: string) => setForm(prev => ({ ...prev, nombre: v }))} 
            />

            {/* Input de descripción */}
            <Input 
              label="Descripción (opcional)" 
              icon="document-text-outline" 
              placeholder="Añade detalles o notas importantes..." 
              value={form.descripcion} 
              onChange={(v: string) => setForm(prev => ({ ...prev, descripcion: v }))} 
              multiline 
            />

            {/* Fechas */}
            <DatePicker label="Fecha de inicio" value={form.fechaInicio} field="start" />
            <DatePicker label="Fecha de fin (opcional)" value={form.fechaFin} field="end" />

            {/* Categorías */}
            <View style={s.section}>
              <View style={s.labelContainer}>
                <Ionicons name="pricetag" size={18} color="#6366f1" />
                <Text style={s.label}>Categoría</Text>
              </View>
              <View style={s.categoriesGrid}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.categoryChip,
                      form.categoria === cat.id && s.categoryChipSelected
                    ]}
                    onPress={() => setForm(prev => ({ ...prev, categoria: cat.id }))}
                    activeOpacity={0.7}
                  >
                    <View style={[s.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Feather name={cat.icon as any} size={18} color={form.categoria === cat.id ? '#ffffff' : cat.color} />
                    </View>
                    <Text style={[
                      s.categoryText,
                      form.categoria === cat.id && s.categoryTextSelected
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={s.footer}>
            <TouchableOpacity 
              style={s.cancelButton} 
              onPress={() => { reset(); onClose(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={20} color="#f8fafc" />
              <Text style={s.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                s.saveButton,
                (!(form.petId && form.nombre && form.categoria && form.fechaInicio) || saving) && s.saveButtonDisabled
              ]}
              onPress={save}
              disabled={!(form.petId && form.nombre && form.categoria && form.fechaInicio) || saving}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  (form.petId && form.nombre && form.categoria && form.fechaInicio && !saving)
                    ? ['#667eea', '#764ba2']
                    : ['#475569', '#334155']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.saveButtonGradient}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={s.saveButtonText}>Guardando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                    <Text style={s.saveButtonText}>Guardar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.2,
  },
  inputContainer: {
    backgroundColor: '#0a0a0b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0a0a0b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  calendarContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  calendar: {
    borderRadius: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  petsScroll: {
    gap: 16,
    paddingVertical: 4,
  },
  petCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#0a0a0b',
    borderWidth: 2,
    borderColor: 'transparent',
    width: 110,
  },
  petCardSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  petImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  petImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16181d',
  },
  petName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 4,
  },
  petNameSelected: {
    color: '#6366f1',
  },
  petBreed: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#0a0a0b',
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 140,
  },
  categoryChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#16181d',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1f2937',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AggRecordatorio;  