import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age: string;
  weight: string;
  traits: string[];
}

interface EditPetModalProps {
  visible: boolean;
  pet: Pet | null;
  onClose: () => void;
  onSave: (updatedPet: Pet) => Promise<void> | void;
}

const commonTraits = [
  'Juguetón', 'Tranquilo', 'Sociable', 'Protector', 'Cariñoso', 
  'Energético', 'Obediente', 'Independiente', 'Curioso', 'Amigable'
];

const EditPetModal: React.FC<EditPetModalProps> = ({ visible, pet, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    imageUrl: '',
    age: '',
    weight: '',
  });
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed,
        imageUrl: pet.imageUrl,
        age: pet.age,
        weight: pet.weight,
      });
      setTraits(pet.traits || []);
    }
  }, [pet]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const addTrait = (trait: string) => {
    if (trait.trim() && !traits.includes(trait.trim())) {
      setTraits([...traits, trait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter(t => t !== trait));
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '📱 Permisos de galería',
        'Para cambiar la foto de tu mascota, necesitamos acceso a tu galería de imágenes.',
        [{ text: 'Entendido' }]
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
      Alert.alert('❌ Error', 'No se pudo seleccionar la imagen. Intenta de nuevo.');
    } finally {
      setImageLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '📷 Permisos de cámara',
          'Para tomar fotos de tu mascota, necesitamos acceso a tu cámara.',
          [{ text: 'Entendido' }]
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
      Alert.alert('❌ Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      '📸 Foto de tu mascota',
      'Elige cómo quieres cambiar la foto',
      [
        { 
          text: '📷 Tomar foto', 
          onPress: takePhoto,
          style: 'default'
        },
        { 
          text: '🖼️ Elegir de galería', 
          onPress: pickImage,
          style: 'default'
        },
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    Alert.alert(
      '🗑️ Eliminar imagen',
      '¿Estás seguro de que quieres eliminar la foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => setFormData(prev => ({ ...prev, imageUrl: '' })) 
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('⚠️ Nombre requerido', 'Por favor ingresa el nombre de tu mascota');
      return;
    }
    if (!formData.breed.trim()) {
      Alert.alert('⚠️ Raza requerida', 'Por favor ingresa la raza de tu mascota');
      return;
    }

    if (!pet) return;

    const updatedPet: Pet = {
      ...pet,
      name: formData.name.trim(),
      breed: formData.breed.trim(),
      imageUrl: formData.imageUrl.trim() || pet.imageUrl,
      age: formData.age.trim() || pet.age,
      weight: formData.weight.trim() || pet.weight,
      traits: traits,
    };

    try {
      setSaving(true);
      await onSave(updatedPet);
      Alert.alert(
        '✅ ¡Éxito!',
        `Los cambios de ${formData.name.trim()} se guardaron correctamente 🎉`,
        [{ text: 'Entendido' }]
      );
      onClose();
    } catch (error) {
      console.error('Error guardando mascota:', error);
      Alert.alert('❌ Error', 'No se pudo guardar la mascota. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed,
        imageUrl: pet.imageUrl,
        age: pet.age,
        weight: pet.weight,
      });
      setTraits(pet.traits || []);
    }
  };

  const getImageSource = () => {
    if (formData.imageUrl) {
      return { uri: formData.imageUrl };
    }
    const randomId = Math.floor(Math.random() * 100);
    return { uri: `https://picsum.photos/seed/${randomId}/400/400` };
  };

  if (!pet) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header con gradiente */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="create-outline" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>Editar Mascota</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sección de imagen */}
          <View style={styles.imageSection}>
            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={showImageOptions}
              disabled={imageLoading}
              activeOpacity={0.8}
            >
              <Image source={getImageSource()} style={styles.imagePreview} />
              
              {imageLoading ? (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator size="large" color="#ffffff" />
                  <Text style={styles.loadingText}>Cargando...</Text>
                </View>
              ) : (
                <View style={styles.imageOverlay}>
                  <LinearGradient
                    colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
                    style={styles.cameraIconContainer}
                  >
                    <Ionicons name="camera" size={28} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.imageOverlayText}>Cambiar foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {formData.imageUrl && !imageLoading && (
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.removeImageText}>Eliminar imagen</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.imageHint}>
              Toca para cambiar la imagen de tu mascota
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="heart" size={18} color="#6366f1" />
                <Text style={styles.label}>Nombre</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>*</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={formData.name} 
                  onChangeText={value => handleInputChange('name', value)} 
                  placeholder="Nombre de la mascota" 
                  placeholderTextColor="#64748b" 
                />
              </View>
            </View>

            {/* Raza */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="paw" size={18} color="#6366f1" />
                <Text style={styles.label}>Raza</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>*</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={formData.breed} 
                  onChangeText={value => handleInputChange('breed', value)} 
                  placeholder="Raza de la mascota" 
                  placeholderTextColor="#64748b" 
                />
              </View>
            </View>

            {/* Edad y Peso en fila */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <View style={styles.labelContainer}>
                  <Ionicons name="calendar-outline" size={18} color="#6366f1" />
                  <Text style={styles.label}>Edad</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput 
                    style={styles.input} 
                    value={formData.age} 
                    onChangeText={value => handleInputChange('age', value)} 
                    placeholder="Ej: 2 años" 
                    placeholderTextColor="#64748b" 
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={styles.labelContainer}>
                  <Ionicons name="barbell-outline" size={18} color="#6366f1" />
                  <Text style={styles.label}>Peso</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput 
                    style={styles.input} 
                    value={formData.weight} 
                    onChangeText={value => handleInputChange('weight', value)} 
                    placeholder="Ej: 25 kg" 
                    placeholderTextColor="#64748b" 
                  />
                </View>
              </View>
            </View>

            {/* Características */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="sparkles" size={18} color="#6366f1" />
                <Text style={styles.label}>Características</Text>
              </View>
              <Text style={styles.subLabel}>Selecciona las características de tu mascota:</Text>
              
              <View style={styles.commonTraitsContainer}>
                {commonTraits.map(trait => (
                  <TouchableOpacity 
                    key={trait} 
                    style={[
                      styles.commonTrait, 
                      traits.includes(trait) && styles.commonTraitSelected
                    ]} 
                    onPress={() => traits.includes(trait) ? removeTrait(trait) : addTrait(trait)}
                    activeOpacity={0.7}
                  >
                    {traits.includes(trait) && (
                      <Ionicons name="checkmark-circle" size={16} color="#6366f1" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[
                      styles.commonTraitText, 
                      traits.includes(trait) && styles.commonTraitTextSelected
                    ]}>
                      {trait}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input personalizado */}
              <View style={styles.customTraitContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
                  <TextInput 
                    style={styles.input} 
                    value={newTrait} 
                    onChangeText={setNewTrait} 
                    placeholder="Agregar característica personalizada" 
                    placeholderTextColor="#64748b" 
                  />
                </View>
                <TouchableOpacity style={styles.addTraitButton} onPress={() => addTrait(newTrait)}>
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.addTraitGradient}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Características seleccionadas */}
              {traits.length > 0 && (
                <View style={styles.selectedTraitsContainer}>
                  <Text style={styles.subLabel}>Seleccionadas ({traits.length}):</Text>
                  <View style={styles.selectedTraits}>
                    {traits.map((trait, i) => (
                      <View key={i} style={styles.selectedTrait}>
                        <Text style={styles.selectedTraitText}>{trait}</Text>
                        <TouchableOpacity 
                          style={styles.removeTraitButton} 
                          onPress={() => removeTrait(trait)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close-circle" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer con botones */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              resetForm();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#94a3b8" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave} 
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={saving ? ['#64748b', '#475569'] : ['#43e97b', '#38f9d7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.saveButtonText}>Guardando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0b' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    paddingBottom: 24,
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  imageSection: { 
    alignItems: 'center', 
    marginBottom: 40,
  },
  imageContainer: { 
    position: 'relative', 
    borderRadius: 100, 
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#16181d',
  },
  imagePreview: { 
    width: 180, 
    height: 180,
  },
  imageOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8,
  },
  cameraIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600',
  },
  removeImageButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 12,
  },
  removeImageText: { 
    color: '#ef4444', 
    fontSize: 13, 
    fontWeight: '600',
  },
  imageHint: { 
    fontSize: 13, 
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  form: { 
    flex: 1,
    paddingBottom: 20,
  },
  inputGroup: { 
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
  requiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  subLabel: { 
    fontSize: 13, 
    color: '#94a3b8', 
    marginBottom: 12,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#16181d',
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
  row: { 
    flexDirection: 'row',
    gap: 16,
  },
  commonTraitsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
    marginBottom: 20,
  },
  commonTrait: { 
    backgroundColor: '#16181d', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  commonTraitSelected: { 
    backgroundColor: 'rgba(99, 102, 241, 0.15)', 
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  commonTraitText: { 
    color: '#94a3b8', 
    fontSize: 14,
    fontWeight: '600',
  },
  commonTraitTextSelected: { 
    color: '#6366f1', 
    fontWeight: '700',
  },
  customTraitContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 20,
  },
  addTraitButton: { 
    width: 52, 
    height: 52, 
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addTraitGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTraitsContainer: { 
    marginTop: 8,
  },
  selectedTraits: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedTrait: { 
    backgroundColor: 'rgba(99, 102, 241, 0.15)', 
    borderRadius: 16, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  selectedTraitText: { 
    color: '#6366f1', 
    fontSize: 13,
    fontWeight: '600',
  },
  removeTraitButton: { 
    padding: 2,
  },
  footer: { 
    flexDirection: 'row', 
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
    backgroundColor: '#0a0a0b',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  cancelButton: { 
    flex: 1, 
    backgroundColor: '#16181d', 
    borderRadius: 16, 
    paddingVertical: 16, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cancelButtonText: { 
    color: '#94a3b8', 
    fontSize: 15, 
    fontWeight: '700',
  },
  saveButton: { 
    flex: 1.5, 
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: { 
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

export default EditPetModal;