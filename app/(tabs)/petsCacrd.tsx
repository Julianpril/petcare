//app/(tabs)/petsCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type PetCardProps = {
  name: string;
  breed: string;
  imageUrl: string;
  age?: string;
  weight?: string;
  traits?: string[];
  onPress?: () => void;
};

export default function PetCard({ 
  name, 
  breed, 
  imageUrl, 
  age, 
  weight, 
  traits = [],
  onPress 
}: PetCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.breed}>{breed}</Text>
        
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 2,
  },
  breed: {
    fontSize: 14,
    color: '#AAB4C0',
    marginBottom: 8,
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
});