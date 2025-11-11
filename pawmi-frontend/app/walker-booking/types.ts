export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  size?: string;
}

export interface Walker {
  id: string;
  user: {
    full_name: string;
    profile_image_url?: string;
  };
  hourly_rate: number;
  services: string[];
  city: string;
  neighborhood?: string;
}

export interface ServiceOption {
  value: string;
  label: string;
  duration: number;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { value: 'walking', label: '🚶 Paseo', duration: 1 },
  { value: 'daycare', label: '🏠 Guardería día completo', duration: 8 },
  { value: 'overnight', label: '🌙 Hospedaje (24h)', duration: 24 },
  { value: 'training', label: '🎓 Entrenamiento', duration: 2 },
  { value: 'grooming', label: '✂️ Peluquería', duration: 2 },
];
