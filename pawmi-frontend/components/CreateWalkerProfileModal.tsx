import { apiClient } from '@/lib/api-client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateWalkerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProfile?: any;
}

const SERVICES = [
  { value: 'walking', label: '🚶 Paseo', description: 'Paseos regulares' },
  { value: 'daycare', label: '🏠 Guardería', description: 'Cuidado diurno' },
  { value: 'overnight', label: '🌙 Hospedaje', description: 'Cuidado nocturno' },
  { value: 'training', label: '🎓 Entrenamiento', description: 'Adiestramiento' },
  { value: 'grooming', label: '✂️ Peluquería', description: 'Aseo y estética' },
];

const PET_TYPES = [
  { value: 'dog', label: '🐕 Perros' },
  { value: 'cat', label: '🐱 Gatos' },
  { value: 'bird', label: '🦜 Aves' },
  { value: 'rabbit', label: '🐰 Conejos' },
  { value: 'other', label: '🐾 Otros' },
];

const PET_SIZES = [
  { value: 'small', label: 'Pequeño', description: '< 10kg' },
  { value: 'medium', label: 'Mediano', description: '10-25kg' },
  { value: 'large', label: 'Grande', description: '> 25kg' },
];

export default function CreateWalkerProfileModal({
  visible,
  onClose,
  onSuccess,
  existingProfile,
}: CreateWalkerProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form data
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('50000');
  const [experienceYears, setExperienceYears] = useState('1');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPetTypes, setSelectedPetTypes] = useState<string[]>([]);
  const [selectedPetSizes, setSelectedPetSizes] = useState<string[]>([]);
  const [certifications, setCertifications] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [serviceRadius, setServiceRadius] = useState('10');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (existingProfile) {
      // Cargar datos existentes
      setBio(existingProfile.bio || '');
      setHourlyRate(existingProfile.hourly_rate?.toString() || '15');
      setExperienceYears(existingProfile.experience_years?.toString() || '1');
      setSelectedServices(existingProfile.services || []);
      setSelectedPetTypes(existingProfile.accepted_pet_types || []);
      setSelectedPetSizes(existingProfile.accepted_pet_sizes || []);
      setCertifications(existingProfile.certifications?.join('\n') || '');
      setCity(existingProfile.city || '');
      setNeighborhood(existingProfile.neighborhood || '');
      setServiceRadius(existingProfile.service_radius_km?.toString() || '10');
      setLatitude(existingProfile.latitude?.toString() || '');
      setLongitude(existingProfile.longitude?.toString() || '');
      setIsAvailable(existingProfile.is_available ?? true);
    }
  }, [existingProfile]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const togglePetType = (petType: string) => {
    setSelectedPetTypes((prev) =>
      prev.includes(petType)
        ? prev.filter((p) => p !== petType)
        : [...prev, petType]
    );
  };

  const togglePetSize = (size: string) => {
    setSelectedPetSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!bio.trim() || bio.length < 50) {
          Alert.alert('Error', 'La biografía debe tener al menos 50 caracteres');
          return false;
        }
        if (!hourlyRate || parseFloat(hourlyRate) < 10000) {
          Alert.alert('Error', 'La tarifa debe ser al menos $10,000 COP/hora');
          return false;
        }
        return true;
      case 2:
        if (selectedServices.length === 0) {
          Alert.alert('Error', 'Selecciona al menos un servicio');
          return false;
        }
        if (selectedPetTypes.length === 0) {
          Alert.alert('Error', 'Selecciona al menos un tipo de mascota');
          return false;
        }
        if (selectedPetSizes.length === 0) {
          Alert.alert('Error', 'Selecciona al menos un tamaño de mascota');
          return false;
        }
        return true;
      case 3:
        if (!city.trim()) {
          Alert.alert('Error', 'La ciudad es obligatoria');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);

      const profileData = {
        bio: bio.trim(),
        hourly_rate: parseFloat(hourlyRate),
        experience_years: parseInt(experienceYears) || 1,
        services: selectedServices,
        accepted_pet_types: selectedPetTypes,
        accepted_pet_sizes: selectedPetSizes,
        certifications: certifications
          .split('\n')
          .map((c) => c.trim())
          .filter((c) => c.length > 0),
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        service_radius_km: parseFloat(serviceRadius) || 10,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        is_available: isAvailable,
      };

      if (existingProfile) {
        await apiClient.updateWalkerProfile(existingProfile.id, profileData);
        Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado');
      } else {
        await apiClient.becomeWalker(profileData);
        Alert.alert('¡Éxito!', 'Tu perfil de paseador ha sido creado');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', error.detail || 'No se pudo guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información básica</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Biografía profesional <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.textArea, { height: 120 }]}
          placeholder="Cuéntanos sobre tu experiencia con mascotas, tus habilidades y por qué eres un excelente paseador..."
          placeholderTextColor="#64748b"
          multiline
          value={bio}
          onChangeText={setBio}
          maxLength={500}
        />
        <Text style={styles.charCount}>{bio.length}/500 caracteres (mín. 50)</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>
            Tarifa por hora (COP) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="50000"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={hourlyRate}
            onChangeText={setHourlyRate}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Años de experiencia</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={experienceYears}
            onChangeText={setExperienceYears}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Certificaciones (opcional)</Text>
        <Text style={styles.hint}>Una por línea</Text>
        <TextInput
          style={[styles.textArea, { height: 100 }]}
          placeholder="Ej:&#10;Curso de adiestramiento canino&#10;Primeros auxilios veterinarios"
          placeholderTextColor="#64748b"
          multiline
          value={certifications}
          onChangeText={setCertifications}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Servicios y mascotas</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Servicios que ofreces <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.checkboxGrid}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.value}
              style={[
                styles.checkboxCard,
                selectedServices.includes(service.value) && styles.checkboxCardSelected,
              ]}
              onPress={() => toggleService(service.value)}
            >
              <Text style={styles.serviceEmoji}>{service.label.split(' ')[0]}</Text>
              <Text
                style={[
                  styles.checkboxLabel,
                  selectedServices.includes(service.value) && styles.checkboxLabelSelected,
                ]}
              >
                {service.label.substring(2)}
              </Text>
              <Text style={styles.checkboxDescription}>{service.description}</Text>
              {selectedServices.includes(service.value) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Tipos de mascotas <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipContainer}>
          {PET_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.chip,
                selectedPetTypes.includes(type.value) && styles.chipSelected,
              ]}
              onPress={() => togglePetType(type.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedPetTypes.includes(type.value) && styles.chipTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Tamaños aceptados <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.chipContainer}>
          {PET_SIZES.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.chip,
                selectedPetSizes.includes(size.value) && styles.chipSelected,
              ]}
              onPress={() => togglePetSize(size.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedPetSizes.includes(size.value) && styles.chipTextSelected,
                ]}
              >
                {size.label} {size.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ubicación y disponibilidad</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={styles.label}>
            Ciudad <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Madrid"
            placeholderTextColor="#64748b"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Barrio</Text>
          <TextInput
            style={styles.input}
            placeholder="Centro"
            placeholderTextColor="#64748b"
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Radio de servicio (km)</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={serviceRadius}
          onChangeText={setServiceRadius}
        />
        <Text style={styles.hint}>Distancia máxima que estás dispuesto a viajar</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Coordenadas GPS (opcional)</Text>
        <Text style={styles.hint}>Para aparecer en búsquedas cercanas</Text>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Latitud (40.4168)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={latitude}
              onChangeText={setLatitude}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <TextInput
              style={styles.input}
              placeholder="Longitud (-3.7038)"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
              value={longitude}
              onChangeText={setLongitude}
            />
          </View>
        </View>
      </View>

      <View style={styles.switchContainer}>
        <View style={styles.switchLabel}>
          <Ionicons
            name={isAvailable ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isAvailable ? '#10b981' : '#ef4444'}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.switchTitle}>
              {isAvailable ? 'Disponible para nuevas reservas' : 'No disponible'}
            </Text>
            <Text style={styles.switchSubtitle}>
              {isAvailable
                ? 'Aparecerás en las búsquedas'
                : 'No recibirás nuevas solicitudes'}
            </Text>
          </View>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={setIsAvailable}
          trackColor={{ false: '#64748b', true: '#667eea' }}
          thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {existingProfile ? 'Editar Perfil' : 'Crear Perfil de Paseador'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  s === step && styles.progressDotActive,
                  s < step && styles.progressDotComplete,
                ]}
              >
                {s < step ? (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.progressText,
                      s === step && styles.progressTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
            >
              <Ionicons name="arrow-back" size={20} color="#667eea" />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, { flex: step === 1 ? 1 : 0.6 }]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#94a3b8', '#64748b'] : ['#667eea', '#764ba2']}
              style={styles.nextButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {step === 3 ? (existingProfile ? 'Guardar' : 'Crear perfil') : 'Siguiente'}
                  </Text>
                  {step < 3 && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: '#fff',
  },
  progressDotComplete: {
    backgroundColor: '#10b981',
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  progressTextActive: {
    color: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  textArea: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkboxCard: {
    width: '48%',
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a3142',
    position: 'relative',
  },
  checkboxCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#1e2439',
  },
  serviceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  checkboxLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  checkboxLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkboxDescription: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1a1f2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  chipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a3142',
  },
  switchLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a3142',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  backButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
