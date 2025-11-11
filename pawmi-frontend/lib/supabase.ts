import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Avoid AsyncStorage on web/SSR; Supabase falls back to browser storage automatically.
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos para las tablas
export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
  role: 'user' | 'admin' | 'shelter';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  shelter_name?: string;
  shelter_description?: string;
  shelter_license?: string;
  is_verified_shelter?: boolean;
};

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed?: string;
  age?: string;
  age_years?: number;
  weight?: string;
  weight_kg?: number;
  gender?: 'Male' | 'Female' | 'Unknown';
  color?: string;
  microchip_id?: string;
  image_url?: string;
  medical_history?: string;
  allergies?: string[];
  traits?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  pet_id: string;
  user_id: string;
  category: 'vacuna' | 'desparasitacion' | 'consulta' | 'peluqueria' | 'alimento' | 'paseo' | 'otro';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  time?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  is_completed: boolean;
  completed_at?: string;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type HealthRecord = {
  id: string;
  pet_id: string;
  record_type: 'consultation' | 'vaccination' | 'deworming' | 'surgery' | 'injury' | 'illness' | 'checkup' | 'test';
  title: string;
  description?: string;
  diagnosis?: string;
  symptoms?: string[];
  temperature?: number;
  weight_at_visit?: number;
  veterinarian_name?: string;
  clinic_name?: string;
  visit_date: string;
  next_visit_date?: string;
  prescriptions?: string;
  attachments?: string[];
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Diagnosis = {
  id: string;
  symptom_id?: string;
  pet_id: string;
  predicted_disease: string;
  confidence_score?: number;
  model_version?: string;
  input_features?: any;
  raw_prediction?: any;
  recommendations?: string[];
  urgency_level?: 'low' | 'medium' | 'high' | 'emergency';
  requires_vet_visit: boolean;
  veterinarian_confirmed: boolean;
  confirmed_diagnosis?: string;
  vet_notes?: string;
  created_at: string;
  updated_at: string;
};
