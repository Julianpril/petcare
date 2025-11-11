import { Ionicons } from '@expo/vector-icons';

export type IoniconName = keyof typeof Ionicons.glyphMap;

export interface Pet {
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
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  petName?: string | null;
  category: string;
}

export type QuickActionRoute =
  | '/(tabs)/(btnsQuick)/saludChat'
  | '/(tabs)/(btnsQuick)/(recordatorios)/recordatorios'
  | '/(tabs)/(btnsQuick)/comida'
  | '/walker-search';

export interface QuickAction {
  icon: IoniconName;
  label: string;
  route: QuickActionRoute;
  gradient: [string, string];
}
