export interface FormData {
  name: string;
  breed: string;
  age: string;
  weight: string;
  imageUrl: string;
}

export interface BreedSuggestion {
  breed: string;
  confidence: number;
}

export const commonTraits = [
  'Juguetón',
  'Tranquilo',
  'Sociable',
  'Protector',
  'Cariñoso',
  'Energético',
  'Obediente',
  'Independiente',
  'Curioso',
  'Amigable',
];
