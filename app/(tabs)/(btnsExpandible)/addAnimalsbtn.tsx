import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

type Pet = { id: string; name: string; breed: string; imageUrl: string; age: string; weight: string; traits: string[] };

export default function AddPetScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', breed: '', age: '', weight: '', imageUrl: '' });
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [loading, setLoading] = useState(false);

  const commonTraits = ['Juguetón', 'Tranquilo', 'Sociable', 'Protector', 'Cariñoso', 'Energético', 'Obediente', 'Independiente', 'Curioso', 'Amigable'];

  const handleInputChange = (field: keyof typeof formData, value: string) => setFormData({ ...formData, [field]: value });
  const addTrait = (trait: string) => trait.trim() && !traits.includes(trait.trim()) && setTraits([...traits, trait.trim()]) && setNewTrait('');
  const removeTrait = (trait: string) => setTraits(traits.filter(t => t !== trait));
  const validateForm = () => !formData.name.trim() ? (Alert.alert('Error', 'El nombre es obligatorio'), false) :
                         !formData.breed.trim() ? (Alert.alert('Error', 'La raza es obligatoria'), false) :
                         !formData.age.trim() ? (Alert.alert('Error', 'La edad es obligatoria'), false) : true;

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const newPet: Pet = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: formData.age.trim(),
        weight: formData.weight.trim() || 'No especificado',
        imageUrl: formData.imageUrl.trim() || 'https://placekitten.com/200/200',
        traits
      };
      console.log('Nueva mascota:', newPet);
      Alert.alert('Éxito', `${newPet.name} agregado exitosamente`, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la mascota');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#EAEAEA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Mascota</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: formData.imageUrl || 'https://placekitten.com/200/200' }} style={styles.imagePreview} />
          <Text style={styles.imageHint}>{formData.imageUrl ? 'Vista previa' : 'Imagen por defecto'}</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={value => handleInputChange('name', value)} placeholder="Ej: Max, Luna..." placeholderTextColor="#AAB4C0" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raza *</Text>
            <TextInput style={styles.input} value={formData.breed} onChangeText={value => handleInputChange('breed', value)} placeholder="Ej: Golden Retriever, Persa..." placeholderTextColor="#AAB4C0" />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Edad *</Text>
              <TextInput style={styles.input} value={formData.age} onChangeText={value => handleInputChange('age', value)} placeholder="Ej: 2 años" placeholderTextColor="#AAB4C0" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Peso</Text>
              <TextInput style={styles.input} value={formData.weight} onChangeText={value => handleInputChange('weight', value)} placeholder="Ej: 25 kg" placeholderTextColor="#AAB4C0" />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de imagen</Text>
            <TextInput style={styles.input} value={formData.imageUrl} onChangeText={value => handleInputChange('imageUrl', value)} placeholder="https://ejemplo.com/imagen.jpg" placeholderTextColor="#AAB4C0" autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Características</Text>
            <Text style={styles.subLabel}>Selecciona características comunes:</Text>
            <View style={styles.commonTraitsContainer}>
              {commonTraits.map(trait => (
                <TouchableOpacity key={trait} style={[styles.commonTrait, traits.includes(trait) && styles.commonTraitSelected]} onPress={() => traits.includes(trait) ? removeTrait(trait) : addTrait(trait)}>
                  <Text style={[styles.commonTraitText, traits.includes(trait) && styles.commonTraitTextSelected]}>{trait}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customTraitContainer}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} value={newTrait} onChangeText={setNewTrait} placeholder="Característica personalizada" placeholderTextColor="#AAB4C0" />
              <TouchableOpacity style={styles.addTraitButton} onPress={() => addTrait(newTrait)}>
                <Feather name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {traits.length > 0 && (
              <View style={styles.selectedTraitsContainer}>
                <Text style={styles.subLabel}>Características seleccionadas:</Text>
                <View style={styles.selectedTraits}>
                  {traits.map((trait, i) => (
                    <View key={i} style={styles.selectedTrait}>
                      <Text style={styles.selectedTraitText}>{trait}</Text>
                      <TouchableOpacity style={styles.removeTraitButton} onPress={() => removeTrait(trait)}>
                        <Feather name="x" size={16} color="#ff6f61" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, loading && styles.saveButtonDisabled]} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122432' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#1E2A38', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(234,234,234,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#EAEAEA' },
  content: { flex: 1, padding: 20 },
  imagePreviewContainer: { alignItems: 'center', marginBottom: 24 },
  imagePreview: { width: 120, height: 120, borderRadius: 60, marginBottom: 8 },
  imageHint: { fontSize: 12, color: '#AAB4C0' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#EAEAEA', marginBottom: 8 },
  subLabel: { fontSize: 14, color: '#AAB4C0', marginBottom: 12 },
  input: { backgroundColor: '#1E2A38', borderRadius: 12, padding: 16, fontSize: 16, color: '#EAEAEA', borderWidth: 1, borderColor: 'rgba(234,234,234,0.1)' },
  row: { flexDirection: 'row' },
  commonTraitsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  commonTrait: { backgroundColor: 'rgba(234,234,234,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, margin: 4, borderWidth: 1, borderColor: 'transparent' },
  commonTraitSelected: { backgroundColor: 'rgba(255,111,97,0.2)', borderColor: '#ff6f61' },
  commonTraitText: { color: '#AAB4C0', fontSize: 14 },
  commonTraitTextSelected: { color: '#ff6f61', fontWeight: '500' },
  customTraitContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addTraitButton: { backgroundColor: '#ff6f61', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  selectedTraitsContainer: { marginTop: 8 },
  selectedTraits: { flexDirection: 'row', flexWrap: 'wrap' },
  selectedTrait: { backgroundColor: 'rgba(255,111,97,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, margin: 4, flexDirection: 'row', alignItems: 'center' },
  selectedTraitText: { color: '#ff6f61', fontSize: 12, marginRight: 6 },
  removeTraitButton: { padding: 2 },
  footer: { flexDirection: 'row', padding: 20, paddingBottom: 40, gap: 12 },
  cancelButton: { flex: 1, backgroundColor: 'rgba(234,234,234,0.1)', borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelButtonText: { color: '#EAEAEA', fontSize: 16, fontWeight: '500' },
  saveButton: { flex: 1, backgroundColor: '#ff6f61', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});