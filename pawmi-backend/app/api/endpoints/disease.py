"""
Endpoints para predicción de enfermedades
"""
import logging
from typing import Any, Dict, List

from app.schemas.disease import (DiseasePredictionError,
                                 DiseasePredictionRequest,
                                 DiseasePredictionResponse)
from app.services.disease_prediction import disease_service
from app.services.ollama_service import ollama_service
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/predict",
    response_model=DiseasePredictionResponse,
    summary="Predecir enfermedad basada en síntomas",
    description="""
    Predice la enfermedad más probable basándose en:
    - Datos demográficos (especie, edad, tamaño)
    - Signos vitales (temperatura, frecuencia cardíaca, etc.)
    - Síntomas clínicos (vómitos, diarrea, fiebre, etc.)
    
    Retorna las top 3 enfermedades más probables con sus probabilidades.
    
    **⚠️ IMPORTANTE:** Esta es una herramienta de asistencia. 
    Siempre consulte con un veterinario profesional para diagnóstico definitivo.
    """,
    tags=["Disease Prediction"]
)
async def predict_disease(
    request: DiseasePredictionRequest
) -> DiseasePredictionResponse:
    """
    Endpoint para predicción de enfermedades
    
    Args:
        request: Datos del paciente y síntomas
        
    Returns:
        DiseasePredictionResponse con predicciones
        
    Raises:
        HTTPException: Si ocurre error en predicción
    """
    try:
        logger.info(f"Nueva solicitud de predicción para {request.animal_type}, edad {request.age}")
        
        # Convertir request a diccionario
        input_data = request.model_dump()
        
        # Realizar predicción
        result = await disease_service.predict_disease(input_data)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("message", "Error en predicción")
            )
        
        logger.info(f"Predicción exitosa: {result['predictions'][0]['disease']} ({result['predictions'][0]['probability']*100:.1f}%)")
        
        return DiseasePredictionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en predicción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno en predicción: {str(e)}"
        )


@router.get(
    "/model-info",
    summary="Información del modelo de predicción",
    description="Retorna información sobre el modelo ML usado para predicciones",
    tags=["Disease Prediction"]
)
async def get_model_info():
    """
    Obtiene información del modelo cargado
    
    Returns:
        Dict con información del modelo
    """
    if not disease_service.model_loaded:
        # Intentar cargar modelo
        success = disease_service.load_model()
        if not success:
            raise HTTPException(
                status_code=503,
                detail="Modelo no disponible. Contacte al administrador."
            )
    
    return {
        "model_loaded": disease_service.model_loaded,
        "model_version": "3.0",
        "model_type": str(type(disease_service.model).__name__) if disease_service.model else None,
        "num_features": len(disease_service.features_info['feature_names']) if disease_service.features_info else None,
        "test_accuracy": disease_service.features_info.get('test_accuracy') if disease_service.features_info else None,
        "cv_score": disease_service.features_info.get('cv_mean') if disease_service.features_info else None,
        "description": "Modelo de predicción de enfermedades veterinarias entrenado con 9,000+ casos clínicos"
    }


@router.post(
    "/symptoms-check",
    summary="Verificar sintomatología",
    description="Análisis rápido de síntomas sin predicción completa",
    tags=["Disease Prediction"]
)
async def check_symptoms(symptoms: dict):
    """
    Verifica los síntomas y da recomendaciones generales
    
    Args:
        symptoms: Diccionario con síntomas activos
        
    Returns:
        Análisis y recomendaciones
    """
    active_symptoms = [k for k, v in symptoms.items() if v == 1]
    num_symptoms = len(active_symptoms)
    
    # Clasificar urgencia
    urgent_symptoms = ['diarrea_hemorragica', 'convulsiones', 'disnea', 'ictericia']
    has_urgent = any(s in active_symptoms for s in urgent_symptoms)
    
    if has_urgent:
        urgency = "ALTA - Consulta veterinaria URGENTE"
        recommendation = "Dirígete inmediatamente a un centro veterinario de urgencias"
    elif num_symptoms >= 5:
        urgency = "MEDIA-ALTA - Consulta pronto"
        recommendation = "Programa una cita veterinaria en las próximas 24-48 horas"
    elif num_symptoms >= 3:
        urgency = "MEDIA - Monitorear"
        recommendation = "Monitorea la evolución y consulta si empeora"
    else:
        urgency = "BAJA - Observación"
        recommendation = "Observa a tu mascota. Consulta si aparecen más síntomas"
    
    return {
        "num_symptoms": num_symptoms,
        "active_symptoms": active_symptoms,
        "urgency_level": urgency,
        "recommendation": recommendation,
        "warning": "Esta es una evaluación preliminar. Siempre consulta con un veterinario."
    }


