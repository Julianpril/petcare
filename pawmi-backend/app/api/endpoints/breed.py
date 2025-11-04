"""
Endpoints para clasificación de razas de mascotas
"""
import logging
from typing import List

from app.schemas.breed import (BreedClassificationResponse, BreedPrediction,
                               ModelInfoResponse)
from app.services.breed_classification import breed_classifier
from fastapi import APIRouter, File, HTTPException, UploadFile, status

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/breed", tags=["Breed Classification"])


@router.post(
    "/classify",
    response_model=BreedClassificationResponse,
    summary="Clasificar raza de mascota desde imagen",
    description="""
    Analiza una imagen de mascota y retorna las 3 razas más probables.
    
    **Uso:**
    - Sube una imagen (JPEG, PNG, etc.) de un perro o gato
    - El modelo analizará la imagen y retornará las 3 razas más probables
    - Cada predicción incluye el nombre de la raza y el porcentaje de confianza
    
    **Razas soportadas:**
    - 37 razas de perros y gatos del dataset Oxford-IIIT Pets
    - Incluye razas populares como Golden Retriever, Labrador, Persa, Bengal, etc.
    
    **Ejemplo de uso:**
    ```python
    import requests
    
    url = "http://localhost:8000/api/v1/breed/classify"
    files = {"file": open("mi_perro.jpg", "rb")}
    response = requests.post(url, files=files)
    print(response.json())
    ```
    """,
    responses={
        200: {
            "description": "Clasificación exitosa",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "predictions": [
                            {
                                "breed": "Golden Retriever",
                                "confidence": 85.42,
                                "raw_label": "golden_retriever"
                            },
                            {
                                "breed": "Labrador Retriever",
                                "confidence": 10.25,
                                "raw_label": "labrador_retriever"
                            },
                            {
                                "breed": "Beagle",
                                "confidence": 4.33,
                                "raw_label": "beagle"
                            }
                        ],
                        "message": "Clasificación completada exitosamente"
                    }
                }
            }
        },
        400: {"description": "Archivo inválido o no es una imagen"},
        500: {"description": "Error en el servidor al procesar la imagen"}
    }
)
async def classify_pet_breed(
    file: UploadFile = File(..., description="Imagen de la mascota (JPEG, PNG, etc.)")
):
    """
    Clasifica la raza de una mascota desde una imagen
    
    Args:
        file: Archivo de imagen subido
        
    Returns:
        BreedClassificationResponse: Top 3 predicciones de razas con porcentajes de confianza
    """
    try:
        logger.info(f"🔍 Recibiendo imagen para clasificación: {file.filename}")
        
        # Validar que sea una imagen
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser una imagen (JPEG, PNG, GIF, etc.)"
            )
        
        # Clasificar usando el servicio
        predictions = await breed_classifier.classify_breed_from_upload(file)
        
        # Convertir a formato Pydantic
        breed_predictions = [BreedPrediction(**pred) for pred in predictions]
        
        response = BreedClassificationResponse(
            success=True,
            predictions=breed_predictions,
            message=f"Clasificación completada. Raza principal: {breed_predictions[0].breed} ({breed_predictions[0].confidence:.2f}%)"
        )
        
        logger.info(f"✅ Clasificación exitosa: {breed_predictions[0].breed}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado en clasificación: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la imagen: {str(e)}"
        )


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Información del modelo de clasificación",
    description="Obtiene información sobre el modelo de IA utilizado para clasificar razas"
)
async def get_model_info():
    """
    Retorna información sobre el modelo de clasificación de razas
    
    Returns:
        ModelInfoResponse: Información del modelo
    """
    try:
        info = breed_classifier.get_model_info()
        return ModelInfoResponse(**info)
    except Exception as e:
        logger.error(f"❌ Error al obtener información del modelo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener información del modelo"
        )


@router.get(
    "/health",
    summary="Verificar estado del servicio de clasificación",
    description="Endpoint para verificar si el servicio de clasificación está funcionando"
)
async def health_check():
    """
    Verifica que el servicio de clasificación esté funcionando correctamente
    
    Returns:
        dict: Estado del servicio
    """
    try:
        # Verificar que el modelo esté cargado
        if breed_classifier.model is None or breed_classifier.pipeline is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="El modelo de clasificación no está disponible"
            )
        
        return {
            "status": "healthy",
            "service": "breed-classification",
            "model": breed_classifier.model_name,
            "ready": True
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error en health check: {e}")
        return {
            "status": "unhealthy",
            "service": "breed-classification",
            "error": str(e),
            "ready": False
        }
