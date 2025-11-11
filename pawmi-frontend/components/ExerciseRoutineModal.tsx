/**
 * Modal para mostrar la rutina de ejercicio generada por IA
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ExerciseRoutineModalProps = {
  visible: boolean;
  petName: string;
  routine: string | null;
  loading: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');

export default function ExerciseRoutineModal({ 
  visible, 
  petName, 
  routine, 
  loading, 
  onClose 
}: ExerciseRoutineModalProps) {
  // Función para parsear markdown simple
  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      // Títulos
      if (line.startsWith('###')) {
        elements.push(
          <Text key={index} style={styles.h3}>
            {line.replace(/###/g, '').trim()}
          </Text>
        );
      } else if (line.startsWith('##')) {
        elements.push(
          <Text key={index} style={styles.h2}>
            {line.replace(/##/g, '').trim()}
          </Text>
        );
      } else if (line.startsWith('#')) {
        elements.push(
          <Text key={index} style={styles.h1}>
            {line.replace(/#/g, '').trim()}
          </Text>
        );
      }
      // Listas
      else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        elements.push(
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              {line.replace(/^[\-\*]\s*/, '').trim()}
            </Text>
          </View>
        );
      }
      // Texto en negrita
      else if (line.includes('**')) {
        const parts = line.split('**');
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, i) => 
              i % 2 === 1 ? <Text key={i} style={styles.bold}>{part}</Text> : part
            )}
          </Text>
        );
      }
      // Líneas vacías
      else if (line.trim() === '') {
        elements.push(<View key={index} style={{ height: 8 }} />);
      }
      // Texto normal
      else if (line.trim()) {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
    
    return elements;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonInner}>
                <Ionicons name="close" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="barbell" size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Rutina de Ejercicio</Text>
              <Text style={styles.subtitle}>Para {petName}</Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#43e97b" />
                <Text style={styles.loadingText}>
                  🤖 Generando rutina personalizada con IA...
                </Text>
                <Text style={styles.loadingSubtext}>
                  Analizando las características de {petName}
                </Text>
              </View>
            ) : routine ? (
              <View style={styles.routineContainer}>
                <View style={styles.aiLabel}>
                  <Ionicons name="sparkles" size={14} color="#43e97b" />
                  <Text style={styles.aiLabelText}>Generado con Gemini AI</Text>
                </View>
                
                {renderMarkdownText(routine)}
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#f5576c" />
                <Text style={styles.errorText}>
                  No se pudo generar la rutina
                </Text>
                <Text style={styles.errorSubtext}>
                  Por favor intenta nuevamente
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '95%',
    overflow: 'hidden',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  routineContainer: {
    gap: 4,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  aiLabelText: {
    fontSize: 12,
    color: '#43e97b',
    fontWeight: '600',
  },
  h1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#43e97b',
    marginTop: 16,
    marginBottom: 10,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4facfe',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#43e97b',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    color: '#f5576c',
    marginTop: 16,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
});
