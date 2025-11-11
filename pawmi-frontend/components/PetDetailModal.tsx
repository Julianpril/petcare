/**
 * Modal detallado de mascota con toda la información
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { apiClient } from '../lib/api-client';
import ExerciseRoutineModal from './ExerciseRoutineModal';

type Pet = {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age?: string;
  weight?: string;
  traits?: string[];
  animal_type?: string;
  sex?: string;
  medical_history?: string;
  notes?: string;
};

type PetDetailModalProps = {
  visible: boolean;
  pet: Pet | null;
  onClose: () => void;
  onEdit?: () => void;
};

const { width } = Dimensions.get('window');

export default function PetDetailModal({ visible, pet, onClose, onEdit }: PetDetailModalProps) {
  const sheetHeight = Math.min(Dimensions.get('screen').height * 0.96, 820);
  const [routineModalVisible, setRoutineModalVisible] = useState(false);
  const [routine, setRoutine] = useState<string | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(false);

  if (!pet) return null;

  const handleGenerateRoutine = async () => {
    try {
      setLoadingRoutine(true);
      setRoutine(null);
      setRoutineModalVisible(true);

      const response = await apiClient.generateExerciseRoutine(pet.id);
      setRoutine(response.routine);
    } catch (error: any) {
      console.error('Error generando rutina:', error);
      setRoutineModalVisible(false);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo generar la rutina. Verifica que el backend tenga configurada la API key de Gemini.'
      );
    } finally {
      setLoadingRoutine(false);
    }
  };

  const gradientColors: [string, string][] = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
  ];

  const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: sheetHeight }]}>
          {/* Header con imagen */}
          <View style={styles.header}>
            <LinearGradient
              colors={randomGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <View style={styles.closeButtonInner}>
                  <Ionicons name="close" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={styles.imageSection}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: pet.imageUrl }} style={styles.petImage} />
                </View>
                <View style={styles.favoriteBadge}>
                  <Ionicons name="heart" size={20} color="#ff6b6b" />
                </View>
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <View style={styles.breedRow}>
                  <Ionicons name="paw" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Info Cards */}
            <View style={styles.quickInfoGrid}>
              {pet.animal_type && (
                <View style={styles.infoCard}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.infoIconContainer}
                  >
                    <Ionicons name="paw-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>{pet.animal_type}</Text>
                </View>
              )}

              {pet.age && (
                <View style={styles.infoCard}>
                  <LinearGradient
                    colors={['#43e97b', '#38f9d7']}
                    style={styles.infoIconContainer}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.infoLabel}>Edad</Text>
                  <Text style={styles.infoValue}>{pet.age}</Text>
                </View>
              )}

              {pet.weight && (
                <View style={styles.infoCard}>
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.infoIconContainer}
                  >
                    <Ionicons name="fitness-outline" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.infoLabel}>Peso</Text>
                  <Text style={styles.infoValue}>{pet.weight}</Text>
                </View>
              )}

              {pet.sex && (
                <View style={styles.infoCard}>
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.infoIconContainer}
                  >
                    <Ionicons 
                      name={pet.sex.toLowerCase() === 'macho' ? 'male' : 'female'} 
                      size={20} 
                      color="#fff" 
                    />
                  </LinearGradient>
                  <Text style={styles.infoLabel}>Sexo</Text>
                  <Text style={styles.infoValue}>{pet.sex}</Text>
                </View>
              )}
            </View>

            {/* Características */}
            {pet.traits && pet.traits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star-outline" size={20} color="#667eea" />
                  <Text style={styles.sectionTitle}>Características</Text>
                </View>
                <View style={styles.traitsContainer}>
                  {pet.traits.map((trait, index) => (
                    <View key={index} style={styles.trait}>
                      <Ionicons name="checkmark-circle" size={14} color="#43e97b" />
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Historial médico */}
            {pet.medical_history && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medical-outline" size={20} color="#f093fb" />
                  <Text style={styles.sectionTitle}>Historial Médico</Text>
                </View>
                <View style={styles.textCard}>
                  <Text style={styles.textContent}>{pet.medical_history}</Text>
                </View>
              </View>
            )}

            {/* Notas */}
            {pet.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#4facfe" />
                  <Text style={styles.sectionTitle}>Notas</Text>
                </View>
                <View style={styles.textCard}>
                  <Text style={styles.textContent}>{pet.notes}</Text>
                </View>
              </View>
            )}

            {/* Botón de generar rutina de ejercicio */}
            <TouchableOpacity 
              style={styles.aiButton} 
              onPress={handleGenerateRoutine}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiButtonGradient}
              >
                <Ionicons name="barbell" size={22} color="#fff" />
                <Text style={styles.aiButtonText}>Generar rutina de ejercicio con IA</Text>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón de editar */}
            {onEdit && (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => {
                  onEdit();
                  onClose();
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.editButtonGradient}
                >
                  <Ionicons name="create-outline" size={22} color="#fff" />
                  <Text style={styles.editButtonText}>Editar información</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Modal de rutina de ejercicio */}
      <ExerciseRoutineModal
        visible={routineModalVisible}
        petName={pet.name}
        routine={routine}
        loading={loadingRoutine}
        onClose={() => setRoutineModalVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  imageWrapper: {
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  petImage: {
    width: 160,
    height: 160,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 0,
    right: width / 2 - 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  headerInfo: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petBreed: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    width: (width - 72) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: -0.3,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trait: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  traitText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  textCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textContent: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    fontWeight: '500',
  },
  aiButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#43e97b',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  aiButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  editButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});
