//app/(tabs)/petsCard.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.breed}>{breed}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowActions(!showActions)}
          >
            <Feather name="more-vertical" size={20} color="#AAB4C0" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailsContainer}>
          {age && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Edad</Text>
              <Text style={styles.detailValue}>{age}</Text>
            </View>
          )}
          
          {weight && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Peso</Text>
              <Text style={styles.detailValue}>{weight}</Text>
            </View>
          )}
        </View>

        {traits.length > 0 && (
          <View style={styles.traitsContainer}>
            {traits.map((trait, index) => (
              <View key={index} style={styles.trait}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        )}

        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <Feather name="edit-2" size={16} color="#47a9ff" />
              <Text style={[styles.actionText, styles.editText]}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={16} color="#ff6f61" />
              <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E2A38',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 12,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 2,
  },
  breed: {
    fontSize: 14,
    color: '#AAB4C0',
  },
  menuButton: {
    padding: 4,
    borderRadius: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detail: {
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#AAB4C0',
  },
  detailValue: {
    fontSize: 14,
    color: '#EAEAEA',
    fontWeight: '500',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  trait: {
    backgroundColor: 'rgba(255, 111, 97, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  traitText: {
    fontSize: 11,
    color: '#ff6f61',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A3A4A',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editButton: {
    borderColor: '#47a9ff',
    backgroundColor: 'rgba(71, 169, 255, 0.1)',
  },
  deleteButton: {
    borderColor: '#ff6f61',
    backgroundColor: 'rgba(255, 111, 97, 0.1)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editText: {
    color: '#47a9ff',
  },
  deleteText: {
    color: '#ff6f61',
  },
});