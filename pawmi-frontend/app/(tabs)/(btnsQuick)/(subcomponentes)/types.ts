/**
 * Tipos compartidos para el chat de salud
 */

export interface Message {
  id: string;
  text: string;
  from: 'user' | 'bot';
  type?: 'normal' | 'pet-selector' | 'diagnosis' | 'welcome';
  pets?: Pet[];
  diagnosisData?: DiagnosisData;
  timestamp?: Date;
}

export interface Pet {
  id: string;
  name: string;
  animal_type: string;
  species?: string;
  breed?: string;
  age: number | string;
  weight?: number | string;
  size?: string;
  image_url?: string;
}

export interface DiagnosisData {
  predictions: Array<{
    disease: string;
    probability: number;
  }>;
  symptoms_detected: { [key: string]: number };
  model_info: {
    accuracy: number;
    cv_mean: number;
    total_classes: number;
    features_used: number;
    model_type: string;
  };
}
