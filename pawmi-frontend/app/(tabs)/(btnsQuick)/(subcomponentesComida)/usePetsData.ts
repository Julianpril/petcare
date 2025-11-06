/**
 * Hook para manejar la lógica de datos de mascotas
 */

import { apiClient } from '@/lib/api-client';
import { useCallback, useState } from 'react';
import { mapPetData } from './petMapper';
import { Pet } from './types';

export const usePetsData = (currentUserId?: string) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    if (!currentUserId) {
      setPets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.getPets();
      const mappedPets: Pet[] = (data ?? []).map(mapPetData);

      setPets(mappedPets);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError('No se pudo obtener la información de tus mascotas.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  return {
    pets,
    loading,
    error,
    fetchPets,
  };
};