@router.post(
    "/test-prediction",
    summary="🧪 Test: Predicción con datos de ejemplo",
    description="""
    **Endpoint de prueba** para verificar que el modelo ML está funcionando correctamente.
    
    Usa datos de ejemplo de un perro con síntomas gastrointestinales y retorna:
    - Las predicciones del modelo ML real
    - Información detallada del modelo (accuracy, features, tipo)
    - Todas las clases que el modelo puede predecir
    
    **Esto demuestra que NO hay código hardcodeado y que el modelo entrenado está respondiendo.**
    """,
    tags=["Disease Prediction"]
)
async def test_prediction():
    """
    Endpoint de prueba con datos de ejemplo para verificar que el modelo funciona
    """
    try:
        # Datos de ejemplo: Perro con síntomas gastrointestinales
        test_data = {
            "animal_type": "dog",
            "age": 5,
            "size": "medium",
            "weight": 15.0,
            "temperature": 39.5,
            "heart_rate": 120,
            "respiratory_rate": 30,
            "vomiting": True,
            "diarrhea": True,
            "lethargy": True,
            "loss_of_appetite": True,
            "abdominal_pain": True,
            "fever": True,
            "dehydration": False,
            "cough": False,
            "sneezing": False,
            "nasal_discharge": False,
            "eye_discharge": False,
            "itching": False,
            "hair_loss": False,
            "skin_lesions": False,
            "lameness": False,
            "seizures": False,
            "difficulty_breathing": False,
            "increased_thirst": False,
            "increased_urination": False,
            "bloody_stool": False,
            "bloody_vomit": False,
            "weight_loss": False,
            "aggression": False,
            "disorientation": False,
            "jaundice": False,
            "pale_gums": False,
            "swelling": False,
            "disease_cause": "viral",
            "prognosis": "good",
            "fever_objective": 1.0,
            "tachycardia": 1.0,
            "is_chronic": 0.0,
            "is_seasonal": 0.0,
            "prevalence": 0.5,
            "vaccination_updated": 1.0
        }
        
        # Realizar predicción
        result = await disease_service.predict_disease(test_data)
        
        if not result["success"]:
            return {
                "test_status": "FAILED",
                "error": result.get("message", "Error desconocido"),
                "model_loaded": disease_service.model_loaded
            }
        
        # Agregar información extra de prueba
        all_classes = list(disease_service.model.classes_) if disease_service.model else []
        
        return {
            "test_status": "SUCCESS ✅",
            "message": "El modelo ML está funcionando correctamente",
            "test_case": "Perro con síntomas gastrointestinales (vómito, diarrea, fiebre)",
            "predictions": result["predictions"],
            "model_verification": {
                "model_loaded": disease_service.model_loaded,
                "model_type": result["model_info"]["model_type"],
                "test_accuracy": result["model_info"]["accuracy"],
                "cv_accuracy": result["model_info"]["cv_mean"],
                "total_features": result["model_info"]["features_used"],
                "total_classes": result["model_info"]["total_classes"],
                "all_disease_classes": all_classes[:10],  # Primeras 10 clases
                "note": "Estas son las clases REALES del modelo entrenado, no hardcodeadas"
            },
            "proof": {
                "description": "Si ves diferentes probabilidades y enfermedades al cambiar síntomas, es el modelo ML real",
                "test": "Prueba con diferentes síntomas y verás predicciones diferentes",
                "source": "Modelo entrenado en pawmi-ml/notebooks/03_disease_prediction_dataset3_0.ipynb"
            }
        }
        
    except Exception as e:
        logger.error(f"Error en test de predicción: {str(e)}")
        return {
            "test_status": "ERROR",
            "error": str(e),
            "model_loaded": disease_service.model_loaded if hasattr(disease_service, 'model_loaded') else False
        }


