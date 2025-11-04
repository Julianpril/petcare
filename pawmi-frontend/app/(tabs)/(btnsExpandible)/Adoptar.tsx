import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AdoptarHeader from './adoptarModal/subComponentes/AdoptarHeader';
import SearchAndFilters from './adoptarModal/subComponentes/SearchAndFilters';
import PetsList from './adoptarModal/subComponentes/PetsList';
import PetModal from './adoptarModal/petModal';

type AdoptablePet = {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string;
  gender: 'Macho' | 'Hembra'; location: string; description: string; traits: string[];
  isVaccinated: boolean; isNeutered: boolean; contactInfo: { shelter: string; phone: string; email: string };
};

type FilterType = 'all' | 'dog' | 'cat' | 'small';

export default function AdoptarScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<AdoptablePet[]>([]);
  const [filteredPets, setFilteredPets] = useState<AdoptablePet[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedPet, setSelectedPet] = useState<AdoptablePet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = 'https://mocki.io/v1/1f548744-5b76-4d2f-bdf2-edb7c5a186b7';

  const mapApiDataToPet = (animal: any): AdoptablePet => {
    const traits = ['esterilizado', 'vacunado', 'juguetón', 'tranquil', 'activ', 'amigable', 'sociable', 'cariños']
      .filter(k => animal[k === 'esterilizado' ? 'esterilizado' : k === 'vacunado' ? 'vacunas_al_dia' : 'descripcion'].toString().toLowerCase().includes(k))
      .map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const weightBySize = { 'pequeño': `${Math.floor(Math.random() * 10) + 2} kg`, 'mediano': `${Math.floor(Math.random() * 15) + 10} kg`, 'grande': `${Math.floor(Math.random() * 20) + 25} kg` };
    return {
      id: animal.id, name: animal.nombre, breed: animal.raza,
      imageUrl: animal.foto_url || `https://picsum.photos/400/300?random=${animal.id}`,
      age: `${animal.edad} año${animal.edad > 1 ? 's' : ''}`,
      weight: weightBySize[(animal.tamaño?.toLowerCase() as 'pequeño' | 'mediano' | 'grande')] || `${Math.floor(Math.random() * 15) + 5} kg`,
      gender: animal.sexo as 'Macho' | 'Hembra', location: `${animal.ciudad}, ${animal.departamento}`,
      description: animal.descripcion, traits, isVaccinated: animal.vacunas_al_dia, isNeutered: animal.esterilizado,
      contactInfo: { shelter: `Refugio ${animal.ciudad}`, phone: '+57 300 123 4567', email: `adopciones@refugio${animal.ciudad.toLowerCase()}.org` }
    };
  };

  useEffect(() => {
    fetch(API_URL).then(res => res.ok ? res.json() : Promise.reject('Error al obtener datos'))
      .then(data => { const mapped = data.animales.map(mapApiDataToPet); setPets(mapped); setFilteredPets(mapped); setLoading(false); })
      .catch(err => { console.error(err); setError('Error al cargar las mascotas'); setLoading(false); });
  }, []);

  useEffect(() => {
    setFilteredPets(pets.filter(pet => {
      const type = selectedFilter === 'all' ||
        (selectedFilter === 'dog' && (pet.breed.toLowerCase().includes('perro') || ['retriever', 'labrador', 'bulldog', 'beagle', 'poodle', 'pitbull', 'cocker'].some(b => pet.breed.toLowerCase().includes(b)))) ||
        (selectedFilter === 'cat' && (pet.breed.toLowerCase().includes('gato') || ['angora', 'siames', 'persa'].some(b => pet.breed.toLowerCase().includes(b)))) ||
        (selectedFilter === 'small' && parseFloat(pet.weight) < 15);
      const search = !searchText.trim() || [pet.name, pet.breed, pet.location].some(f => f.toLowerCase().includes(searchText.toLowerCase()));
      return type && search;
    }));
  }, [selectedFilter, searchText, pets]);

  const handleAdoptionInterest = (pet: AdoptablePet) => Alert.alert(
    `Interés en adoptar a ${pet.name}`,
    `Refugio: ${pet.contactInfo.shelter}\nTeléfono: ${pet.contactInfo.phone}\nEmail: ${pet.contactInfo.email}\n\nCondiciones: ${pet.description}`,
    [{ text: 'Cancelar', style: 'cancel' }, { text: 'Contactar', onPress: () => { Alert.alert('¡Genial!', 'Te contactaremos pronto para coordinar la adopción.'); setModalVisible(false); } }]
  );

  const handlePetPress = (pet: AdoptablePet) => { setSelectedPet(pet); setModalVisible(true); };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#47a9ff" /></View>;
  if (error) return <View style={styles.errorContainer}><Feather name="alert-triangle" size={32} color="#ff6f61" /><Text style={styles.errorText}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <AdoptarHeader onBackPress={() => router.back()} />
      <SearchAndFilters searchText={searchText} onSearchChange={setSearchText} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} resultsCount={filteredPets.length} />
      <PetsList pets={filteredPets} onPetPress={handlePetPress} />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        {selectedPet && <PetModal pet={selectedPet} visible={modalVisible} onClose={() => setModalVisible(false)} onAdopt={handleAdoptionInterest} />}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122432' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#122432' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#122432', padding: 20 },
  errorText: { color: '#ff6f61', fontSize: 18, marginTop: 16, textAlign: 'center' },
});