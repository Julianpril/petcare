/**
 * Utilidades para conversión de unidades y cálculos de alimento
 */

import { Unit } from './types';

export const convertAmount = (amountKg: number, unit: Unit): string => {
  switch (unit) {
    case 'kg':
      return `${amountKg.toFixed(2)} kg`;
    case 'lbs':
      return `${(amountKg * 2.20462).toFixed(2)} lbs`;
    case 'cups':
      return `${(amountKg * 4).toFixed(1)} tazas`;
    default:
      return `${amountKg.toFixed(2)} kg`;
  }
};

export const foodRecommendation = (breed: string, weight: string, unit: Unit): string => {
  const weightNum = parseFloat(weight);
  const baseAmount = isNaN(weightNum) ? 1 : weightNum * 0.03;
  
  const adjustment: Record<string, number> = {
    'labrador': 1.1,
    'chihuahua': 0.9,
    'persa': 1,
    'siamés': 1,
  };
  
  const adjustedAmount = baseAmount * (adjustment[breed.toLowerCase()] || 1);
  return convertAmount(adjustedAmount, unit);
};

export const generateFeedingSchedule = (breed: string, age: string): string[] => {
  const ageNum = parseInt(age, 10);
  
  // Cachorros menores de 1 año comen 4 veces al día
  if (!isNaN(ageNum) && ageNum < 1) {
    return ['08:00', '12:00', '16:00', '20:00'];
  }
  
  // Horarios específicos por raza
  const schedule: Record<string, string[]> = {
    'labrador': ['07:00', '12:00', '18:00'],
    'chihuahua': ['08:30', '13:30', '19:30'],
  };
  
  return schedule[breed.toLowerCase()] || ['08:00', '13:00', '19:00'];
};
