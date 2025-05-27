import { Feather } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

type AdoptablePet = {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string;
  gender: 'Macho' | 'Hembra'; location: string; description: string; traits: string[];
  isVaccinated: boolean; isNeutered: boolean; contactInfo: { shelter: string; phone: string; email: string };
};

const PetModal = ({ pet, visible, onClose, onAdopt }: { pet: AdoptablePet; visible: boolean; onClose: () => void; onAdopt: (pet: AdoptablePet) => void }) => {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#EAEAEA" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles</Text>
        <TouchableOpacity onPress={() => onAdopt(pet)}><Feather name="heart" size={24} color="#ff6f61" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.modalContent}>
        <Image source={{ uri: pet.imageUrl }} style={styles.modalImage} defaultSource={{ uri: `https://picsum.photos/400/300?random=${pet.id}` }} />
        <View style={styles.modalSection}>
          <View style={styles.petHeader}>
            <Text style={styles.modalPetName}>{pet.name}</Text>
            <View style={styles.genderBadge}><Text style={styles.genderText}>{pet.gender}</Text></View>
          </View>
          <Text style={styles.modalPetBreed}>{pet.breed}</Text>
          <View style={styles.locationContainer}><Feather name="map-pin" size={16} color="#AAB4C0" /><Text style={styles.modalLocation}>{pet.location}</Text></View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}><Feather name="calendar" size={16} color="#47a9ff" /><Text style={styles.statText}>{pet.age}</Text></View>
            <View style={styles.statItem}><Feather name="activity" size={16} color="#47a9ff" /><Text style={styles.statText}>{pet.weight}</Text></View>
          </View>
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{pet.description}</Text>
        </View>
        {pet.traits.length > 0 && (
          <View style={styles.modalSection}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.traitsContainer}>{pet.traits.map((trait, i) => <View key={i} style={styles.traitBadge}><Text style={styles.traitText}>{trait}</Text></View>)}</View>
          </View>
        )}
        <View style={styles.modalSection}>
          <Text style={styles.sectionTitle}>Estado de Salud</Text>
          <View style={styles.healthStatusContainer}>
            <View style={[styles.healthStatus, pet.isVaccinated ? styles.healthGood : styles.healthBad]}>
              <Feather name={pet.isVaccinated ? "check-circle" : "x-circle"} size={16} color={pet.isVaccinated ? "#68d391" : "#ff6f61"} />
              <Text style={[styles.healthStatusText, { color: pet.isVaccinated ? "#68d391" : "#ff6f61" }]}>{pet.isVaccinated ? "Vacunado" : "Sin vacunar"}</Text>
            </View>
            <View style={[styles.healthStatus, pet.isNeutered ? styles.healthGood : styles.healthBad]}>
              <Feather name={pet.isNeutered ? "check-circle" : "x-circle"} size={16} color={pet.isNeutered ? "#68d391" : "#ff6f61"} />
              <Text style={[styles.healthStatusText, { color: pet.isNeutered ? "#68d391" : "#ff6f61" }]}>{pet.isNeutered ? "Esterilizado" : "Sin esterilizar"}</Text>
            </View>
          </View>
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <View style={styles.contactItem}><Feather name="home" size={16} color="#AAB4C0" /><Text style={styles.contactText}>{pet.contactInfo.shelter}</Text></View>
          <View style={styles.contactItem}><Feather name="phone" size={16} color="#AAB4C0" /><Text style={styles.contactText}>{pet.contactInfo.phone}</Text></View>
          <View style={styles.contactItem}><Feather name="mail" size={16} color="#AAB4C0" /><Text style={styles.contactText}>{pet.contactInfo.email}</Text></View>
        </View>
        <TouchableOpacity style={styles.adoptButton} onPress={() => onAdopt(pet)}>
          <Feather name="heart" size={20} color="#EAEAEA" />
          <Text style={styles.adoptButtonText}>¡Me interesa adoptar a {pet.name}!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122432' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#1E2A38' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#EAEAEA' },
  modalContent: { padding: 20 },
  modalImage: { width: '100%', height: 300, borderRadius: 16, marginBottom: 20, backgroundColor: '#2A3441' },
  modalSection: { marginBottom: 24 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalPetName: { fontSize: 28, fontWeight: '700', color: '#EAEAEA', flex: 1 },
  genderBadge: { backgroundColor: '#47a9ff20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  genderText: { color: '#47a9ff', fontSize: 12, fontWeight: '500' },
  modalPetBreed: { fontSize: 18, color: '#AAB4C0', marginBottom: 8 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  modalLocation: { fontSize: 16, color: '#AAB4C0', marginLeft: 8 },
  statsContainer: { flexDirection: 'row', gap: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#EAEAEA', fontSize: 14, marginLeft: 6, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#EAEAEA', marginBottom: 12 },
  description: { color: '#AAB4C0', fontSize: 16, lineHeight: 24 },
  traitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitBadge: { backgroundColor: '#68d39120', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  traitText: { color: '#68d391', fontSize: 14 },
  healthStatusContainer: { gap: 12 },
  healthStatus: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  healthGood: { backgroundColor: '#68d39120' },
  healthBad: { backgroundColor: '#ff6f6120' },
  healthStatusText: { fontSize: 14, marginLeft: 8, fontWeight: '500' },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  contactText: { color: '#AAB4C0', fontSize: 16, marginLeft: 12 },
  adoptButton: { flexDirection: 'row', backgroundColor: '#47a9ff', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginVertical: 20, elevation: 3, shadowColor: '#47a9ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  adoptButtonText: { color: '#EAEAEA', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});

export default PetModal;