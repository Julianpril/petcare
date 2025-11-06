/**
 * Tipos para el sistema de recomendaciones de comida
 */

export type Pet = {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age: string;
  weight: string;
  traits: string[];
};

export type Unit = 'kg' | 'lbs' | 'cups';
