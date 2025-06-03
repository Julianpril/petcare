import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

type Pet = { id: string; name: string; breed: string; imageUrl: string; age: string; weight: string; traits: string[] };

export default function AddPetScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', breed: '', age: '', weight: '', imageUrl: '' });
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const commonTraits = ['Juguetón', 'Tranquilo', 'Sociable', 'Protector', 'Cariñoso', 'Energético', 'Obediente', 'Independiente', 'Curioso', 'Amigable'];

  const handleInputChange = (field: keyof typeof formData, value: string) => setFormData({ ...formData, [field]: value });
  const addTrait = (trait: string) => trait.trim() && !traits.includes(trait.trim()) && setTraits([...traits, trait.trim()]) && setNewTrait('');
  const removeTrait = (trait: string) => setTraits(traits.filter(t => t !== trait));
  const validateForm = () => !formData.name.trim() ? (Alert.alert('Error', 'El nombre es obligatorio'), false) :
                         !formData.breed.trim() ? (Alert.alert('Error', 'La raza es obligatoria'), false) :
                         !formData.age.trim() ? (Alert.alert('Error', 'La edad es obligatoria'), false) : true;

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a tu galería para seleccionar una foto de tu mascota.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setImageLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setImageLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu cámara para tomar una foto de tu mascota.',
          [{ text: 'OK' }]
        );
        return;
      }

      setImageLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, imageUrl: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción para agregar la foto de tu mascota',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Elegir de galería', onPress: pickImage },
      ]
    );
  };

  const removeImage = () => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que quieres eliminar la imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setFormData(prev => ({ ...prev, imageUrl: '' })) },
      ]
    );
  };

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
        imageUrl: formData.imageUrl || 'https://placekitten.com/200/200',
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

  const getImageSource = () => {
    if (formData.imageUrl) {
      return { uri: formData.imageUrl };
    }
    return { uri: 'https://placekitten.com/200/200' };
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
        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={showImageOptions}
            disabled={imageLoading}
          >
            <Image source={getImageSource()} style={styles.imagePreview} />
            
            {imageLoading ? (
              <View style={styles.imageOverlay}>
                <Text style={styles.loadingText}>Cargando...</Text>
              </View>
            ) : (
              <View style={styles.imageOverlay}>
                <Feather name="camera" size={24} color="#fff" />
                <Text style={styles.imageOverlayText}>
                  {formData.imageUrl ? 'Cambiar foto' : 'Agregar foto'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {formData.imageUrl && !imageLoading && (
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Feather name="trash-2" size={16} color="#ff6f61" />
              <Text style={styles.removeImageText}>Eliminar imagen</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.imageHint}>
            {formData.imageUrl ? 'Toca para cambiar la imagen' : 'Toca para agregar una imagen'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Feather name="heart" size={16} color="#47a9ff" /> Nombre *
            </Text>
            <TextInput 
              style={styles.input} 
              value={formData.name} 
              onChangeText={value => handleInputChange('name', value)} 
              placeholder="Ej: Max, Luna..." 
              placeholderTextColor="#AAB4C0" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Feather name="tag" size={16} color="#47a9ff" /> Raza *
            </Text>
            <TextInput 
              style={styles.input} 
              value={formData.breed} 
              onChangeText={value => handleInputChange('breed', value)} 
              placeholder="Ej: Golden Retriever, Persa..." 
              placeholderTextColor="#AAB4C0" 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>
                <Feather name="calendar" size={16} color="#47a9ff" /> Edad *
              </Text>
              <TextInput 
                style={styles.input} 
                value={formData.age} 
                onChangeText={value => handleInputChange('age', value)} 
                placeholder="Ej: 2 años" 
                placeholderTextColor="#AAB4C0" 
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>
                <Feather name="activity" size={16} color="#47a9ff" /> Peso
              </Text>
              <TextInput 
                style={styles.input} 
                value={formData.weight} 
                onChangeText={value => handleInputChange('weight', value)} 
                placeholder="Ej: 25 kg" 
                placeholderTextColor="#AAB4C0" 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Feather name="star" size={16} color="#47a9ff" /> Características
            </Text>
            <Text style={styles.subLabel}>Selecciona características comunes:</Text>
            <View style={styles.commonTraitsContainer}>
              {commonTraits.map(trait => (
                <TouchableOpacity 
                  key={trait} 
                  style={[styles.commonTrait, traits.includes(trait) && styles.commonTraitSelected]} 
                  onPress={() => traits.includes(trait) ? removeTrait(trait) : addTrait(trait)}
                >
                  <Text style={[styles.commonTraitText, traits.includes(trait) && styles.commonTraitTextSelected]}>
                    {trait}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customTraitContainer}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 10 }]} 
                value={newTrait} 
                onChangeText={setNewTrait} 
                placeholder="Característica personalizada" 
                placeholderTextColor="#AAB4C0" 
              />
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
          <Feather name="x" size={18} color="#EAEAEA" />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave} 
          disabled={loading}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122432' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#1E2A38', 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(234,234,234,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#EAEAEA' },
  content: { flex: 1, padding: 20 },
  imageSection: { alignItems: 'center', marginBottom: 32 },
  imageContainer: { 
    position: 'relative', 
    borderRadius: 80, 
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imagePreview: { width: 160, height: 160 },
  imageOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  imageOverlayText: { color: '#fff', fontSize: 12, fontWeight: '500', marginTop: 4 },
  loadingText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  removeImageButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    backgroundColor: 'rgba(255, 111, 97, 0.1)', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ff6f61',
    marginBottom: 8,
    gap: 6,
  },
  removeImageText: { color: '#ff6f61', fontSize: 12, fontWeight: '500' },
  imageHint: { fontSize: 12, color: '#AAB4C0', textAlign: 'center' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#EAEAEA', marginBottom: 8 },
  subLabel: { fontSize: 14, color: '#AAB4C0', marginBottom: 12 },
  input: { 
    backgroundColor: '#1E2A38', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    color: '#EAEAEA', 
    borderWidth: 1, 
    borderColor: 'rgba(234,234,234,0.1)' 
  },
  row: { flexDirection: 'row' },
  commonTraitsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  commonTrait: { 
    backgroundColor: 'rgba(234,234,234,0.1)', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    margin: 4, 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  commonTraitSelected: { backgroundColor: 'rgba(255,111,97,0.2)', borderColor: '#ff6f61' },
  commonTraitText: { color: '#AAB4C0', fontSize: 14 },
  commonTraitTextSelected: { color: '#ff6f61', fontWeight: '500' },
  customTraitContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addTraitButton: { 
    backgroundColor: '#ff6f61', 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  selectedTraitsContainer: { marginTop: 8 },
  selectedTraits: { flexDirection: 'row', flexWrap: 'wrap' },
  selectedTrait: { 
    backgroundColor: 'rgba(255,111,97,0.2)', 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    margin: 4, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  selectedTraitText: { color: '#ff6f61', fontSize: 12, marginRight: 6 },
  removeTraitButton: { padding: 2 },
  footer: { flexDirection: 'row', padding: 20, paddingBottom: 40, gap: 12 },
  cancelButton: { 
    flex: 1, 
    backgroundColor: 'rgba(234,234,234,0.1)', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: { color: '#EAEAEA', fontSize: 16, fontWeight: '500' },
  saveButton: { 
    flex: 1, 
    backgroundColor: '#ff6f61', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});