export interface WalkerProfile {
  id: string;
  user_id: string;
  bio: string;
  experience_years: number;
  certifications: string[];
  hourly_rate: number;
  services: string[];
  availability_schedule: any;
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km: number;
  accepted_pet_sizes: string[];
  accepted_pet_types: string[];
  is_verified: boolean;
  background_check_completed: boolean;
  total_walks: number;
  rating_average?: number;
  total_reviews: number;
  profile_photos: string[];
  user: {
    full_name: string;
    email: string;
    phone?: string;
    profile_image_url?: string;
  };
  distance_km?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  service_type: string;
  service_date: string;
  created_at: string;
  reviewer: {
    full_name: string;
    profile_image_url?: string;
  };
}

export const SERVICE_ICONS: { [key: string]: string } = {
  walking: 'walk',
  daycare: 'home',
  overnight: 'moon',
  training: 'school',
  grooming: 'cut',
};

export const SERVICE_LABELS: { [key: string]: string } = {
  walking: 'Paseo',
  daycare: 'Guardería',
  overnight: 'Hospedaje',
  training: 'Entrenamiento',
  grooming: 'Peluquería',
};

export const PET_SIZE_LABELS: { [key: string]: string } = {
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
  giant: 'Gigante',
};

export const PET_TYPE_LABELS: { [key: string]: string } = {
  dog: '🐕 Perros',
  cat: '🐈 Gatos',
  other: '🐾 Otros',
};
