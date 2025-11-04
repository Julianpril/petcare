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
        
    def load_model(self) -> bool:
        """
        Carga el modelo y encoders desde disco
        
        Returns:
            bool: True si carga exitosa, False si falla
        """
        try:
            # Ruta al directorio de modelos (ajustar según estructura del proyecto)
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            models_dir = base_dir / "pawmi-ml" / "models"
            
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
        
        # Agregar nuevas features (Dataset 3.0) - SIEMPRE, con valores por defecto
        data['Fever_Objective'] = input_data.get('fever_objective', 0)
        data['Tachycardia'] = input_data.get('tachycardia', 0)
        data['Disease_Cause'] = input_data.get('disease_cause', 'viral')
        data['Is_Chronic'] = input_data.get('is_chronic', 0)
        data['Is_Seasonal'] = input_data.get('is_seasonal', 0)
        data['Prevalence'] = input_data.get('prevalence', 0.5)
        data['Prognosis'] = input_data.get('prognosis', 'good')
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
        
        # Mapeo de valores comunes a valores del encoder
        # Basado en los logs: size=['grande', 'mediano', 'pequeño'], life=['adulto', 'cachorro/gatito', 'maduro', 'senior']
        animal_type_mapping = {
            'dog': 'perro',
            'cat': 'gato',
            'perro': 'perro',
            'gato': 'gato',
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
        
        # Encoders opcionales (Dataset 3.0)
        if 'cause_encoder' in self.encoders:
            le_cause = self.encoders['cause_encoder']
            cause_value = df['Disease_Cause'].iloc[0]
            try:
                df_encoded['Disease_Cause'] = le_cause.transform([cause_value])[0]
            except ValueError:
                logger.warning(f"Valor de disease_cause desconocido: {cause_value}. Clases: {le_cause.classes_}. Usando primer valor.")
                df_encoded['Disease_Cause'] = le_cause.transform([le_cause.classes_[0]])[0]
        else:
            # Si no existe el encoder, eliminar la columna
            logger.warning("Encoder de Disease_Cause no encontrado. Eliminando columna.")
            if 'Disease_Cause' in df_encoded.columns:
                df_encoded = df_encoded.drop(columns=['Disease_Cause'])
        
        if 'prognosis_encoder' in self.encoders:
            le_prognosis = self.encoders['prognosis_encoder']
            prognosis_value = df['Prognosis'].iloc[0]
            try:
                df_encoded['Prognosis'] = le_prognosis.transform([prognosis_value])[0]
            except ValueError:
                logger.warning(f"Valor de prognosis desconocido: {prognosis_value}. Clases: {le_prognosis.classes_}. Usando primer valor.")
                df_encoded['Prognosis'] = le_prognosis.transform([le_prognosis.classes_[0]])[0]
        else:
            # Si no existe el encoder, eliminar la columna
            logger.warning("Encoder de Prognosis no encontrado. Eliminando columna.")
            if 'Prognosis' in df_encoded.columns:
                df_encoded = df_encoded.drop(columns=['Prognosis'])
        
        # Normalizar features numéricas
        scaler = self.encoders['scaler']
        
        # Identificar columnas numéricas
        numeric_cols = ['Age', 'Weight', 'BCS', 'Body_Temperature', 'Heart_Rate', 'Respiratory_Rate']
        
        # Agregar columnas de síntomas
        symptom_cols = [col for col in df_encoded.columns 
                       if col not in ['Animal_Type', 'Size', 'Life_Stage', 'Disease_Cause', 'Prognosis']]
        
        all_numeric = numeric_cols + symptom_cols
        
        # Normalizar solo las columnas que existen
        cols_to_scale = [col for col in all_numeric if col in df_encoded.columns]
        df_encoded[cols_to_scale] = scaler.transform(df_encoded[cols_to_scale])
        
        # Asegurar que tenga todas las features esperadas por el modelo
        if self.features_info and 'feature_names' in self.features_info:
            for feature in self.features_info['feature_names']:
                if feature not in df_encoded.columns:
                    df_encoded[feature] = 0  # Rellenar con 0 features faltantes
            
            # Ordenar columnas según el modelo
            df_encoded = df_encoded[self.features_info['feature_names']]
        
        return df_encoded
    
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
            
            # Obtener probabilidades de todas las clases
            probabilities = self.model.predict_proba(X)[0]
            
            # Obtener clases
            classes = self.model.classes_
            
            # Crear lista de predicciones con probabilidades
            predictions_list = [
                {"disease": disease, "probability": float(prob)}
                for disease, prob in zip(classes, probabilities)
            ]
            
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
                "model_version": "3.0",
                "model_info": {
                    "accuracy": self.features_info.get('test_accuracy', 'N/A') if self.features_info else 'N/A',
                    "cv_mean": self.features_info.get('cv_mean', 'N/A') if self.features_info else 'N/A',
                    "total_classes": len(classes),
                    "features_used": len(self.features_info.get('feature_names', [])) if self.features_info else 0,
                    "model_type": str(type(self.model).__name__)
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
