import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, View } from 'react-native';
import PetModal from './adoptarModal/petModal';
import AdoptarHeader from './adoptarModal/subComponentes/AdoptarHeader';
import PetsList from './adoptarModal/subComponentes/PetsList';
import SearchAndFilters from './adoptarModal/subComponentes/SearchAndFilters';

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
  contactInfo: { shelter: string; phone: string; email: string };
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
  const [dataSource, setDataSource] = useState<'database' | 'fallback' | null>(null);
  const API_URL = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/public/adoptions`;

  const fallbackWeightBySize: Record<string, string> = {
    pequeno: '8 kg',
    pequeno_gato: '4 kg',
    mediano: '18 kg',
    grande: '30 kg',
  };

  const normalizeTrait = (trait: string) => {
    const value = trait.trim();
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const mapApiDataToPet = (animal: any): AdoptablePet => {
    const descriptionText = (animal.descripcion ?? '').toString();
    const keywordTraits = ['esterilizado', 'vacunado', 'jugueton', 'tranquil', 'activ', 'amigable', 'sociable', 'carinos']
      .filter(keyword => {
        if (keyword === 'esterilizado') return Boolean(animal.esterilizado);
        if (keyword === 'vacunado') return Boolean(animal.vacunas_al_dia);
        return descriptionText.toLowerCase().includes(keyword);
      })
      .map(normalizeTrait);

    const backendTraits: string[] = Array.isArray(animal.caracteristicas)
      ? animal.caracteristicas.filter(Boolean).map((trait: string) => normalizeTrait(trait))
      : Array.isArray(animal.traits)
        ? animal.traits.filter(Boolean).map((trait: string) => normalizeTrait(trait))
        : [];

    const traits = Array.from(new Set([...keywordTraits, ...backendTraits]));

  const rawSize = (animal.tamaño ?? animal.tamano ?? '').toString().toLowerCase();
  const normalizedSize = rawSize.replace('ñ', 'n');

    const weightFromBackend = typeof animal.peso_texto === 'string' && animal.peso_texto.trim()
      ? animal.peso_texto
      : typeof animal.peso_kg === 'number' && !Number.isNaN(animal.peso_kg)
        ? `${Number.isInteger(animal.peso_kg) ? animal.peso_kg : animal.peso_kg.toFixed(1)} kg`
        : undefined;

    const weightNumeric = typeof animal.peso_kg === 'number' && !Number.isNaN(animal.peso_kg)
      ? animal.peso_kg
      : (() => {
          const candidate = (animal.peso_texto ?? animal.weight ?? '').toString();
          const match = candidate.match(/(\d+(?:[\.,]\d+)?)/);
          return match ? parseFloat(match[1].replace(',', '.')) : null;
        })();

    const inferredWeight = weightFromBackend
      ?? fallbackWeightBySize[normalizedSize as keyof typeof fallbackWeightBySize]
      ?? fallbackWeightBySize[`${normalizedSize}_gato` as keyof typeof fallbackWeightBySize]
      ?? 'Peso no disponible';

    const ageNumeric = typeof animal.edad === 'number'
      ? animal.edad
      : parseInt(String(animal.edad ?? '').replace(/[^0-9]/g, ''), 10);
    const safeAge = Number.isFinite(ageNumeric) ? Math.max(0, ageNumeric) : undefined;
    const ageLabel = safeAge !== undefined ? `${safeAge} año${safeAge === 1 ? '' : 's'}` : 'Edad no disponible';

    const city = (animal.ciudad ?? animal.refugio?.ciudad ?? 'Ciudad no disponible').toString();
    const region = (animal.departamento ?? animal.refugio?.departamento ?? '').toString();
    const location = region ? `${city}, ${region}` : city;

    const defaultShelterLabel = city === 'Ciudad no disponible' ? 'Refugio Pawmi' : `Refugio ${city}`;
    const shelterLabel = (animal.refugio?.nombre ?? defaultShelterLabel).toString();
    const emailSlugBase = (animal.refugio?.ciudad ?? animal.ciudad ?? city).toString();
    const emailSlug = emailSlugBase.toLowerCase().replace(/[^a-z0-9]/g, '') || 'refugiopawmi';
    const providedEmail = typeof animal.refugio?.email === 'string' ? animal.refugio.email : null;
    const contactEmail = providedEmail && providedEmail.includes('@') ? providedEmail : `adopciones@${emailSlug}.org`;
    const contactPhone = (animal.refugio?.telefono ?? '+57 300 123 4567').toString();

    const genderRaw = (animal.sexo ?? '').toString().toLowerCase();
    const gender = genderRaw.startsWith('h')
      ? 'Hembra'
      : genderRaw.startsWith('m')
        ? 'Macho'
        : 'Desconocido';

    const imageUrl = animal.foto_url || animal.image_url || `https://picsum.photos/400/300?random=${animal.id}`;
    const breed = (animal.raza ?? 'Sin raza').toString();
    const rawSpecies = (animal.especie ?? '').toString().toLowerCase();
    let species = 'Otro';
    if (rawSpecies.includes('perro') || rawSpecies === 'dog') {
      species = 'Perro';
    } else if (rawSpecies.includes('gato') || rawSpecies === 'cat') {
      species = 'Gato';
    } else if (rawSpecies.trim().length > 0) {
      species = rawSpecies.charAt(0).toUpperCase() + rawSpecies.slice(1);
    }

    const normalizedSizeLabel = normalizedSize || (() => {
      if (typeof weightNumeric === 'number') {
        if (weightNumeric < 10) return 'pequeno';
        if (weightNumeric < 25) return 'mediano';
        return 'grande';
      }
      return 'desconocido';
    })();

    return {
      id: String(animal.id),
      name: (animal.nombre ?? 'Mascota').toString(),
      breed,
      species,
      size: normalizedSizeLabel,
      imageUrl,
      age: ageLabel,
      weight: inferredWeight,
      weightValue: typeof weightNumeric === 'number' ? Number(weightNumeric.toFixed(1)) : null,
      gender,
      location,
      description: descriptionText || 'Descripcion no disponible.',
      traits,
      isVaccinated: Boolean(animal.vacunas_al_dia),
      isNeutered: Boolean(animal.esterilizado),
      contactInfo: { shelter: shelterLabel, phone: contactPhone, email: contactEmail },
    };
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Solicitud fallida con codigo ${response.status}`);
        }

        const data = await response.json();
        setDataSource(data?.source ?? null);
        const animales = Array.isArray(data?.animales) ? data.animales : [];
        const mapped = animales.map(mapApiDataToPet);
        setPets(mapped);
        setFilteredPets(mapped);
        setError('');
      } catch (err) {
        console.error('Error al obtener mascotas disponibles para adopcion:', err);
        setDataSource(null);
        setError('Error al cargar las mascotas');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [API_URL]);

  useEffect(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    setFilteredPets(pets.filter(pet => {
      const speciesLower = pet.species.toLowerCase();
      const matchesFilter = (() => {
        switch (selectedFilter) {
          case 'dog':
            return speciesLower === 'perro';
          case 'cat':
            return speciesLower === 'gato';
          case 'small': {
            if (pet.size.toLowerCase() === 'pequeno') return true;
            const numericWeight = typeof pet.weightValue === 'number' ? pet.weightValue : parseFloat(pet.weight);
            return Number.isFinite(numericWeight) && numericWeight < 15;
          }
          case 'all':
          default:
            return true;
        }
      })();

      if (!matchesFilter) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        pet.name,
        pet.breed,
        pet.species,
        pet.location,
        pet.contactInfo.shelter,
      ];

      return haystack.some(field => field && field.toLowerCase().includes(normalizedSearch));
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
      {dataSource === 'fallback' && (
        <View style={styles.infoBanner}>
          <Feather name="info" size={16} color="#94a3b8" style={styles.infoIcon} />
          <Text style={styles.infoText}>Mostrando mascotas de ejemplo mientras los refugios publican nuevas adopciones.</Text>
        </View>
      )}
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
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#1c2b3a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#203346' },
  infoIcon: { marginTop: 2 },
  infoText: { color: '#cbd5e1', fontSize: 12, flex: 1, lineHeight: 18, marginLeft: 8 },
});