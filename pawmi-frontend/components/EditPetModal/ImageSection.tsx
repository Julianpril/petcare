import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ImageSectionProps {
  imageUrl: string;
  imageLoading: boolean;
  onPickImage: () => void;
  onShowOptions: () => void;
  onRemoveImage: () => void;
}

export default function ImageSection({
  imageUrl,
  imageLoading,
  onPickImage,
  onShowOptions,
  onRemoveImage,
}: ImageSectionProps) {
  const getImageSource = () => {
    if (imageUrl) {
      return { uri: imageUrl };
    }
    const randomId = Math.floor(Math.random() * 100);
    return { uri: `https://picsum.photos/seed/${randomId}/400/400` };
  };

  return (
    <View style={styles.imageSection}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={onShowOptions}
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

      {imageUrl && !imageLoading && (
        <TouchableOpacity style={styles.removeImageButton} onPress={onRemoveImage}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
          <Text style={styles.removeImageText}>Eliminar imagen</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.imageHint}>Toca para cambiar la imagen de tu mascota</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
