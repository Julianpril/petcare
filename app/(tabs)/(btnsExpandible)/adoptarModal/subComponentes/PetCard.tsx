import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type AdoptablePet = {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string;
  gender: 'Macho' | 'Hembra'; location: string; description: string; traits: string[];
  isVaccinated: boolean; isNeutered: boolean; contactInfo: { shelter: string; phone: string; email: string };
};

const PetCard = ({ pet, onPress }: { pet: AdoptablePet; onPress: () => void }) => (
  <TouchableOpacity style={styles.petCard} onPress={onPress}>
    <Image source={{ uri: pet.imageUrl }} style={styles.petImage} defaultSource={{ uri: `https://picsum.photos/400/300?random=${pet.id}` }} />
    <View style={styles.petInfo}>
      <View style={styles.petHeader}>
        <Text style={styles.petName}>{pet.name}</Text>
        <View style={styles.genderBadge}><Text style={styles.genderText}>{pet.gender}</Text></View>
      </View>
      <Text style={styles.petBreed}>{pet.breed}</Text>
      <Text style={styles.petDetails}>{`${pet.age} • ${pet.weight} • ${pet.location}`}</Text>
      <View style={styles.traitsContainer}>
        {pet.traits.slice(0, 3).map((trait, i) => <View key={i} style={styles.traitBadge}><Text style={styles.traitText}>{trait}</Text></View>)}
      </View>
      <View style={styles.healthInfo}>
        {pet.isVaccinated && <View style={styles.healthBadge}><Feather name="shield" size={12} color="#68d391" /><Text style={styles.healthText}>Vacunado</Text></View>}
        {pet.isNeutered && <View style={styles.healthBadge}><Feather name="check-circle" size={12} color="#68d391" /><Text style={styles.healthText}>Esterilizado</Text></View>}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  petCard: { backgroundColor: '#1E2A38', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  petImage: { width: '100%', height: 200, backgroundColor: '#2A3441' },
  petInfo: { padding: 16 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  petName: { fontSize: 20, fontWeight: '600', color: '#EAEAEA', flex: 1 },
  genderBadge: { backgroundColor: '#47a9ff20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  genderText: { color: '#47a9ff', fontSize: 12, fontWeight: '500' },
  petBreed: { fontSize: 16, color: '#AAB4C0', marginBottom: 4 },
  petDetails: { fontSize: 14, color: '#AAB4C0', marginBottom: 12 },
  traitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  traitBadge: { backgroundColor: '#68d39120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  traitText: { color: '#68d391', fontSize: 12 },
  healthInfo: { flexDirection: 'row', gap: 12 },
  healthBadge: { flexDirection: 'row', alignItems: 'center' },
  healthText: { color: '#68d391', fontSize: 12, marginLeft: 4 },
});

export default PetCard;