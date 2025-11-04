//app/(tabs)/petsCard.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PetCardProps = {
  name: string;
  breed: string;
  imageUrl: string;
  age?: string;
  weight?: string;
  traits?: string[];
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PetCard({ 
  name, 
  breed, 
  imageUrl, 
  age, 
  weight, 
  traits = [],
  onPress,
  onEdit,
  onDelete
}: PetCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar mascota",
      `¿Estás seguro de que quieres eliminar a ${name}? Esta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            onDelete?.();
            setShowActions(false);
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    onEdit?.();
    setShowActions(false);
  };

  // Colores aleatorios para el gradiente del borde de la imagen
  const gradientColors: [string, string][] = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
  ];
  
  const randomGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.95}
      onLongPress={() => setShowActions(!showActions)}
    >
      <View style={styles.cardContent}>
        {/* Image Section with Gradient Border */}
        <View style={styles.imageSection}>
          <LinearGradient
            colors={randomGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imageGradientBorder}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.image} />
            </View>
          </LinearGradient>
          
          {/* Favorite Badge */}
          <View style={styles.favoriteBadge}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.favoriteGradient}
            >
              <Ionicons name="heart" size={14} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{name}</Text>
              <View style={styles.breedRow}>
                <Ionicons name="paw" size={14} color="#94a3b8" />
                <Text style={styles.breed}>{breed}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowActions(!showActions)}
            >
              <View style={styles.menuButtonInner}>
                <Ionicons name="ellipsis-vertical" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Details Grid */}
          {(age || weight) && (
            <View style={styles.detailsGrid}>
              {age && (
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#667eea" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Edad</Text>
                    <Text style={styles.detailValue}>{age}</Text>
                  </View>
                </View>
              )}
              
              {weight && (
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="fitness-outline" size={16} color="#f093fb" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Peso</Text>
                    <Text style={styles.detailValue}>{weight}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Traits */}
          {traits.length > 0 && (
            <View style={styles.traitsContainer}>
              {traits.slice(0, 3).map((trait, index) => (
                <View key={index} style={styles.trait}>
                  <Ionicons name="checkmark-circle" size={12} color="#43e97b" />
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
              {traits.length > 3 && (
                <View style={styles.traitMore}>
                  <Text style={styles.traitMoreText}>+{traits.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Editar</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a6f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Eliminar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Quick Action Button */}
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={onPress}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionGradient}
        >
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageSection: {
    position: 'relative',
    marginRight: 16,
  },
  imageGradientBorder: {
    borderRadius: 20,
    padding: 3,
  },
  imageContainer: {
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 17,
  },
  favoriteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f093fb',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  breedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breed: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  menuButton: {
    marginLeft: 8,
  },
  menuButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  detailIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '700',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  trait: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  traitText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  traitMore: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  traitMoreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  quickActionButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});