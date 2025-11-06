/**
 * Utilidades para preparar datos de mascotas para predicción
 */

import { FeatureKey, SymptomOverrides } from './constants';
import { Pet } from './types';

export const extractAnswersFromConversation = (
  conversationContext: string,
  pet: Pet,
  symptomOverrides: SymptomOverrides
): Record<string, any> => {
  const answers: Record<string, any> = {};
  
  // Información básica de la mascota
  const speciesMap: { [key: string]: string } = {
    'dog': 'perro',
    'cat': 'gato',
    'Dog': 'perro',
    'Cat': 'gato'
  };
  answers['q_especie'] = speciesMap[pet.species || 'dog'] || 'perro';
  
  // Edad
  let petAge = 1;
  if (pet.age_years) {
    petAge = typeof pet.age_years === 'number' ? pet.age_years : parseFloat(pet.age_years as string);
  } else if (pet.age) {
    const ageMatch = (pet.age as string).match(/[\d.]+/);
    petAge = ageMatch ? parseFloat(ageMatch[0]) : 1;
  }
  answers['q_edad'] = petAge < 1 ? `${Math.round(petAge * 12)} meses` : `${petAge} años`;
  
  // Vacunas (default: sí)
  answers['q_vacunas'] = 'sí';
  
  // Mapear síntomas de overrides al formato del prediagnosis
  const symptomMapping: Record<FeatureKey, string> = {
    'vomitos': 'q_vomitos',
    'diarrea': 'q_diarrea',
    'diarrea_hemorragica': 'q_diarrea',
    'fiebre': 'q_fiebre',
    'letargo': 'q_decaimiento',
    'deshidratacion': 'q_deshidratacion',
    'tos': 'q_tos',
    'disnea': 'q_dificultad_respiratoria',
    'dolor_abdominal': 'q_dolor_abdominal',
    'convulsiones': 'q_convulsiones',
    'signos_neurologicos': 'q_signos_neurologicos',
    'estornudos': 'q_estornudos',
    'secrecion_nasal': 'q_secrecion_nasal',
    'is_chronic': 'q_duracion',
    'is_seasonal': 'q_estacional',
  };
  
  // Procesar overrides
  Object.entries(symptomOverrides).forEach(([key, value]) => {
    const mappedKey = symptomMapping[key as FeatureKey];
    if (mappedKey) {
      if (key === 'diarrea_hemorragica' && value === 1) {
        answers['q_diarrea'] = 'diarrea con sangre';
      } else if (key === 'diarrea' && value === 1 && !answers['q_diarrea']) {
        answers['q_diarrea'] = 'diarrea sin sangre';
      } else {
        answers[mappedKey] = value === 1 ? 'sí' : 'no';
      }
    }
  });
  
  // Analizar el contexto de conversación para extraer síntomas adicionales
  const lowerContext = conversationContext.toLowerCase();
  
  // Mapeo de palabras clave a IDs de preguntas
  const keywordMapping: Record<string, string[]> = {
    'q_fiebre': ['fiebre', 'calentura', 'temperatura alta'],
    'q_vomitos': ['vomito', 'vomitos', 'nausea', 'devuelve'],
    'q_diarrea': ['diarrea', 'caca liquida', 'heces blandas'],
    'q_tos': ['tos', 'tose'],
    'q_decaimiento': ['decaido', 'letargo', 'debil', 'cansado', 'sin energia', 'apatico'],
    'q_deshidratacion': ['deshidratado', 'deshidratacion'],
    'q_dificultad_respiratoria': ['respira mal', 'disnea', 'ahogo', 'falta aire'],
    'q_perdida_apetito': ['no come', 'sin apetito', 'no quiere comer'],
    'q_convulsiones': ['convulsion', 'temblor', 'ataque'],
  };
  
  Object.entries(keywordMapping).forEach(([questionId, keywords]) => {
    if (!answers[questionId]) {
      const hasSymptom = keywords.some(keyword => lowerContext.includes(keyword));
      answers[questionId] = hasSymptom ? 'sí' : 'no';
    }
  });
  
  return answers;
};

