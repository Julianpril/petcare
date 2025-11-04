/**
 * Cliente API para predicción de enfermedades
 */

import { apiClient } from './api-client';

export interface DiseasePredictionRequest {
  // Datos demográficos
  animal_type: string;
  size: string;
  age: number;
  life_stage: string;

  // Signos vitales
  weight: number;
  bcs: number;
  body_temperature: number;
  heart_rate: number;
  respiratory_rate: number;

  // Síntomas binarios (0 o 1)
  vomitos?: number;
  diarrea?: number;
  diarrea_hemorragica?: number;
  fiebre?: number;
  letargo?: number;
  deshidratacion?: number;
  tos?: number;
  disnea?: number;
  estornudos?: number;
  secrecion_nasal?: number;
  secrecion_ocular?: number;
  ulceras_orales?: number;
  prurito?: number;
  alopecia?: number;
  otitis?: number;
  dolor_abdominal?: number;
  ictericia?: number;
  hematuria?: number;
  disuria?: number;
  cojera?: number;
  rigidez?: number;
  dolor_articular?: number;
  convulsiones?: number;
  signos_neurologicos?: number;
  hipersalivacion?: number;
  soplo_cardiaco?: number;
  taquipnea?: number;
  
  // Campos adicionales Dataset 3.0
  fever_objective?: number;
  tachycardia?: number;
  disease_cause?: string;
  is_chronic?: number;
  is_seasonal?: number;
  prevalence?: number;
  prognosis?: string;
  vaccination_updated?: number;
}

export interface DiseasePrediction {
  disease: string;
  probability: number;
  confidence: string;
}

export interface DiseasePredictionResponse {
  success: boolean;
  message: string;
  predictions: DiseasePrediction[];
  model_version: string;
  model_info?: {
    accuracy: number;
    cv_mean: number;
    total_classes: number;
    features_used: number;
    model_type: string;
  };
  warning?: string;
}

export interface SymptomsCheckRequest {
  [symptom: string]: number;
}

export interface SymptomsCheckResponse {
  num_symptoms: number;
  active_symptoms: string[];
  urgency_level: string;
  recommendation: string;
  warning: string;
}

export interface PredictWithOllamaRequest {
  user_message: string;
  pet_data: DiseasePredictionRequest;
  pet_name: string;
}

export interface PredictWithOllamaResponse {
  success: boolean;
  predictions: Array<{
    disease: string;
    probability: number;
  }>;
  conversational_response: string;
  symptoms_detected: { [key: string]: number };
  model_info: {
    accuracy: number;
    cv_mean: number;
    total_classes: number;
    features_used: number;
    model_type: string;
  };
}

export const diseaseApi = {
  /**
   * Predice la enfermedad basada en síntomas
   */
  async predictDisease(data: DiseasePredictionRequest): Promise<DiseasePredictionResponse> {
    try {
      const response = await apiClient.post<DiseasePredictionResponse>('/disease/predict', data);
      return response;
    } catch (error: any) {
      console.error('Error en predicción de enfermedad:', error);
      throw new Error(
        error.detail || 'Error al predecir enfermedad'
      );
    }
  },

  /**
   * Verifica sintomatología sin predicción completa
   */
  async checkSymptoms(symptoms: SymptomsCheckRequest): Promise<SymptomsCheckResponse> {
    try {
      const response = await apiClient.post<SymptomsCheckResponse>('/disease/symptoms-check', symptoms);
      return response;
    } catch (error: any) {
      console.error('Error en verificación de síntomas:', error);
      throw new Error(
        error.detail || 'Error al verificar síntomas'
      );
    }
  },

  /**
   * Obtiene información del modelo
   */
  async getModelInfo(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/disease/model-info');
      return response;
    } catch (error: any) {
      console.error('Error obteniendo info del modelo:', error);
      throw new Error(
        error.detail || 'Error al obtener información del modelo'
      );
    }
  },

  /**
   * Extrae síntomas desde texto usando NLP básico
   */
  extractSymptomsFromText(text: string): SymptomsCheckRequest {
    const lowerText = text.toLowerCase();
    const symptoms: SymptomsCheckRequest = {};

    // Mapeo de palabras clave a síntomas
    const symptomKeywords: Record<string, string[]> = {
      vomitos: ['vomit', 'vómito', 'devuelv', 'arcada'],
      diarrea: ['diarrea', 'heces blandas', 'caca líquida', 'deposiciones'],
      diarrea_hemorragica: ['sangre en heces', 'diarrea con sangre', 'heces sangrientas'],
      fiebre: ['fiebre', 'caliente', 'temperatura alta', 'calentura'],
      letargo: ['letargo', 'decaído', 'sin energía', 'cansad', 'débil', 'apátic'],
      deshidratacion: ['deshidrat', 'sed excesiva', 'piel seca'],
      tos: ['tos', 'toser', 'tose'],
      disnea: ['dificultad para respirar', 'respira mal', 'jadeo', 'ahogar'],
      estornudos: ['estornud', 'resfrío', 'resfri'],
      secrecion_nasal: ['mocos', 'secreción nasal', 'nariz mojada', 'moquillo'],
      secrecion_ocular: ['legañas', 'ojos llorosos', 'secreción ocular', 'lágrimas'],
      ulceras_orales: ['úlceras en boca', 'llagas', 'boca lastimada'],
      prurito: ['picazón', 'rascarse', 'comezón', 'prurito', 'rasca'],
      alopecia: ['pérdida de pelo', 'calvicie', 'pelado', 'alopecia'],
      otitis: ['dolor de oído', 'infección oído', 'otitis', 'se rasca oreja'],
      dolor_abdominal: ['dolor abdominal', 'dolor barriga', 'abdomen', 'panza'],
      ictericia: ['amarillo', 'ictericia', 'color amarillento'],
      hematuria: ['sangre en orina', 'orina roja', 'pis con sangre'],
      disuria: ['dificultad para orinar', 'no puede hacer pis', 'dolor al orinar'],
      cojera: ['cojera', 'cojea', 'pata lastimada', 'no apoya pata'],
      rigidez: ['rigidez', 'rígido', 'duro', 'tieso'],
      dolor_articular: ['dolor articular', 'articulaciones', 'dolor artritis'],
      convulsiones: ['convulsiones', 'convulsión', 'espasmos', 'temblores'],
      signos_neurologicos: ['desorientado', 'confuso', 'neurológico'],
      hipersalivacion: ['babea', 'saliva excesiva', 'hipersalivación', 'espuma'],
      soplo_cardiaco: ['soplo', 'corazón', 'cardíaco'],
      taquipnea: ['respiración rápida', 'respira rápido', 'taquipnea'],
    };

    // Detectar síntomas presentes
    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      const hasSymptom = keywords.some((keyword) => lowerText.includes(keyword));
      if (hasSymptom) {
        symptoms[symptom] = 1;
      }
    }

    return symptoms;
  },

  /**
   * NUEVO: Predicción completa usando Ollama
   * Ollama extrae síntomas y formatea respuesta, pero el ML hace la predicción real
   */
  async predictWithOllama(request: PredictWithOllamaRequest): Promise<PredictWithOllamaResponse> {
    try {
      const response = await apiClient.post<PredictWithOllamaResponse>(
        '/disease/predict-with-ollama', 
        request
      );
      return response;
    } catch (error: any) {
      console.error('Error en predicción con Ollama:', error);
      throw new Error(
        error.detail || 'Error al predecir con Ollama'
      );
    }
  },
};
