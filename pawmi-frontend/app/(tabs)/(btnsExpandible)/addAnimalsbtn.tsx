import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth-context';
import { uploadImageToSupabase } from '../../../lib/upload-image';
import { BreedDetectionModal } from './addAnimalsbtn/BreedDetectionModal';
import { BreedField } from './addAnimalsbtn/BreedField';
import { FormField } from './addAnimalsbtn/FormField';
import { FormFooter } from './addAnimalsbtn/FormFooter';
import { FormHeader } from './addAnimalsbtn/FormHeader';
import { ImageSection } from './addAnimalsbtn/ImageSection';
import { ImageUploadErrorModal } from './addAnimalsbtn/ImageUploadErrorModal';
import { TraitsSelector } from './addAnimalsbtn/TraitsSelector';
import { commonTraits, type BreedSuggestion, type FormData } from './addAnimalsbtn/types';

export default function AddPetScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    breed: '',
    age: '',
    weight: '',
    imageUrl: '',
  });
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [classifyingBreed, setClassifyingBreed] = useState(false);
  const [breedSuggestions, setBreedSuggestions] = useState<BreedSuggestion[]>([]);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [detectedBreed, setDetectedBreed] = useState({ breed: '', confidence: 0 });
  const [showImageErrorModal, setShowImageErrorModal] = useState(false);
  const [imageErrorResolve, setImageErrorResolve] = useState<((value: boolean) => void) | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) =>
    setFormData({ ...formData, [field]: value });

  const addTrait = (trait: string) => {
    if (trait.trim() && !traits.includes(trait.trim())) {
      setTraits([...traits, trait.trim()]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => setTraits(traits.filter((t) => t !== trait));

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      removeTrait(trait);
    } else {
      addTrait(trait);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre de tu mascota');
      return false;
    }
    if (!formData.breed.trim()) {
      Alert.alert('Raza requerida', 'Por favor ingresa la raza de tu mascota');
      return false;
    }
    if (!formData.age.trim()) {
      Alert.alert('Edad requerida', 'Por favor ingresa la edad de tu mascota');
      return false;
    }
    return true;
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos de galeria',
        'Para agregar fotos de tu mascota, necesitamos acceso a tu galeria de imagenes.',
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
        setFormData((prev) => ({ ...prev, imageUrl: result.assets[0].uri }));

        // Clasificar la raza automaticamente
        await classifyBreedFromImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta de nuevo.');
    } finally {
      setImageLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de camara',
          'Para tomar fotos de tu mascota, necesitamos acceso a tu camara.',
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
        setFormData((prev) => ({ ...prev, imageUrl: result.assets[0].uri }));

        // Clasificar la raza automaticamente
        await classifyBreedFromImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Foto de tu mascota',
      'Elige como quieres agregar la foto',
      [
        {
          text: 'Tomar foto',
          onPress: takePhoto,
          style: 'default',
        },
        {
          text: 'Elegir de galeria',
          onPress: pickImage,
          style: 'default',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    Alert.alert('Eliminar imagen', 'Estas seguro de que quieres eliminar la foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setFormData((prev) => ({ ...prev, imageUrl: '' }));
          setBreedSuggestions([]);
        },
      },
    ]);
  };

  const classifyBreedFromImage = async (imageUri: string) => {
    try {
      setClassifyingBreed(true);
      console.log('Clasificando raza de la imagen...');

      const result = await apiClient.classifyBreed(imageUri);

      if (result.success && result.predictions && result.predictions.length > 0) {
        const suggestions = result.predictions.map((pred: any) => ({
          breed: pred.breed,
          confidence: pred.confidence,
        }));

        setBreedSuggestions(suggestions);

        // Auto-rellenar con la raza mas probable
        const topBreed = suggestions[0];
        setFormData((prev) => ({ ...prev, breed: topBreed.breed }));

        // Mostrar modal personalizado en lugar de Alert
        setDetectedBreed({
          breed: topBreed.breed,
          confidence: topBreed.confidence,
        });
        setShowBreedModal(true);

        console.log('Clasificacion exitosa:', suggestions);
      }
    } catch (error) {
      console.error('Error clasificando raza:', error);
      // No mostrar alert de error para no interrumpir el flujo
      // El usuario puede ingresar la raza manualmente
    } finally {
      setClassifyingBreed(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (!currentUser) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para registrar mascotas.');
      return;
    }

    setLoading(true);
    try {
      const cleanedName = formData.name.trim();
      const cleanedBreed = formData.breed.trim();
      const cleanedAge = formData.age.trim();
      const cleanedWeight = formData.weight.trim();
      const numericWeight = cleanedWeight
        ? parseFloat(cleanedWeight.replace(/[^0-9.,]/g, '').replace(',', '.'))
        : NaN;
      const numericAge = cleanedAge
        ? parseFloat(cleanedAge.replace(/[^0-9.,]/g, '').replace(',', '.'))
        : NaN;

      let finalImageUrl = 'https://placehold.co/200x200?text=Pawmi';

      // Si hay una imagen local, subirla a Supabase
      if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
        setUploadingImage(true);
        try {
          console.log('Subiendo imagen a Supabase:', formData.imageUrl);
          const uploadResult = await uploadImageToSupabase(formData.imageUrl);
          console.log('Imagen subida exitosamente:', uploadResult.publicUrl);
          finalImageUrl = uploadResult.publicUrl;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setUploadingImage(false);

          // Preguntar al usuario si quiere continuar sin imagen usando modal personalizado
          const shouldContinue = await new Promise<boolean>((resolve) => {
            setImageErrorResolve(() => resolve);
            setShowImageErrorModal(true);
          });

          if (!shouldContinue) {
            setLoading(false);
            return;
          }
          // Si continua, usar imagen por defecto
          finalImageUrl = 'https://placehold.co/200x200?text=Pawmi';
        } finally {
          setUploadingImage(false);
        }
      } else if (formData.imageUrl && formData.imageUrl.startsWith('http')) {
        // Si ya es una URL remota, usarla directamente
        finalImageUrl = formData.imageUrl;
      }

      await apiClient.createPet({
        name: cleanedName,
        species: 'Other',
        breed: cleanedBreed,
        age: cleanedAge,
        age_years: Number.isFinite(numericAge) ? numericAge : null,
        weight: cleanedWeight || null,
        weight_kg: Number.isFinite(numericWeight) ? numericWeight : null,
        image_url: finalImageUrl,
        traits,
      });

      Alert.alert(
        '¡Éxito!',
        `${cleanedName} ha sido agregado a tu familia\n\nYa puedes gestionar su información desde el inicio.`,
        [
          {
            text: 'Ver mis mascotas',
            onPress: () => {
              setFormData({ name: '', breed: '', age: '', weight: '', imageUrl: '' });
              setTraits([]);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error inserting pet:', error);
      Alert.alert('Error', 'No se pudo agregar la mascota. Por favor intenta de nuevo.', [
        { text: 'Entendido' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FormHeader onBack={() => router.back()} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ImageSection
            imageUrl={formData.imageUrl}
            imageLoading={imageLoading}
            onImagePress={showImageOptions}
            onRemoveImage={removeImage}
          />

          <View style={styles.form}>
            <FormField
              label="Nombre"
              icon="heart"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ej: Max, Luna, Simba..."
              required
            />

            <BreedField
              value={formData.breed}
              onChangeText={(value) => handleInputChange('breed', value)}
              classifying={classifyingBreed}
              suggestions={breedSuggestions}
              onSelectSuggestion={(breed) => setFormData((prev) => ({ ...prev, breed }))}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormField
                  label="Edad"
                  icon="calendar-outline"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Ej: 2 anos"
                  required
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <FormField
                  label="Peso"
                  icon="barbell-outline"
                  value={formData.weight}
                  onChangeText={(value) => handleInputChange('weight', value)}
                  placeholder="Ej: 25 kg"
                />
              </View>
            </View>

            <TraitsSelector
              commonTraits={commonTraits}
              selectedTraits={traits}
              newTrait={newTrait}
              onToggleTrait={toggleTrait}
              onNewTraitChange={setNewTrait}
              onAddTrait={() => addTrait(newTrait)}
              onRemoveTrait={removeTrait}
            />
          </View>
        </ScrollView>

        <FormFooter
          loading={loading}
          uploadingImage={uploadingImage}
          onCancel={() => router.back()}
          onSave={handleSave}
        />
      </KeyboardAvoidingView>

      <BreedDetectionModal
        visible={showBreedModal}
        breed={detectedBreed.breed}
        confidence={detectedBreed.confidence}
        onClose={() => setShowBreedModal(false)}
      />

      <ImageUploadErrorModal
        visible={showImageErrorModal}
        onCancel={() => {
          setShowImageErrorModal(false);
          imageErrorResolve?.(false);
        }}
        onContinue={() => {
          setShowImageErrorModal(false);
          imageErrorResolve?.(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  form: {
    flex: 1,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
});