export const preparePetData = (
  pet: Pet,
  _userInput: string,
  symptomOverrides: SymptomOverrides = {}
) => {
  // Usar species (Dog/Cat) de la DB, convertir a español
  const speciesMap: { [key: string]: string } = {
    'dog': 'Perro',
    'cat': 'Gato',
    'Dog': 'Perro',
    'Cat': 'Gato'
  };
  const animalType = speciesMap[pet.species || 'dog'] || 'Perro';
  
  // Usar age_years directo de la DB
  let petAge = 1;
  if (pet.age_years) {
    petAge = typeof pet.age_years === 'number' ? pet.age_years : parseFloat(pet.age_years as string);
  } else if (pet.age) {
    const ageMatch = (pet.age as string).match(/[\d.]+/);
    petAge = ageMatch ? parseFloat(ageMatch[0]) : 1;
  }
  
  // Usar weight_kg directo de la DB
  let petWeight = 15;
  if (pet.weight_kg) {
    petWeight = typeof pet.weight_kg === 'number' ? pet.weight_kg : parseFloat(pet.weight_kg as string);
  } else if (pet.weight) {
    const weightMatch = (pet.weight as string).match(/[\d.]+/);
    petWeight = weightMatch ? parseFloat(weightMatch[0]) : 15;
  }
  
  // Determinar size según el peso y la raza (IMPORTANTE: usar valores en inglés del dataset)
  let size = 'Medium';  // Valores del modelo: 'Small', 'Medium', 'Large'
  if (animalType === 'Gato') {
    size = 'Small';
  } else {
    // Para perros, usar peso
    if (petWeight < 10) size = 'Small';
    else if (petWeight < 25) size = 'Medium';
    else size = 'Large';
  }
  
  // Determinar life_stage según edad (IMPORTANTE: usar valores en inglés del dataset)
  // Valores del modelo: 'Puppy', 'Kitten', 'Adult', 'Senior'
  let lifeStage = 'Adult';
  if (petAge < 1) {
    lifeStage = animalType === 'Gato' ? 'Kitten' : 'Puppy';
  } else if (petAge >= 7) {
    lifeStage = 'Senior';
  } else {
    lifeStage = 'Adult';
  }
  
  // 🔍 DEBUG: Log para verificar datos de la mascota
  console.log(`📋 Preparando datos de ${pet.name}:`, {
    animal_type: animalType,
    size: size,
    age: petAge,
    life_stage: lifeStage,
    weight: petWeight,
    breed: pet.breed
  });
  
  const baseData = {
    animal_type: animalType,
    size: size,  // Usar el size calculado, no el de la DB
    age: petAge,
    life_stage: lifeStage,
    weight: petWeight,
    bcs: 5,
    body_temperature: 38.5,
    heart_rate: 100,
    respiratory_rate: 25,
    vomitos: 0, diarrea: 0, diarrea_hemorragica: 0, fiebre: 0,
    letargo: 0, deshidratacion: 0, tos: 0, disnea: 0,
    estornudos: 0, secrecion_nasal: 0, secrecion_ocular: 0,
    ulceras_orales: 0, prurito: 0, alopecia: 0, otitis: 0,
    dolor_abdominal: 0, ictericia: 0, hematuria: 0, disuria: 0,
    cojera: 0, rigidez: 0, dolor_articular: 0, convulsiones: 0,
    signos_neurologicos: 0, hipersalivacion: 0, soplo_cardiaco: 0,
    taquipnea: 0,
    fever_objective: 0, tachycardia: 0,
    is_chronic: 0, is_seasonal: 0, prevalence: 0.5,
    vaccination_updated: 1,
  };

  Object.entries(symptomOverrides).forEach(([key, value]) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      (baseData as Record<string, number | string>)[key] = value;
    }
  });

  // 🔍 DEBUG: Log de overrides aplicados
  console.log('🎯 Overrides aplicados:', symptomOverrides);
  console.log('📊 Datos finales enviados al modelo:', baseData);

  return baseData;
};
