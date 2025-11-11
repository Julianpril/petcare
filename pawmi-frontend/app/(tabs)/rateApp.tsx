import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RateAppScreen() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert('Selecciona una calificación', 'Por favor selecciona cuántas estrellas nos das.');
      return;
    }

    Alert.alert(
      '⭐ ¡Gracias por tu opinión!',
      `Valoramos mucho tu calificación de ${rating} estrellas.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calificar la app</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={60} color="#fbbf24" />
          </View>
          <Text style={styles.heroTitle}>¿Qué te parece PawMI?</Text>
          <Text style={styles.heroSubtitle}>
            Tu opinión nos ayuda a mejorar
          </Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Calificación</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#fbbf24' : '#666'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && '😔 Necesitamos mejorar'}
              {rating === 2 && '😕 Podría ser mejor'}
              {rating === 3 && '😊 Está bien'}
              {rating === 4 && '😄 ¡Muy buena!'}
              {rating === 5 && '🎉 ¡Excelente!'}
            </Text>
          )}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>
            Cuéntanos más (opcional)
          </Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="¿Qué te gusta o qué podríamos mejorar?"
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>Enviar calificación</Text>
        </TouchableOpacity>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>¿Por qué calificar PawMI?</Text>
          
          <View style={styles.feature}>
            <Ionicons name="heart" size={24} color="#8B5CF6" />
            <Text style={styles.featureText}>
              Apoyas el desarrollo de nuevas funciones
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.featureText}>
              Ayudas a otros dueños de mascotas a descubrir la app
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="trending-up" size={24} color="#8B5CF6" />
            <Text style={styles.featureText}>
              Contribuyes a mejorar la experiencia para todos
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  commentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  commentLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
});
