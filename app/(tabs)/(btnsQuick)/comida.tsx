import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Pet = {
  id: string; name: string; breed: string; imageUrl: string; age: string; weight: string; traits: string[];
};

type Unit = 'kg' | 'lbs' | 'cups';

const convertAmount = (amountKg: number, unit: Unit): string => {
  switch (unit) {
    case 'kg': return `${amountKg.toFixed(2)} kg`;
    case 'lbs': return `${(amountKg * 2.20462).toFixed(2)} lbs`;
    case 'cups': return `${(amountKg * 4).toFixed(1)} tazas`;
    default: return `${amountKg.toFixed(2)} kg`;
  }
};

const foodRecommendation = (breed: string, weight: string, unit: Unit): string => {
  const weightNum = parseFloat(weight);
  const baseAmount = isNaN(weightNum) ? 1 : weightNum * 0.03;
  const adjustment: Record<string, number> = { 'labrador': 1.1, 'chihuahua': 0.9, 'persa': 1, 'siamés': 1 };
  const adjustedAmount = baseAmount * (adjustment[breed.toLowerCase()] || 1);
  return convertAmount(adjustedAmount, unit);
};

const generateFeedingSchedule = (breed: string, age: string): string[] => {
  const ageNum = parseInt(age, 10);
  if (!isNaN(ageNum) && ageNum < 1) return ['08:00', '12:00', '16:00', '20:00'];
  const schedule: Record<string, string[]> = { 'labrador': ['07:00', '12:00', '18:00'], 'chihuahua': ['08:30', '13:30', '19:30'] };
  return schedule[breed.toLowerCase()] || ['08:00', '13:00', '19:00'];
};

export default function FoodScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit>('kg');

  useEffect(() => {
    fetch('https://mocki.io/v1/42b89a90-f013-4f30-a5db-759b0b33aab7')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch pets'))
      .then(data => { setPets(data); setLoading(false); })
      .catch(err => { setError('No se pudo obtener la información de tus mascotas.'); setLoading(false); console.error(err); });
  }, []);

  if (loading) return <View style={styles.container}><Text style={styles.statusText}>Cargando información...</Text></View>;
  if (error) return <View style={styles.container}><Text style={styles.statusText}>{error}</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recomendaciones de comida</Text>
      <View style={styles.unitSelector}>
        {(['kg', 'lbs', 'cups'] as Unit[]).map(u => (
          <TouchableOpacity key={u} onPress={() => setUnit(u)} style={[styles.unitButton, unit === u && styles.unitButtonActive]}>
            <Text style={[styles.unitButtonText, unit === u && styles.unitButtonTextActive]}>{u.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {pets.map(pet => {
        const schedule = generateFeedingSchedule(pet.breed, pet.age);
        return (
          <View key={pet.id} style={styles.card}>
            <Image source={{ uri: pet.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.detail}>Raza: {pet.breed}</Text>
              <Text style={styles.detail}>Edad: {pet.age}</Text>
              <Text style={styles.detail}>Peso: {pet.weight} kg</Text>
              <Text style={styles.recommendation}>🍽 {foodRecommendation(pet.breed, pet.weight, unit)} al día</Text>
              <Text style={styles.scheduleTitle}>🕒 Horarios recomendados:</Text>
              {schedule.map((time, idx) => <Text key={idx} style={styles.detail}>• {time}</Text>)}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#122432' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#EAEAEA', marginBottom: 10, textAlign: 'center' },
  statusText: { color: '#EAEAEA', textAlign: 'center', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#1E2A38', borderRadius: 16, marginBottom: 20, flexDirection: 'row', padding: 16, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  image: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },
  info: { flex: 1, justifyContent: 'center' },
  name: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  detail: { color: '#AAB4C0', fontSize: 14 },
  recommendation: { color: '#68d391', fontWeight: '600', marginTop: 8 },
  scheduleTitle: { color: '#FFD700', fontWeight: '600', marginTop: 8, fontSize: 14 },
  unitSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
  unitButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#AAB4C0' },
  unitButtonActive: { backgroundColor: '#68d391', borderColor: '#68d391' },
  unitButtonText: { color: '#AAB4C0', fontWeight: '600' },
  unitButtonTextActive: { color: '#1E2A38' },
});