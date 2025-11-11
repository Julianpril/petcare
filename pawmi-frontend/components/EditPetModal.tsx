import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { uploadImageToSupabase } from '../lib/upload-image';
import BasicInfoFields from './EditPetModal/BasicInfoFields';
import ImageSection from './EditPetModal/ImageSection';
import ModalFooter from './EditPetModal/ModalFooter';
import ModalHeader from './EditPetModal/ModalHeader';
import TraitsSection from './EditPetModal/TraitsSection';

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
        const localUri = result.assets[0].uri;
        
        try {
          // Subir imagen a Supabase Storage
          console.log('📤 Subiendo imagen a Supabase...');
          const { publicUrl } = await uploadImageToSupabase(localUri, 'pet-images', 'pets');
          console.log('✅ Imagen subida exitosamente:', publicUrl);
          
          setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
          Alert.alert('✅ ¡Listo!', 'Imagen subida correctamente');
        } catch (uploadError: any) {
          console.error('Error uploading to Supabase:', uploadError);
          
          // Si falla la subida, usar URI local temporalmente y mostrar advertencia
          setFormData(prev => ({ ...prev, imageUrl: localUri }));
          Alert.alert(
            '⚠️ Advertencia', 
            'No se pudo subir la imagen al servidor. Se usará temporalmente, pero puede no persistir.',
            [{ text: 'Entendido' }]
          );
        }
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
        const localUri = result.assets[0].uri;
        
        try {
          // Subir imagen a Supabase Storage
          console.log('📤 Subiendo foto a Supabase...');
          const { publicUrl } = await uploadImageToSupabase(localUri, 'pet-images', 'pets');
          console.log('✅ Foto subida exitosamente:', publicUrl);
          
          setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
          Alert.alert('✅ ¡Listo!', 'Foto tomada y guardada correctamente');
        } catch (uploadError: any) {
          console.error('Error uploading to Supabase:', uploadError);
          
          // Si falla la subida, usar URI local temporalmente
          setFormData(prev => ({ ...prev, imageUrl: localUri }));
          Alert.alert(
            '⚠️ Advertencia', 
            'No se pudo subir la foto al servidor. Se usará temporalmente, pero puede no persistir.',
            [{ text: 'Entendido' }]
          );
        }
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
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <ModalHeader onClose={onClose} />

        <KeyboardAvoidingView 
          style={styles.keyboardAvoid} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sección de imagen */}
            <ImageSection
              imageUrl={formData.imageUrl}
              imageLoading={imageLoading}
              onPickImage={pickImage}
              onShowOptions={showImageOptions}
              onRemoveImage={removeImage}
            />

            {/* Formulario */}
            <View style={styles.form}>
              <BasicInfoFields
                name={formData.name}
                breed={formData.breed}
                age={formData.age}
                weight={formData.weight}
                onChangeName={value => handleInputChange('name', value)}
                onChangeBreed={value => handleInputChange('breed', value)}
                onChangeAge={value => handleInputChange('age', value)}
                onChangeWeight={value => handleInputChange('weight', value)}
              />

              <TraitsSection
                traits={traits}
                newTrait={newTrait}
                onNewTraitChange={setNewTrait}
                onAddTrait={addTrait}
                onRemoveTrait={removeTrait}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <ModalFooter
            saving={saving}
            onCancel={() => {
              resetForm();
              onClose();
            }}
            onSave={handleSave}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0a0a0b' 
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 120,
  },
  form: { 
    flex: 1,
    paddingBottom: 20,
  },
});

export default EditPetModal;