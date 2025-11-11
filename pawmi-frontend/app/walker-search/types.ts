export interface Walker {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  certifications: string[];
  hourly_rate: number;
  services: string[];
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km: number;
  accepted_pet_sizes: string[];
  accepted_pet_types: string[];
  is_verified: boolean;
  rating_average?: number;
  total_reviews: number;
  total_walks: number;
  user: {
    full_name: string;
    email: string;
    profile_image_url?: string;
  };
  distance_km?: number;
}

export interface ServiceType {
  value: string;
  label: string;
  icon: string;
}

export interface PetSize {
  value: string;
  label: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  { value: 'walking', label: '🚶 Paseo', icon: 'walk' },
  { value: 'daycare', label: '🏠 Guardería', icon: 'home' },
  { value: 'overnight', label: '🌙 Hospedaje', icon: 'moon' },
  { value: 'training', label: '🎓 Entrenamiento', icon: 'school' },
  { value: 'grooming', label: '✂️ Peluquería', icon: 'cut' },
];

export const PET_SIZES: PetSize[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
  { value: 'giant', label: 'Gigante' },
];
