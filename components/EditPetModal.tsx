//components/EditPetModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  onSave: (updatedPet: Pet) => void;
}

const availableTraits = [
  'Juguetón', 'Cariñoso', 'Tranquilo', 'Activo', 'Inteligente', 
  'Protector', 'Sociable', 'Independiente', 'Obediente', 'Curioso'
];

const EditPetModal: React.FC<EditPetModalProps> = ({ visible, pet, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    imageUrl: '',
    age: '',
    weight: '',
    traits: [] as string[],
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed,
        imageUrl: pet.imageUrl,
        age: pet.age,
        weight: pet.weight,
        traits: pet.traits,
      });
    }
  }, [pet]);

  const handleSave = () => {
    // Validaciones básicas
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!formData.breed.trim()) {
      Alert.alert('Error', 'La raza es requerida');
      return;
    }

    if (pet) {
      const updatedPet: Pet = {
        ...pet,
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        imageUrl: formData.imageUrl.trim() || pet.imageUrl,
        age: formData.age.trim() || pet.age,
        weight: formData.weight.trim() || pet.weight,
        traits: formData.traits,
      };

      onSave(updatedPet);
      onClose();
    }
  };

  const handleTraitToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter(t => t !== trait)
        : [...prev.traits, trait]
    }));
  };

  const resetForm = () => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed,
        imageUrl: pet.imageUrl,
        age: pet.age,
        weight: pet.weight,
        traits: pet.traits,
      });
    }
  };

  if (!pet) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar Mascota</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#EAEAEA" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Imagen actual */}
            <View style={styles.imageSection}>
              <Image source={{ uri: formData.imageUrl }} style={styles.currentImage} />
              <Text style={styles.imageLabel}>Imagen actual</Text>
            </View>

            {/* Campos del formulario */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="heart" size={16} color="#47a9ff" /> Nombre *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la mascota"
                placeholderTextColor="#AAB4C0"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="tag" size={16} color="#47a9ff" /> Raza *
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Raza de la mascota"
                placeholderTextColor="#AAB4C0"
                value={formData.breed}
                onChangeText={(text) => setFormData(prev => ({ ...prev, breed: text }))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="calendar" size={16} color="#47a9ff" /> Edad
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2 años"
                placeholderTextColor="#AAB4C0"
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="activity" size={16} color="#47a9ff" /> Peso
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25 kg"
                placeholderTextColor="#AAB4C0"
                value={formData.weight}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="link" size={16} color="#47a9ff" /> URL de imagen
              </Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor="#AAB4C0"
                value={formData.imageUrl}
                onChangeText={(text) => setFormData(prev => ({ ...prev, imageUrl: text }))}
                multiline
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                <Feather name="star" size={16} color="#47a9ff" /> Características
              </Text>
              <View style={styles.traitsGrid}>
                {availableTraits.map((trait) => (
                  <TouchableOpacity
                    key={trait}
                    style={[
                      styles.traitChip,
                      formData.traits.includes(trait) && styles.traitChipSelected
                    ]}
                    onPress={() => handleTraitToggle(trait)}
                  >
                    <Text style={[
                      styles.traitText,
                      formData.traits.includes(trait) && styles.traitTextSelected
                    ]}>
                      {trait}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Feather name="x" size={18} color="#ff6f61" />
              <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 36, 50, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#122432',
    borderRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A38',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EAEAEA',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#47a9ff',
  },
  imageLabel: {
    color: '#AAB4C0',
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#EAEAEA',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#1E2A38',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E2A38',
    color: '#EAEAEA',
    fontSize: 16,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#AAB4C0',
    backgroundColor: 'transparent',
  },
  traitChipSelected: {
    backgroundColor: '#47a9ff',
    borderColor: '#47a9ff',
  },
  traitText: {
    fontSize: 12,
    color: '#AAB4C0',
  },
  traitTextSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff6f61',
  },
  saveButton: {
    backgroundColor: '#47a9ff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelText: {
    color: '#ff6f61',
  },
});

export default EditPetModal;