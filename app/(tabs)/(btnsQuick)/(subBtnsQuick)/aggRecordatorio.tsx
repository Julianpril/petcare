import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';

export interface Pet {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string; traits: string[];
}

interface AggRecordatorioProps { visible: boolean; onClose: () => void; }

const categorias = [
  { id: 'vacuna', name: 'Vacuna', icon: 'shield', color: '#FF6B6B' },
  { id: 'desparasitacion', name: 'Desparasitación', icon: 'heart', color: '#4ECDC4' },
  { id: 'consulta', name: 'Consulta veterinaria', icon: 'user-check', color: '#45B7D1' },
  { id: 'peluqueria', name: 'Peluquería', icon: 'scissors', color: '#F9CA24' },
  { id: 'alimento', name: 'Compra de alimento', icon: 'shopping-bag', color: '#6C5CE7' },
  { id: 'paseo', name: 'Paseo', icon: 'map-pin', color: '#A0E7E5' },
  { id: 'otro', name: 'Otro', icon: 'more-horizontal', color: '#95A5A6' },
];

const AggRecordatorio: React.FC<AggRecordatorioProps> = ({ visible, onClose }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    petId: '', nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', categoria: ''
  });
  const [showCal, setShowCal] = useState({ start: false, end: false });

  useEffect(() => {
    if (!visible) return;
    fetch('https://mocki.io/v1/42b89a90-f013-4f30-a5db-759b0b33aab7')
      .then(r => r.json())
      .then(data => { setPets(data); setError(null); })
      .catch(() => setError('Error al cargar mascotas'))
      .finally(() => setLoading(false));
  }, [visible]);

  const reset = () => {
    setForm({ petId: '', nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', categoria: '' });
    setShowCal({ start: false, end: false });
  };

  const save = () => {
    const pet = pets.find(p => p.id === form.petId);
    const cat = categorias.find(c => c.id === form.categoria);
    alert(`✅ Recordatorio guardado!\n🐾 ${pet?.name}\n📝 ${form.nombre}\n📅 ${form.fechaInicio} - ${form.fechaFin}\n🏷️ ${cat?.name}`);
    reset(); onClose();
  };

  const Input = ({ label, icon, placeholder, value, onChange, multiline = false }: any) => (
    <View style={s.section}>
      <Text style={s.label}><Feather name={icon} size={16} color="#47a9ff" /> {label}:</Text>
      <TextInput
        style={[s.input, multiline && s.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#AAB4C0"
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
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
      <Text style={s.label}><Feather name="calendar" size={16} color="#47a9ff" /> {label}:</Text>
      <TouchableOpacity
        style={[s.input, s.dateInput]}
        onPress={() => setShowCal({ start: field === 'start', end: field === 'end' })}
      >
        <Feather name="calendar" size={20} color={value ? "#EAEAEA" : "#AAB4C0"} />
        <Text style={value ? s.dateText : s.placeholderText}>
          {value || `Seleccionar ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>
      {showCal[field] && (
        <Calendar
          onDayPress={day => {
            setForm(prev => ({ ...prev, [field === 'start' ? 'fechaInicio' : 'fechaFin']: day.dateString }));
            setShowCal({ start: false, end: false });
          }}
          theme={{
            backgroundColor: '#1E2A38', calendarBackground: '#1E2A38', selectedDayBackgroundColor: '#47a9ff',
            dayTextColor: '#EAEAEA', monthTextColor: '#EAEAEA', arrowColor: '#47a9ff'
          }}
          minDate={field === 'end' ? form.fechaInicio : new Date().toISOString().split('T')[0]}
          style={{ marginTop: 10, borderRadius: 12 }}
        />
      )}
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <View style={s.header}>
            <Text style={s.title}>Nuevo Recordatorio</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#EAEAEA" /></TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            <View style={s.section}>
              <Text style={s.label}><Feather name="heart" size={16} color="#47a9ff" /> Mascota:</Text>
              {loading ? (
                <View style={s.center}><ActivityIndicator color="#47a9ff" /><Text style={s.gray}>Cargando...</Text></View>
              ) : error ? (
                <View style={s.error}><Feather name="alert-circle" size={20} color="#FF6B6B" /><Text style={s.errorText}>{error}</Text></View>
              ) : (
                <ScrollView horizontal>
                  {pets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[s.petItem, pet.id === form.petId && s.petSelected]}
                      onPress={() => setForm(prev => ({ ...prev, petId: pet.id }))}
                    >
                      <Image source={{ uri: pet.imageUrl }} style={s.petImage} />
                      {pet.id === form.petId && <View style={s.badge}><Feather name="check" size={12} color="#fff" /></View>}
                      <Text style={[s.petName, pet.id === form.petId && { color: '#47a9ff' }]}>{pet.name}</Text>
                      <Text style={s.petBreed}>{pet.breed}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <Input label="Nombre" icon="edit-3" placeholder="Ej: Vacuna antirrábica" value={form.nombre} onChange={(v: string) => setForm(prev => ({ ...prev, nombre: v }))} />
            <Input label="Descripción" icon="file-text" placeholder="Detalles..." value={form.descripcion} onChange={(v: string) => setForm(prev => ({ ...prev, descripcion: v }))} multiline />
            <DatePicker label="Fecha inicio" value={form.fechaInicio} field="start" />
            <DatePicker label="Fecha fin" value={form.fechaFin} field="end" />

            <View style={s.section}>
              <Text style={s.label}><Feather name="tag" size={16} color="#47a9ff" /> Categoría:</Text>
              <View style={s.chipGrid}>
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[s.chip, { borderColor: cat.color }, cat.id === form.categoria && { backgroundColor: '#47a9ff' }]}
                    onPress={() => setForm(prev => ({ ...prev, categoria: cat.id }))}
                  >
                    <Feather name={cat.icon as any} size={16} color={cat.id === form.categoria ? '#fff' : cat.color} />
                    <Text style={[s.chipText, { color: cat.id === form.categoria ? '#fff' : cat.color }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={s.buttons}>
            <TouchableOpacity style={[s.btn, { backgroundColor: '#FF6B6B' }]} onPress={() => { reset(); onClose(); }}>
              <Feather name="x" size={18} color="#fff" /><Text style={s.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, { backgroundColor: form.petId && form.nombre && form.categoria && form.fechaInicio ? '#47a9ff' : '#555' }]}
              onPress={save}
              disabled={!(form.petId && form.nombre && form.categoria && form.fechaInicio)}
            >
              <Feather name="check" size={18} color="#fff" /><Text style={s.btnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18,36,50,0.8)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '95%', maxHeight: '90%', backgroundColor: '#122432', borderRadius: 20, elevation: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E2A38' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#EAEAEA' },
  section: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10, color: '#EAEAEA', fontWeight: '600' },
  input: { height: 50, borderWidth: 1.5, borderColor: '#1E2A38', borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#1E2A38', color: '#EAEAEA', fontSize: 16 },
  textArea: { height: 80, paddingTop: 12 },
  dateInput: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: '#EAEAEA', marginLeft: 12, fontSize: 16 },
  placeholderText: { color: '#AAB4C0', marginLeft: 12, fontSize: 16 },
  center: { alignItems: 'center', paddingVertical: 20 },
  gray: { color: '#AAB4C0', marginTop: 10 },
  error: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 8, borderWidth: 1, borderColor: '#FF6B6B' },
  errorText: { color: '#FF6B6B', marginLeft: 10 },
  petItem: { alignItems: 'center', marginRight: 16, padding: 8, borderRadius: 12 },
  petSelected: { backgroundColor: 'rgba(71,169,255,0.1)' },
  petImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'transparent' },
  badge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#47a9ff', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#122432' },
  petName: { marginTop: 8, fontSize: 14, color: '#EAEAEA', fontWeight: '500' },
  petBreed: { fontSize: 12, color: '#AAB4C0', marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, minWidth: 100 },
  chipText: { fontSize: 14, marginLeft: 6, fontWeight: '500' },
  buttons: { flexDirection: 'row', padding: 20, gap: 12 },
  btn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default AggRecordatorio;  