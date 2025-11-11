import type { Ionicons } from '@expo/vector-icons';

export type AdoptionStatus = 'available' | 'pending' | 'adopted';

export type Pet = {
  id: string;
  name: string;
  breed: string;
  imageUrl: string;
  age: string;
  weight: string;
  traits: string[];
  animal_type?: string;
  sex?: string;
  medical_history?: string;
  notes?: string;
  is_for_adoption?: boolean;
  adoption_status?: AdoptionStatus;
  adoption_fee?: number;
};

export type ReminderItem = {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  petName?: string | null;
  category: string;
};

export type AdoptionStats = {
  available: number;
  pending: number;
  adopted: number;
};

export type IoniconName = keyof typeof Ionicons.glyphMap;
