import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { uploadImageToSupabase } from '@/lib/upload-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export function PersonalInfo() {
  const { currentUser, refreshUser } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isWeb = Platform.OS === 'web';

  // Load user data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log('📥 Cargando datos del usuario:', currentUser);
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setProfileImage(currentUser.profile_image_url || '');
    }
  }, [currentUser]);

  const handlePickImage = async () => {
    // Check if running on web
    if (isWeb) {
      Alert.alert(
        'No disponible en web',
        'La subida de fotos de perfil solo está disponible en la app móvil (iOS/Android).'
      );
      return;
    }

    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para cambiar la foto de perfil.'
        );
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        
        setUploadingImage(true);
        
        try {
          // Subir imagen a Supabase
          const { publicUrl } = await uploadImageToSupabase(
            selectedImage,
            'pet-images',
            'profiles'
          );
          
          setProfileImage(publicUrl);
          console.log('✅ Imagen de perfil subida:', publicUrl);
        } catch (error) {
          console.error('❌ Error subiendo imagen:', error);
          Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
      setUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert('Campo requerido', 'El nombre completo es obligatorio.');
      return false;
    }

    if (phone && !/^[0-9\s\-\+\(\)]+$/.test(phone)) {
      Alert.alert('Teléfono inválido', 'Por favor ingresa un número de teléfono válido.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!currentUser?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        profile_image_url: profileImage || undefined,
      };

      console.log('📝 Actualizando perfil:', profileData);
      
      const updatedUser = await apiClient.updateUserProfile(currentUser.id, profileData);
      
      console.log('✅ Perfil actualizado:', updatedUser);
      
      // Refresh user data in auth context
      await refreshUser();
      
      Alert.alert(
        '✅ Perfil actualizado',
        'Tu información personal se ha guardado correctamente.'
      );
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar tu información. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Web Warning */}
        {isWeb && (
          <View style={styles.webWarning}>
            <Text style={styles.webWarningTitle}>⚠️ Funcionalidad limitada en web</Text>
            <Text style={styles.webWarningText}>
              La subida de fotos de perfil solo está disponible en la app móvil (iOS/Android).
            </Text>
          </View>
        )}

        {/* Profile Picture Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={handlePickImage}
            disabled={uploadingImage || isWeb}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            
            {uploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.changePhotoButton, isWeb && styles.disabledButton]}
            onPress={handlePickImage}
            disabled={uploadingImage || isWeb}
          >
            <Text style={styles.changePhotoText}>
              {uploadingImage ? 'Subiendo...' : isWeb ? '📱 Solo en móvil' : 'Cambiar foto'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor="#666"
            />
          </View>

          {/* Email (read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholderTextColor="#666"
            />
            <Text style={styles.helperText}>
              El email no se puede cambiar
            </Text>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ej: +54 11 1234-5678"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Ej: Av. Corrientes 1234, CABA"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
  },
  webWarning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  webWarningTitle: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  webWarningText: {
    color: '#fbbf24',
    fontSize: 14,
    lineHeight: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A78BFA',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  changePhotoText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#0f0f0f',
    color: '#666',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
