// components/PetGallery.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../lib/api-client';
import { uploadImageToSupabase } from '../lib/upload-image';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3;

interface PetPhoto {
  id: string;
  pet_id: string;
  photo_url: string;
  storage_path: string;
  category: string;
  description?: string;
  is_primary: boolean;
  taken_at?: string;
  created_at: string;
}

interface PetGalleryProps {
  petId: string;
  petName: string;
  visible: boolean;
  onClose: () => void;
}

export default function PetGallery({ petId, petName, visible, onClose }: PetGalleryProps) {
  const [photos, setPhotos] = useState<PetPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PetPhoto | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todas', icon: 'images' },
    { id: 'general', label: 'General', icon: 'camera' },
    { id: 'medical', label: 'Médicas', icon: 'medical' },
    { id: 'profile', label: 'Perfil', icon: 'person-circle' },
    { id: 'vaccination', label: 'Vacunas', icon: 'shield-checkmark' },
    { id: 'grooming', label: 'Aseo', icon: 'cut' },
  ];

  useEffect(() => {
    if (visible) {
      loadPhotos();
    }
  }, [visible, petId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPetPhotos(petId);
      setPhotos(response);
    } catch (error) {
      console.error('Error cargando fotos:', error);
      Alert.alert('Error', 'No se pudieron cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadPhoto = async (imageUri: string) => {
    try {
      setUploading(true);
      
      // Subir a Supabase Storage
      const { publicUrl, path } = await uploadImageToSupabase(
        imageUri,
        'pet-images',
        `pets/${petId}`
      );

      // Guardar en base de datos
      await apiClient.createPetPhoto({
        pet_id: petId,
        photo_url: publicUrl,
        storage_path: path,
        category: selectedCategory === 'all' ? 'general' : selectedCategory,
        is_primary: photos.length === 0, // Primera foto es principal
      });

      Alert.alert('✅ Éxito', 'Foto agregada correctamente');
      await loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      '📸 Agregar foto',
      `Agrega una nueva foto de ${petName}`,
      [
        { text: '📷 Tomar foto', onPress: takePhoto },
        { text: '🖼️ Galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const deletePhoto = async (photoId: string) => {
    Alert.alert(
      '🗑️ Eliminar foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deletePetPhoto(photoId);
              Alert.alert('✅ Eliminada', 'Foto eliminada correctamente');
              setViewerVisible(false);
              await loadPhotos();
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'No se pudo eliminar la foto');
            }
          },
        },
      ]
    );
  };

  const setAsPrimary = async (photoId: string) => {
    try {
      await apiClient.updatePetPhoto(photoId, { is_primary: true });
      Alert.alert('✅ Actualizada', 'Foto de perfil actualizada');
      setViewerVisible(false);
      await loadPhotos();
    } catch (error) {
      console.error('Error setting primary photo:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    }
  };

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  const PhotoItem = ({ item }: { item: PetPhoto }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => {
        setSelectedPhoto(item);
        setViewerVisible(true);
      }}
    >
      <Image source={{ uri: item.photo_url }} style={styles.photoImage} />
      {item.is_primary && (
        <View style={styles.primaryBadge}>
          <Ionicons name="star" size={12} color="#fff" />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.photoOverlay}
      >
        <Ionicons
          name={getCategoryIcon(item.category)}
          size={16}
          color="#fff"
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      general: 'camera',
      medical: 'medical',
      profile: 'person-circle',
      vaccination: 'shield-checkmark',
      grooming: 'cut',
      before: 'arrow-back-circle',
      after: 'arrow-forward-circle',
    };
    return icons[category] || 'image';
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
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="images" size={24} color="#fff" />
              <Text style={styles.headerTitle}>Galería de {petName}</Text>
            </View>
            <TouchableOpacity onPress={showImageOptions} style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Category filters */}
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              data={categories}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === item.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={selectedCategory === item.id ? '#fff' : '#cbd5e1'}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === item.id && styles.categoryTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </LinearGradient>

        {/* Photos Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Cargando fotos...</Text>
          </View>
        ) : filteredPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.emptyIcon}
            >
              <Ionicons name="images-outline" size={48} color="#fff" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No hay fotos aún</Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all'
                ? `Agrega las primeras fotos de ${petName}`
                : `No hay fotos en la categoría ${
                    categories.find((c) => c.id === selectedCategory)?.label
                  }`}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={showImageOptions}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.emptyButtonGradient}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Agregar foto</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPhotos}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.photosList}
            renderItem={({ item }) => <PhotoItem item={item} />}
          />
        )}

        {/* Upload indicator */}
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <View style={styles.uploadingCard}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.uploadingText}>Subiendo foto...</Text>
            </View>
          </View>
        )}

        {/* Photo Viewer Modal */}
        <Modal visible={viewerVisible} transparent animationType="fade">
          <View style={styles.viewerContainer}>
            <TouchableOpacity
              style={styles.viewerClose}
              onPress={() => setViewerVisible(false)}
            >
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>

            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.photo_url }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />

                <View style={styles.viewerActions}>
                  {!selectedPhoto.is_primary && (
                    <TouchableOpacity
                      style={styles.viewerButton}
                      onPress={() => setAsPrimary(selectedPhoto.id)}
                    >
                      <Ionicons name="star-outline" size={24} color="#fff" />
                      <Text style={styles.viewerButtonText}>Hacer principal</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.viewerButton, styles.deleteButton]}
                    onPress={() => deletePhoto(selectedPhoto.id)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#fff" />
                    <Text style={styles.viewerButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  categoryText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  photosList: {
    padding: 10,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    alignItems: 'flex-end',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  viewerImage: {
    width: '100%',
    height: '70%',
  },
  viewerActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  viewerButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  viewerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
