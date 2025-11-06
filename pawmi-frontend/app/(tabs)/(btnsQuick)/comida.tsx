import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../../lib/auth-context';
import EmptyState from './(subcomponentesComida)/EmptyState';
import ErrorState from './(subcomponentesComida)/ErrorState';
import FoodHeader from './(subcomponentesComida)/FoodHeader';
import LoadingState from './(subcomponentesComida)/LoadingState';
import PetFoodCard from './(subcomponentesComida)/PetFoodCard';
import { Unit } from './(subcomponentesComida)/types';
import UnitSelector from './(subcomponentesComida)/UnitSelector';
import { usePetsData } from './(subcomponentesComida)/usePetsData';

export default function FoodScreen() {
  const { currentUser } = useAuth();
  const [unit, setUnit] = useState<Unit>('kg');
  
  const { pets, loading, error, fetchPets } = usePetsData(currentUser?.id);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <FoodHeader 
          title="Recomendaciones" 
          subtitle="Planes de alimentación personalizados" 
        />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <FoodHeader 
          title="Recomendaciones" 
          subtitle="Planes de alimentación personalizados" 
        />
        <ErrorState message={error} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FoodHeader 
        title="Recomendaciones de Comida" 
        subtitle="Planes de alimentación personalizados" 
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <UnitSelector selectedUnit={unit} onUnitChange={setUnit} />

        {pets.map(pet => (
          <PetFoodCard key={pet.id} pet={pet} unit={unit} />
        ))}

        {pets.length === 0 && <EmptyState />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
});