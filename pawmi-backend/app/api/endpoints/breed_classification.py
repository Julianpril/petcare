"""
Endpoints para la clasificación de razas de mascotas
"""
import logging
from typing import List, Optional

from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.breed_classification import (BreedClassificationError,
                                              BreedClassificationResponse,
                                              BreedPrediction)
from app.services.breed_classification import breed_classifier
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/breed", tags=["Clasificación de Razas"])

@router.post("/classify", response_model=BreedClassificationResponse)
async def classify_pet_breed(
    file: UploadFile = File(..., description="Imagen de la mascota (JPEG, PNG, etc.)"),
    current_user: User = Depends(get_current_user)
):
    """
    Clasificar la raza de una mascota basándose en una imagen subida.
    
    **Funcionalidad:**
    - Acepta imágenes en formatos JPEG, PNG, etc.
    - Usa un modelo ViT entrenado en el dataset Oxford-IIIT Pet
    - Retorna las 3 razas más probables con sus porcentajes de confianza
    
    **Casos de uso:**
    - Al agregar una nueva mascota, el usuario puede subir una foto
    - El sistema sugiere las 3 razas más probables
    - Ayuda a los usuarios a identificar razas desconocidas
    
    **Respuesta:**
    - Lista de 3 predicciones ordenadas por confianza
    - Cada predicción incluye: nombre de raza, confianza (%), etiqueta raw
    """
    try:
        logger.info(f"Usuario {current_user.email} clasificando raza de mascota")
        
        # Validaciones básicas
        if not file:
            raise HTTPException(
                status_code=400,
                detail="No se proporcionó ningún archivo"
            )
        
        if file.size and file.size > 10 * 1024 * 1024:  # 10MB máximo
            raise HTTPException(
                status_code=400,
                detail="El archivo es demasiado grande. Máximo 10MB"
            )
        
        # Clasificar la imagen
        predictions = await breed_classifier.classify_breed_from_upload(file)
        
        # Obtener info del modelo
        model_info = breed_classifier.get_model_info()
        
        # Convertir a objetos BreedPrediction
        breed_predictions = [BreedPrediction(**pred) for pred in predictions]
        
        # Respuesta exitosa
        response = BreedClassificationResponse(
            success=True,
            message=f"Clasificación completada. {len(predictions)} predicciones generadas.",
            predictions=breed_predictions,
            model_info=model_info
        )
        
        logger.info(f"✅ Clasificación exitosa para usuario {current_user.email}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado en clasificación: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/model-info")
async def get_model_info(current_user: User = Depends(get_current_user)):
    """
    Obtener información sobre el modelo de clasificación de razas.
    
    **Información incluida:**
    - Nombre del modelo y tipo
    - Dataset de entrenamiento
    - Número de clases soportadas
    - Formato de entrada esperado
    """
    try:
        model_info = breed_classifier.get_model_info()
        
        return {
            "success": True,
            "message": "Información del modelo obtenida",
            "model_info": model_info
        }
        
    except Exception as e:
        logger.error(f"❌ Error al obtener info del modelo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener información del modelo: {str(e)}"
        )

@router.get("/supported-breeds")
async def get_supported_breeds(current_user: User = Depends(get_current_user)):
    """
    Obtener lista de razas soportadas por el modelo.
    
    **Nota:** El modelo Oxford-IIIT Pet soporta 37 razas diferentes de perros y gatos.
    Esta lista puede ser útil para mostrar al usuario qué razas puede detectar el sistema.
    """
    
    # Lista de razas soportadas por el modelo Oxford-IIIT Pet
    supported_breeds = [
        # Gatos
        "Gato Persa", "Gato Siamés", "Gato Bengal", "Maine Coon", 
        "British Shorthair", "Gato Ragdoll", "Abisinio", "Birmano",
        "Bombay", "Gato Ruso Azul", "Esfinge", "Gato Exótico",
        
        # Perros
        "Golden Retriever", "Labrador Retriever", "Pastor Alemán", "Bulldog",
        "Poodle", "Husky Siberiano", "Rottweiler", "Beagle", 
        "Dálmata", "Border Collie", "Boxer", "Cocker Spaniel",
        "Dachshund", "Doberman", "Gran Danés", "Mastín Inglés",
        "Fox Terrier", "Keeshond", "Leonberger", "Newfoundland",
        "Pomerania", "Pug", "Saint Bernard", "Samoyed", "Schnauzer"
    ]
    
    return {
        "success": True,
        "message": f"Lista de {len(supported_breeds)} razas soportadas",
        "total_breeds": len(supported_breeds),
        "breeds": sorted(supported_breeds),
        "categories": {
            "cats": [breed for breed in supported_breeds if "Gato" in breed or breed in ["Maine Coon", "British Shorthair", "Ragdoll", "Abisinio", "Birmano", "Bombay", "Ruso Azul", "Esfinge", "Exótico"]],
            "dogs": [breed for breed in supported_breeds if "Gato" not in breed and breed not in ["Maine Coon", "British Shorthair", "Ragdoll", "Abisinio", "Birmano", "Bombay", "Ruso Azul", "Esfinge", "Exótico"]]
        }
    }