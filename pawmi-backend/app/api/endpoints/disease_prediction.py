"""
Endpoints para predicción de enfermedades con ML
"""
import logging
from typing import List

from app.ml.predictor import DiseasePredictor, get_predictor
from app.schemas.disease_prediction import (DiseasePrediction,
                                            DiseasePredictionRequest,
                                            DiseasePredictionResponse,
                                            ModelInfoResponse, SymptomsList)
from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/predict", response_model=DiseasePredictionResponse)
async def predict_disease(request: DiseasePredictionRequest):
    """
    Predice enfermedades basándose en síntomas y datos demográficos
    
    - **animal_type**: Tipo de animal (Perro o Gato)
    - **age**: Edad en años
    - **size**: Tamaño (Pequeño, Mediano, Grande)
    - **life_stage**: Etapa de vida (Cachorro, Adulto, Senior)
    - **weight_kg**: Peso en kilogramos
    - **sex**: Sexo (Macho o Hembra)
    - **vaccination_up_to_date**: Vacunación al día (Sí o No)
    - **symptoms**: Diccionario de síntomas {nombre: 0/1}
    - **top_k**: Número de predicciones a retornar (default: 3)
    """
    try:
        # Obtener predictor
        predictor = get_predictor()
        
        if not predictor.is_loaded:
            raise HTTPException(
                status_code=503,
                detail="El modelo de ML no está disponible. Por favor contacte al administrador."
            )
        
        # Hacer predicción
        predictions = predictor.predict(
            symptoms=request.symptoms,
            animal_type=request.animal_type,
            age=request.age,
            size=request.size,
            life_stage=request.life_stage,
            weight_kg=request.weight_kg,
            sex=request.sex,
            vaccination_up_to_date=request.vaccination_up_to_date,
            top_k=request.top_k
        )
        
        # Convertir a schema de respuesta
        disease_predictions = [
            DiseasePrediction(**pred) for pred in predictions
        ]
        
        return DiseasePredictionResponse(
            predictions=disease_predictions,
            model_accuracy=0.849  # Accuracy del modelo Logistic Regression optimizado
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """
    Obtiene información sobre el modelo de ML cargado
    """
    try:
        predictor = get_predictor()
        info = predictor.get_model_info()
        return ModelInfoResponse(**info)
        
    except Exception as e:
        logger.error(f"Error obteniendo info del modelo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/symptoms", response_model=SymptomsList)
async def get_symptoms_list():
    """
    Retorna la lista completa de síntomas soportados por el modelo
    """
    try:
        predictor = get_predictor()
        
        if not predictor.is_loaded:
            # Retornar lista vacía si el modelo no está cargado
            return SymptomsList(symptoms=[], total=0)
        
        symptoms = predictor.SYMPTOM_FEATURES
        
        return SymptomsList(
            symptoms=symptoms,
            total=len(symptoms)
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo lista de síntomas: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reload")
async def reload_model():
    """
    Recarga el modelo de ML desde disco (útil después de entrenar uno nuevo)
    """
    try:
        predictor = get_predictor()
        success = predictor.load_model()
        
        if success:
            return {
                "message": "Modelo recargado exitosamente",
                "model_type": type(predictor.model).__name__
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="No se pudo recargar el modelo"
            )
            
    except Exception as e:
        logger.error(f"Error recargando modelo: {e}")
        raise HTTPException(status_code=500, detail=str(e))