# ============= ENDPOINTS CON OLLAMA =============

class ExtractSymptomsRequest(BaseModel):
    """Request para extraer síntomas usando Ollama"""
    text: str
    
class ExtractSymptomsResponse(BaseModel):
    """Response con síntomas extraídos"""
    symptoms: Dict[str, int]
    symptoms_list: List[str]
    original_text: str


@router.post(
    "/extract-symptoms-ollama",
    response_model=ExtractSymptomsResponse,
    summary="Extraer síntomas usando Ollama",
    description="""
    Usa Ollama (modelo local de IA) para extraer síntomas del texto del usuario.
    Es más inteligente que la detección por palabras clave, entiende contexto.
    """,
    tags=["Disease Prediction", "Ollama"]
)
async def extract_symptoms_with_ollama(request: ExtractSymptomsRequest):
    """
    Extrae síntomas del texto usando Ollama para mejor comprensión
    """
    try:
        symptoms = ollama_service.extract_symptoms_from_text(request.text)
        symptoms_list = [k for k, v in symptoms.items() if v == 1]
        
        return ExtractSymptomsResponse(
            symptoms=symptoms,
            symptoms_list=symptoms_list,
            original_text=request.text
        )
    except Exception as e:
        logger.error(f"Error en extracción con Ollama: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al extraer síntomas: {str(e)}"
        )


class PredictWithOllamaRequest(BaseModel):
    """Request para predicción completa con Ollama"""
    user_message: str
    pet_data: DiseasePredictionRequest
    pet_name: str = "tu mascota"


class PredictWithOllamaResponse(BaseModel):
    """Response con predicción y texto formateado por Ollama"""
    success: bool
    predictions: List[Dict[str, Any]]
    conversational_response: str
    symptoms_detected: Dict[str, int]
    model_info: Dict[str, Any]


@router.post(
    "/predict-with-ollama",
    response_model=PredictWithOllamaResponse,
    summary="Predicción completa con Ollama",
    description="""
    Pipeline completo que:
    1. Usa Ollama para extraer síntomas del mensaje del usuario
    2. Llama al modelo ML para predicción
    3. Usa Ollama para formatear la respuesta de forma conversacional
    
    El modelo ML NO cambia, Ollama solo mejora comprensión y comunicación.
    """,
    tags=["Disease Prediction", "Ollama"]
)
async def predict_with_ollama(request: PredictWithOllamaRequest):
    """
    Predicción completa usando Ollama como intermediario inteligente
    """
    try:
        # 1. Extraer síntomas con Ollama
        logger.info(f"Extrayendo síntomas con Ollama: {request.user_message}")
        symptoms = ollama_service.extract_symptoms_from_text(request.user_message)
        symptoms_list = [k for k, v in symptoms.items() if v == 1]
        
        logger.info(f"Síntomas detectados: {symptoms_list}")
        
        # 2. Actualizar datos del pet con síntomas detectados
        pet_dict = request.pet_data.model_dump()
        pet_dict.update(symptoms)
        
        # 3. Predecir con el modelo ML
        logger.info("Realizando predicción con modelo ML")
        ml_result = await disease_service.predict_disease(pet_dict)
        
        if not ml_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=ml_result.get("message", "Error en predicción ML")
            )
        
        # 4. Formatear respuesta con Ollama
        logger.info("Formateando respuesta con Ollama")
        conversational_text = ollama_service.format_prediction_response(
            predictions=ml_result["predictions"],
            pet_name=request.pet_name,
            symptoms_mentioned=symptoms_list
        )
        
        return PredictWithOllamaResponse(
            success=True,
            predictions=ml_result["predictions"],
            conversational_response=conversational_text,
            symptoms_detected=symptoms,
            model_info=ml_result["model_info"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en predicción con Ollama: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error en predicción: {str(e)}"
        )

