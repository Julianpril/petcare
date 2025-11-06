/**
 * Utilidades para detección de síntomas desde texto
 */

import { SymptomOverrides } from './constants';
import { normalizeText } from './textUtils';

export const detectSymptomsFromText = (description: string): SymptomOverrides => {
  const normalized = normalizeText(description);
  const symptoms: SymptomOverrides = {};

  if (normalized.includes('vomito') || normalized.includes('nausea')) {
    symptoms.vomitos = 1;
  }
  if (normalized.includes('diarrea')) {
    symptoms.diarrea = 1;
    // Detectar diarrea hemorrágica
    if (
      normalized.includes('hemorragic') ||
      normalized.includes('sangre') ||
      normalized.includes('sangrienta') ||
      normalized.includes('con sangre')
    ) {
      symptoms.diarrea_hemorragica = 1;
    }
  }
  if (normalized.includes('fiebre') || normalized.includes('temperatura')) {
    symptoms.fiebre = 1;
  }
  if (normalized.includes('tos') || normalized.includes('tose')) {
    symptoms.tos = 1;
  }
  // Estornudos
  if (
    normalized.includes('estornudo') ||
    normalized.includes('estornuda') ||
    normalized.includes('estornudar')
  ) {
    symptoms.estornudos = 1;
  }
  // Secreción nasal
  if (
    normalized.includes('secrecion nasal') ||
    normalized.includes('moco') ||
    normalized.includes('nariz con') ||
    normalized.includes('congestion')
  ) {
    symptoms.secrecion_nasal = 1;
  }
  if (
    normalized.includes('respira') ||
    normalized.includes('disnea') ||
    normalized.includes('dificultad para respirar')
  ) {
    symptoms.disnea = 1;
  }
  if (
    normalized.includes('decaido') ||
    normalized.includes('letargo') ||
    normalized.includes('debil') ||
    normalized.includes('cansado') ||
    normalized.includes('sin energia') ||
    normalized.includes('apatico')
  ) {
    symptoms.letargo = 1;
  }
  if (normalized.includes('deshidrat')) {
    symptoms.deshidratacion = 1;
  }
  if (normalized.includes('convulsion') || normalized.includes('temblor')) {
    symptoms.convulsiones = 1;
  }

  return symptoms;
};
