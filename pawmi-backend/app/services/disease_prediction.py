"""
Servicio de predicción de enfermedades usando el modelo ML entrenado
"""
import logging
import os
from pathlib import Path
from typing import Any, Dict, List

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class DiseasePredictionService:
    """
    Servicio para predicción de enfermedades en mascotas
    """
    
    def __init__(self):
        self.model = None
        self.encoders = None
        self.features_info = None
        self.model_loaded = False
        self.model_features: List[str] | None = None
        
    def load_model(self) -> bool:
        """
        Carga el modelo y encoders desde disco
        
        Returns:
            bool: True si carga exitosa, False si falla
        """
        try:
            # Ruta al directorio de modelos (en el backend)
            base_dir = Path(__file__).resolve().parent.parent.parent
            models_dir = base_dir / "models"
            
            model_path = models_dir / "disease_prediction_model.pkl"
            encoders_path = models_dir / "encoders.pkl"
            features_path = models_dir / "features_info.pkl"
            
            # Verificar que existan los archivos
            if not model_path.exists():
                logger.error(f"Modelo no encontrado en: {model_path}")
                return False
            
            if not encoders_path.exists():
                logger.error(f"Encoders no encontrados en: {encoders_path}")
                return False
                
            if not features_path.exists():
                logger.error(f"Features info no encontrado en: {features_path}")
                return False
            
            # Cargar modelo y encoders
            logger.info(f"Cargando modelo desde: {model_path}")
            self.model = joblib.load(model_path)
            
            logger.info(f"Cargando encoders desde: {encoders_path}")
            self.encoders = joblib.load(encoders_path)
            
            logger.info(f"Cargando features info desde: {features_path}")
            self.features_info = joblib.load(features_path)
            
            self.model_loaded = True
            self.model_features = list(self.model.feature_names_in_) if hasattr(self.model, "feature_names_in_") else None
            logger.info("✅ Modelo de predicción de enfermedades cargado exitosamente")
            logger.info(f"   Features: {len(self.features_info['feature_names'])}")
            logger.info(f"   Test Accuracy: {self.features_info.get('test_accuracy', 'N/A')}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error cargando modelo de enfermedades: {str(e)}")
            self.model_loaded = False
            return False
    
    def preprocess_input(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Preprocesa los datos de entrada para el modelo
        
        Args:
            input_data: Diccionario con datos del paciente
            
        Returns:
            DataFrame procesado listo para predicción
        """
        # 🔍 DEBUG: Log de síntomas recibidos
        symptoms_received = {k: v for k, v in input_data.items() if isinstance(v, int) and v > 0}
        logger.info(f"🩺 Síntomas recibidos del frontend: {symptoms_received}")
        
        # Crear DataFrame con nombres de columnas estandarizados
        data = {
            'Animal_Type': input_data['animal_type'],
            'Size': input_data['size'],
            'Age': input_data['age'],
            'Life_Stage': input_data['life_stage'],
            'Weight': input_data['weight'],
            'BCS': input_data['bcs'],
            'Body_Temperature': input_data['body_temperature'],
            'Heart_Rate': input_data['heart_rate'],
            'Respiratory_Rate': input_data['respiratory_rate'],
            
            # Síntomas (capitalizar primera letra)
            'Vomitos': input_data.get('vomitos', 0),
            'Diarrea': input_data.get('diarrea', 0),
            'Diarrea_hemorragica': input_data.get('diarrea_hemorragica', 0),
            'Fiebre': input_data.get('fiebre', 0),
            'Letargo': input_data.get('letargo', 0),
            'Deshidratacion': input_data.get('deshidratacion', 0),
            'Tos': input_data.get('tos', 0),
            'Disnea': input_data.get('disnea', 0),
            'Estornudos': input_data.get('estornudos', 0),
            'Secrecion_nasal': input_data.get('secrecion_nasal', 0),
            'Secrecion_ocular': input_data.get('secrecion_ocular', 0),
            'Ulceras_orales': input_data.get('ulceras_orales', 0),
            'Prurito': input_data.get('prurito', 0),
            'Alopecia': input_data.get('alopecia', 0),
            'Otitis': input_data.get('otitis', 0),
            'Dolor_abdominal': input_data.get('dolor_abdominal', 0),
            'Ictericia': input_data.get('ictericia', 0),
            'Hematuria': input_data.get('hematuria', 0),
            'Disuria': input_data.get('disuria', 0),
            'Cojera': input_data.get('cojera', 0),
            'Rigidez': input_data.get('rigidez', 0),
            'Dolor_articular': input_data.get('dolor_articular', 0),
            'Convulsiones': input_data.get('convulsiones', 0),
            'Signos_neurologicos': input_data.get('signos_neurologicos', 0),
            'Hipersalivacion': input_data.get('hipersalivacion', 0),
            'Soplo_cardiaco': input_data.get('soplo_cardiaco', 0),
            'Taquipnea': input_data.get('taquipnea', 0),
        }
        data['Fever_Objective'] = input_data.get('fever_objective', 0)
        data['Tachycardia'] = input_data.get('tachycardia', 0)
        data['Is_Chronic'] = input_data.get('is_chronic', 0)
        data['Is_Seasonal'] = input_data.get('is_seasonal', 0)
        data['Prevalence'] = input_data.get('prevalence', 0.5)
        data['Vaccination_Updated'] = input_data.get('vaccination_updated', 1)
        
        df = pd.DataFrame([data])
        
        # Codificar variables categóricas
        df_encoded = df.copy()
        
        # Verificar que encoders estén cargados
        if not self.encoders:
            raise ValueError("Encoders no están cargados")
        
        # Encoders principales
        le_animal = self.encoders['animal_encoder']
        le_size = self.encoders['size_encoder']
        le_life = self.encoders['life_encoder']
        
        # Mapeo de valores comunes a valores del encoder (Dataset 3.1)
        # El modelo espera: Animal_Type=['Gato', 'Perro'], Size=['grande', 'mediano', 'pequeño'], Life_Stage=['adulto', 'cachorro/gatito', 'maduro', 'senior']
        animal_type_mapping = {
            'dog': 'Perro',
            'cat': 'Gato',
            'perro': 'Perro',
            'gato': 'Gato',
        }
        
        size_mapping = {
            'small': 'pequeño',
            'medium': 'mediano',
            'large': 'grande',
            'pequeño': 'pequeño',
            'pequeno': 'pequeño',
            'mediano': 'mediano',
            'grande': 'grande',
        }
        
        life_stage_mapping = {
            'cachorro': 'cachorro/gatito',
            'gatito': 'cachorro/gatito',
            'puppy': 'cachorro/gatito',
            'kitten': 'cachorro/gatito',
            'joven': 'adulto',  # Mapear joven a adulto
            'young': 'adulto',
            'adulto': 'adulto',
            'adult': 'adulto',
            'maduro': 'maduro',
            'mature': 'maduro',
            'senior': 'senior',
            'geriatrico': 'senior',
            'geriátrico': 'senior',
        }
        
        # Transformar con mapeo
        animal_value = df['Animal_Type'].iloc[0]
        animal_mapped = animal_type_mapping.get(animal_value.lower(), animal_value)
        
        size_value = df['Size'].iloc[0]
        size_mapped = size_mapping.get(size_value.lower(), size_value)
        
        life_value = df['Life_Stage'].iloc[0]
        life_mapped = life_stage_mapping.get(life_value.lower(), life_value)
        
        # Log de mapeo para debugging
        logger.info(f"Mapeando valores: animal={animal_value}→{animal_mapped}, size={size_value}→{size_mapped}, life={life_value}→{life_mapped}")
        
        try:
            df_encoded['Animal_Type'] = le_animal.transform([animal_mapped])[0]
        except ValueError as e:
            logger.warning(f"Valor de animal_type desconocido: {animal_value}. Clases disponibles: {le_animal.classes_}. Usando primer valor.")
            df_encoded['Animal_Type'] = le_animal.transform([le_animal.classes_[0]])[0]
            
        try:
            df_encoded['Size'] = le_size.transform([size_mapped])[0]
        except ValueError as e:
            logger.warning(f"Valor de size desconocido: {size_value}. Clases disponibles: {le_size.classes_}. Usando primer valor.")
            df_encoded['Size'] = le_size.transform([le_size.classes_[0]])[0]
            
        try:
            df_encoded['Life_Stage'] = le_life.transform([life_mapped])[0]
        except ValueError as e:
            logger.warning(f"Valor de life_stage desconocido: {life_value}. Clases disponibles: {le_life.classes_}. Usando primer valor.")
            df_encoded['Life_Stage'] = le_life.transform([le_life.classes_[0]])[0]
        
  
        # Normalizar usando el scaler guardado durante el entrenamiento
        scaler = self.encoders['scaler']
        scaler_features = list(scaler.feature_names_in_)
        
        # Asegurar presencia de todas las columnas esperadas por el scaler
        for feature in scaler_features:
            if feature not in df_encoded.columns:
                df_encoded[feature] = 0
        
        # Transformar respetando el orden exacto usado en el fit
        scaled_values = scaler.transform(df_encoded[scaler_features])[0]
        scaled_map = {feature: value for feature, value in zip(scaler_features, scaled_values)}
        
        # Determinar el orden final de features según el modelo entrenado
        if self.model_features:
            final_features = self.model_features
        elif self.features_info and 'feature_names' in self.features_info:
            final_features = self.features_info['feature_names']
        else:
            final_features = list(df_encoded.columns)
        
        # Construir vector final asegurando orden y valores correctos
        feature_vector = {}
        for feature in final_features:
            if feature in ['Animal_Type', 'Size', 'Life_Stage']:
                feature_vector[feature] = float(df_encoded[feature].iloc[0])
            elif feature in scaled_map:
                feature_vector[feature] = float(scaled_map[feature])
            else:
                if feature in df_encoded.columns:
                    feature_vector[feature] = float(df_encoded[feature].iloc[0])
                else:
                    feature_vector[feature] = 0.0
                    logger.warning(f"Feature '{feature}' no encontrada en entrada. Se rellena con 0.")
        
        df_final = pd.DataFrame([feature_vector], columns=final_features)
        logger.info(f"✅ Vector final preparado con {len(final_features)} features")
        return df_final
    
    async def predict_disease(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predice la enfermedad más probable basada en síntomas
        
        Args:
            input_data: Diccionario con datos del paciente
            
        Returns:
            Diccionario con predicciones
        """
        if not self.model_loaded:
            success = self.load_model()
            if not success:
                return {
                    "success": False,
                    "message": "Modelo no disponible. Contacte al administrador.",
                    "predictions": []
                }
        
        try:
            # Preprocesar entrada
            X = self.preprocess_input(input_data)
            
            # Verificar que el modelo esté cargado
            if not self.model:
                raise ValueError("Modelo no está cargado")
            
            # Hacer predicción numérica
            prediction_numeric = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Convertir predicción numérica a nombre de enfermedad usando disease_encoder
            if self.encoders and 'disease_encoder' in self.encoders:
                disease_encoder = self.encoders['disease_encoder']
                classes = disease_encoder.classes_
                logger.info(f"✅ Usando disease_encoder para convertir clases: {len(classes)} enfermedades")
            else:
                # Fallback a clases del modelo (por compatibilidad)
                classes = self.model.classes_
                logger.warning("⚠️ disease_encoder no encontrado, usando model.classes_")
            
            # Crear lista de predicciones con probabilidades
            predictions_list = [
                {"disease": str(disease), "probability": float(prob)}
                for disease, prob in zip(classes, probabilities)
            ]
            
            # Log de predicciones
            top_predictions_log = [(p['disease'], f"{p['probability']:.3f}") for p in sorted(predictions_list, key=lambda x: x['probability'], reverse=True)[:3]]
            logger.info(f"📊 Predicciones: {top_predictions_log}")
            
            # Ordenar por probabilidad descendente
            predictions_list.sort(key=lambda x: x['probability'], reverse=True)
            
            # Tomar top 3
            top_3 = predictions_list[:3]
            
            # Agregar nivel de confianza
            for pred in top_3:
                if pred['probability'] >= 0.7:
                    pred['confidence'] = 'alta'
                elif pred['probability'] >= 0.4:
                    pred['confidence'] = 'media'
                else:
                    pred['confidence'] = 'baja'
            
            # Mensaje personalizado según confianza
            top_prob = top_3[0]['probability']
            if top_prob >= 0.8:
                message = f"Predicción de alta confianza: {top_3[0]['disease']} ({top_prob*100:.1f}%)"
            elif top_prob >= 0.5:
                message = f"Predicción probable: {top_3[0]['disease']} ({top_prob*100:.1f}%)"
            else:
                message = "Múltiples enfermedades posibles. Se recomienda evaluación veterinaria."
            
            return {
                "success": True,
                "message": message,
                "predictions": top_3,
                "model_version": "4.0-realistic",
                "model_info": {
                    "accuracy": self.features_info.get('test_accuracy', 'N/A') if self.features_info else 'N/A',
                    "total_classes": len(classes),
                    "features_used": len(self.features_info.get('feature_names', [])) if self.features_info else 0,
                    "model_type": self.features_info.get('model_type', str(type(self.model).__name__)) if self.features_info else str(type(self.model).__name__)
                },
                "warning": "⚠️ Esta es una predicción automatizada basada en síntomas. Consulte con un veterinario profesional para diagnóstico definitivo y tratamiento."
            }
            
        except Exception as e:
            logger.error(f"Error en predicción de enfermedad: {str(e)}")
            return {
                "success": False,
                "message": f"Error en predicción: {str(e)}",
                "predictions": [],
                "error_details": str(e)
            }


# Instancia singleton del servicio
disease_service = DiseasePredictionService()
