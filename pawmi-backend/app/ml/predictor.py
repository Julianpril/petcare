"""
Predictor de Enfermedades Veterinarias
Carga el modelo entrenado y hace predicciones basadas en síntomas
"""
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class DiseasePredictor:
    """Predictor de enfermedades basado en síntomas"""
    
    # Lista completa de síntomas que acepta el modelo (43 síntomas binarios)
    SYMPTOM_FEATURES = [
        'fever', 'vomiting', 'diarrhea', 'diarrhea_hemorrhagic', 'loss_appetite', 'lethargy',
        'dehydration', 'abdominal_pain', 'cough', 'nasal_discharge', 'ocular_discharge',
        'sneezing', 'salivation', 'mouth_ulcers', 'conjunctivitis', 'breathing_difficulty',
        'tachypnea', 'weight_loss', 'increased_thirst', 'increased_urination', 'increased_appetite',
        'seizures', 'convulsions', 'neurologic_signs', 'alopecia', 'itching', 'skin_crusts',
        'thickened_skin', 'ear_discharge', 'ear_odor', 'head_shaking', 'limping', 'stiff_gait',
        'difficulty_rising', 'reluctance_to_jump', 'joint_pain', 'hyperactivity', 'unkempt_coat',
        'wheezing', 'open_mouth_breathing', 'dry_cough', 'exercise_intolerance', 'painful_belly'
    ]
    
    # Características demográficas requeridas
    DEMOGRAPHIC_FEATURES = [
        'animal_type', 'age', 'size', 'life_stage', 'weight_kg', 'sex', 'vaccination_up_to_date'
    ]
    
    def __init__(self, model_dir: Optional[str] = None):
        """
        Inicializa el predictor cargando el modelo y encoders
        
        Args:
            model_dir: Directorio donde están los modelos guardados
        """
        if model_dir is None:
            # Por defecto, buscar en pawmi-ml/models/saved_models
            # Path(__file__) = .../pawmi-backend/app/ml/predictor.py
            # parent.parent.parent = .../pawmi-backend/
            # parent.parent.parent.parent = .../ (donde están pawmi-backend/ y pawmi-ml/)
            current_dir = Path(__file__).parent.parent.parent.parent
            self.model_dir: Path = current_dir / 'pawmi-ml' / 'models' / 'saved_models'
        else:
            self.model_dir: Path = Path(model_dir)
        
        self.model: Any = None
        self.encoders: Optional[Dict[str, Any]] = None
        self.is_loaded = False
        
        # Intentar cargar el modelo automáticamente
        try:
            self.load_model()
        except Exception as e:
            logger.warning(f"No se pudo cargar el modelo automáticamente: {e}")
    
    def load_model(self) -> bool:
        """
        Carga el modelo y los encoders desde disco
        
        Returns:
            True si la carga fue exitosa, False en caso contrario
        """
        try:
            # Priorizar el modelo SVM (mejor accuracy ~90%)
            svm_model_path = self.model_dir / 'best_model_svm_(rbf).pkl'
            
            if svm_model_path.exists():
                model_path = svm_model_path
                logger.info(f"🎯 Cargando modelo SVM (90% accuracy) desde: {model_path}")
            else:
                # Buscar cualquier modelo disponible como fallback
                model_files = list(self.model_dir.glob('best_model_*.pkl'))
                
                if not model_files:
                    raise FileNotFoundError(f"No se encontró ningún modelo en {self.model_dir}")
                
                model_path = model_files[0]
                logger.info(f"Cargando modelo desde: {model_path}")
            
            self.model = joblib.load(model_path)
            
            # Cargar encoders y scaler
            encoders_path = self.model_dir / 'encoders_and_scaler.pkl'
            logger.info(f"Cargando encoders desde: {encoders_path}")
            self.encoders = joblib.load(encoders_path)
            
            self.is_loaded = True
            logger.info("✅ Modelo y encoders cargados exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error al cargar el modelo: {e}")
            self.is_loaded = False
            return False
    
    def preprocess_input(
        self, 
        symptoms: Dict[str, int],
        animal_type: str,
        age: float,
        size: str,
        life_stage: str,
        weight_kg: float,
        sex: str,
        vaccination_up_to_date: int  # Changed from str to int (0 or 1)
    ) -> np.ndarray:
        """
        Preprocesa los datos de entrada para el modelo
        
        Args:
            symptoms: Diccionario con síntomas {nombre: valor_binario}
            animal_type: "Perro" o "Gato"
            age: Edad en años
            size: "Small", "Medium", "Large" (English)
            life_stage: "Puppy", "Kitten", "Adult", "Senior" (English)
            weight_kg: Peso en kilogramos
            sex: "Male" o "Female" (English)
            vaccination_up_to_date: 0 o 1 (numeric)
        
        Returns:
            Array numpy con las features procesadas
        """
        if not self.is_loaded or self.encoders is None:
            raise RuntimeError("El modelo no está cargado. Llame a load_model() primero.")
        
        # Crear DataFrame con todos los features en el orden correcto
        features_dict = {
            'animal_type': animal_type,
            'age': age,
            'size': size,
            'life_stage': life_stage,
            'weight_kg': weight_kg,
            'sex': sex,
            'vaccination_up_to_date': vaccination_up_to_date
        }
        
        # Agregar todos los síntomas (0 por defecto si no están presentes)
        for symptom in self.SYMPTOM_FEATURES:
            features_dict[symptom] = symptoms.get(symptom, 0)
        
        # Crear DataFrame
        df = pd.DataFrame([features_dict])
        
        # Aplicar encoders a variables categóricas
        df['animal_type'] = self.encoders['le_animal'].transform(df['animal_type'])
        df['size'] = self.encoders['le_size'].transform(df['size'])
        df['life_stage'] = self.encoders['le_life'].transform(df['life_stage'])
        df['sex'] = self.encoders['le_sex'].transform(df['sex'])
        # vaccination_up_to_date ya es numérico (0 o 1), aplicar encoder directamente
        df['vaccination_up_to_date'] = self.encoders['le_vacc'].transform(df['vaccination_up_to_date'])
        
        # Escalar features numéricas
        numeric_features = ['age', 'weight_kg']
        df[numeric_features] = self.encoders['scaler'].transform(df[numeric_features])
        
        return df.values
    
    def predict(
        self,
        symptoms: Dict[str, int],
        animal_type: str,
        age: float,
        size: str,
        life_stage: str,
        weight_kg: float,
        sex: str,
        vaccination_up_to_date: int,  # Changed from str to int (0 or 1)
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Predice las enfermedades más probables
        
        Args:
            symptoms: Diccionario con síntomas
            animal_type: Tipo de animal
            age: Edad
            size: Tamaño
            life_stage: Etapa de vida
            weight_kg: Peso
            sex: Sexo
            vaccination_up_to_date: Vacunación al día
            top_k: Número de predicciones a retornar
        
        Returns:
            Lista de diccionarios con {disease, probability, confidence}
        """
        if not self.is_loaded:
            raise RuntimeError("El modelo no está cargado. Llame a load_model() primero.")
        
        # Preprocesar entrada
        X = self.preprocess_input(
            symptoms, animal_type, age, size, life_stage, 
            weight_kg, sex, vaccination_up_to_date
        )
        
        # Predecir probabilidades
        if hasattr(self.model, 'predict_proba'):
            probabilities = self.model.predict_proba(X)[0]
            classes = self.model.classes_
        else:
            # Si el modelo no tiene predict_proba, usar predict
            prediction = self.model.predict(X)[0]
            return [{
                'disease': prediction,
                'probability': 1.0,
                'confidence': 'high'
            }]
        
        # Obtener top K predicciones
        top_indices = np.argsort(probabilities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            prob = float(probabilities[idx])
            
            # Clasificar nivel de confianza
            if prob >= 0.7:
                confidence = 'high'
            elif prob >= 0.4:
                confidence = 'medium'
            else:
                confidence = 'low'
            
            results.append({
                'disease': classes[idx],
                'probability': prob,
                'confidence': confidence
            })
        
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Retorna información sobre el modelo cargado
        
        Returns:
            Diccionario con información del modelo
        """
        if not self.is_loaded:
            return {'loaded': False, 'error': 'Modelo no cargado'}
        
        return {
            'loaded': True,
            'model_type': type(self.model).__name__,
            'n_features': len(self.DEMOGRAPHIC_FEATURES) + len(self.SYMPTOM_FEATURES),
            'n_symptoms': len(self.SYMPTOM_FEATURES),
            'symptoms': self.SYMPTOM_FEATURES,
            'demographic_features': self.DEMOGRAPHIC_FEATURES
        }


# Instancia global del predictor (singleton)
_predictor_instance = None


def get_predictor() -> DiseasePredictor:
    """
    Obtiene la instancia global del predictor (patrón singleton)
    
    Returns:
        Instancia de DiseasePredictor
    """
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = DiseasePredictor()
    return _predictor_instance
