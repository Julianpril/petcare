// components/BeforeAfterPhotos.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../lib/api-client';
import { uploadImageToSupabase } from '../lib/upload-image';

const { width } = Dimensions.get('window');

interface BeforeAfterPhotosProps {
  petId: string;
  petName: string;
  treatmentId: string;
  treatmentName: string;
  visible: boolean;
  onClose: () => void;
}

interface PhotoData {
  id?: string;
  photo_url: string;
  category: 'before' | 'after';
}

export default function BeforeAfterPhotos({
  petId,
  petName,
  treatmentId,
  treatmentName,
  visible,
  onClose,
}: BeforeAfterPhotosProps) {
  const [beforePhoto, setBeforePhoto] = useState<PhotoData | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<PhotoData | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPhotos();
    }
  }, [visible, treatmentId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBeforeAfterPhotos(treatmentId);
      
      if (response.before_photo) {
        setBeforePhoto({
          id: response.before_photo.id,
          photo_url: response.before_photo.photo_url,
          category: 'before',
        });
      }
      
      if (response.after_photo) {
        setAfterPhoto({
          id: response.after_photo.id,
          photo_url: response.after_photo.photo_url,
          category: 'after',
        });
      }
      
      if (response.description) {
        setDescription(response.description);
      }
    } catch (error) {
      console.error('Error loading before/after photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'before' | 'after') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (type: 'before' | 'after') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadPhoto = async (imageUri: string, type: 'before' | 'after') => {
    try {
      setUploading(true);

      // Subir a Supabase Storage
      const { publicUrl, path } = await uploadImageToSupabase(
        imageUri,
        'pet-images',
        `pets/${petId}/treatments`
      );

      // Guardar en base de datos
      const photoData = {
        pet_id: petId,
        photo_url: publicUrl,
        storage_path: path,
        category: type,
        treatment_id: treatmentId,
        description: description || `Foto ${type === 'before' ? 'antes' : 'después'} - ${treatmentName}`,
      };

      await apiClient.createPetPhoto(photoData);

      // Actualizar estado local
      if (type === 'before') {
        setBeforePhoto({ photo_url: publicUrl, category: 'before' });
      } else {
        setAfterPhoto({ photo_url: publicUrl, category: 'after' });
      }

      Alert.alert('✅ Éxito', 'Foto agregada correctamente');
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = (type: 'before' | 'after') => {
    Alert.alert(
      `📸 Foto ${type === 'before' ? 'Antes' : 'Después'}`,
      `Agrega una foto ${type === 'before' ? 'antes' : 'después'} del tratamiento`,
      [
        { text: '📷 Tomar foto', onPress: () => takePhoto(type) },
        { text: '🖼️ Galería', onPress: () => pickImage(type) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="git-compare" size={24} color="#fff" />
            <View>
              <Text style={styles.headerTitle}>Antes / Después</Text>
              <Text style={styles.headerSubtitle}>{treatmentName}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando fotos...</Text>
            </View>
          ) : (
            <>
              {/* Comparison View */}
              <View style={styles.comparisonContainer}>
                {/* Before Photo */}
                <View style={styles.photoSection}>
                  <View style={styles.photoHeader}>
                    <Ionicons name="arrow-back-circle" size={20} color="#667eea" />
                    <Text style={styles.photoLabel}>Antes</Text>
                  </View>
                  
                  {beforePhoto ? (
                    <TouchableOpacity
                      style={styles.photoContainer}
                      onPress={() => showImageOptions('before')}
                    >
                      <Image
                        source={{ uri: beforePhoto.photo_url }}
                        style={styles.photo}
                      />
                      <View style={styles.photoOverlay}>
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={styles.overlayText}>Cambiar</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyPhoto}
                      onPress={() => showImageOptions('before')}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.emptyPhotoGradient}
                      >
                        <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.emptyPhotoText}>Agregar foto</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={24} color="#667eea" />
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* After Photo */}
                <View style={styles.photoSection}>
                  <View style={styles.photoHeader}>
                    <Ionicons name="arrow-forward-circle" size={20} color="#43e97b" />
                    <Text style={styles.photoLabel}>Después</Text>
                  </View>
                  
                  {afterPhoto ? (
                    <TouchableOpacity
                      style={styles.photoContainer}
                      onPress={() => showImageOptions('after')}
                    >
                      <Image
                        source={{ uri: afterPhoto.photo_url }}
                        style={styles.photo}
                      />
                      <View style={styles.photoOverlay}>
                        <Ionicons name="camera" size={24} color="#fff" />
                        <Text style={styles.overlayText}>Cambiar</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyPhoto}
                      onPress={() => showImageOptions('after')}
                    >
                      <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.emptyPhotoGradient}
                      >
                        <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.emptyPhotoText}>Agregar foto</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#cbd5e1" />
                  <Text style={styles.sectionTitle}>Notas del tratamiento</Text>
                </View>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe los cambios observados, duración del tratamiento, resultados..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#667eea" />
                <Text style={styles.infoText}>
                  Las fotos antes/después son útiles para documentar la efectividad de tratamientos,
                  cambios físicos y evolución de tu mascota.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Upload Indicator */}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <View style={styles.uploadingCard}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.uploadingText}>Subiendo foto...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  photoSection: {
    flex: 1,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyPhoto: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyPhotoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  divider: {
    width: 40,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dividerLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#334155',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  descriptionInput: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  uploadingText: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '600',
  },
});
