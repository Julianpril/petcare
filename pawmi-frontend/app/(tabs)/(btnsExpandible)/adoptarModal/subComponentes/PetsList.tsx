// components/PetsList.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PetCard from './PetCard';

type AdoptablePet = {
  id: string;
  name: string;
  breed: string;
  species: string;
  size: string;
  imageUrl: string;
  age: string;
  weight: string;
  weightValue?: number | null;
  gender: 'Macho' | 'Hembra' | 'Desconocido';
  location: string;
  description: string;
  traits: string[];
  isVaccinated: boolean;
  isNeutered: boolean;
  contactInfo: {
    shelter: string;
    phone: string;
    email: string;
  };
};

type PetsListProps = {
  pets: AdoptablePet[];
  onPetPress: (pet: AdoptablePet) => void;
};

const PetsList = ({ pets, onPetPress }: PetsListProps) => {
  return (
    <ScrollView contentContainerStyle={styles.petsList}>
      {pets.map(pet => (
        <PetCard 
          key={pet.id} 
          pet={pet} 
          onPress={() => onPetPress(pet)} 
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  petsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default PetsList;