/**
 * Utilidades para mapeo de datos de mascotas desde la API
 */

import { Pet } from './types';

export const mapPetData = (pet: any): Pet => {
  return {
    id: pet.id,
    name: pet.name ?? 'Mascota',
    breed: pet.breed ?? 'Sin raza',
    imageUrl: pet.image_url || 'https://placehold.co/200x200?text=Pawmi',
    age: pet.age ?? 'Edad no registrada',
    weight: (() => {
      if (typeof pet.weight_kg === 'number') {
        return pet.weight_kg.toString();
      }
      if (typeof pet.weight === 'string') {
        const parsed = parseFloat(pet.weight.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!Number.isNaN(parsed)) {
          return parsed.toString();
        }
      }
      return '0';
    })(),
    traits: pet.traits ?? [],
  };
};
