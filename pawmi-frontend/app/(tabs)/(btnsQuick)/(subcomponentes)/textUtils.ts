/**
 * Utilidades para procesamiento de texto
 */

import { NEGATIVE_KEYWORDS, POSITIVE_KEYWORDS } from './constants';

export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const parseYesNo = (value: string): boolean | null => {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const tokens = normalized.split(' ');

  for (const phrase of POSITIVE_KEYWORDS) {
    if (phrase.includes(' ')) {
      if (normalized.includes(phrase)) return true;
    } else if (tokens.includes(phrase)) {
      return true;
    }
  }

  for (const phrase of NEGATIVE_KEYWORDS) {
    if (phrase.includes(' ')) {
      if (normalized.includes(phrase)) return false;
    } else if (tokens.includes(phrase)) {
      return false;
    }
  }

  return null;
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};
