"""
Schemas para clasificación de razas de mascotas
"""
from typing import List

from pydantic import BaseModel, Field


class BreedPrediction(BaseModel):
    """Predicción individual de una raza"""
    
    breed: str = Field(..., description="Nombre de la raza predicha")
    confidence: float = Field(..., ge=0, le=100, description="Confianza de la predicción en porcentaje (0-100)")
    raw_label: str = Field(..., description="Etiqueta cruda del modelo")
    
    class Config:
        json_schema_extra = {
            "example": {
                "breed": "Golden Retriever",
                "confidence": 85.42,
                "raw_label": "golden_retriever"
            }
        }


class BreedClassificationResponse(BaseModel):
    """Respuesta de la clasificación de razas"""
    
    success: bool = Field(default=True, description="Indica si la clasificación fue exitosa")
    predictions: List[BreedPrediction] = Field(..., description="Lista de predicciones de razas (top 3)")
    message: str = Field(default="Clasificación completada exitosamente", description="Mensaje descriptivo")
    
    class Config:
        json_schema_extra = {
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
                        "breed": "Gato Bengal",
                        "confidence": 4.33,
                        "raw_label": "bengal_cat"
                    }
                ],
                "message": "Clasificación completada exitosamente"
            }
        }


class ModelInfoResponse(BaseModel):
    """Información del modelo de clasificación"""
    
    model_name: str = Field(..., description="Nombre del modelo en Hugging Face")
    model_type: str = Field(..., description="Tipo de arquitectura del modelo")
    dataset: str = Field(..., description="Dataset utilizado para entrenar")
    supported_classes: str = Field(..., description="Clases/razas soportadas")
    input_format: str = Field(..., description="Formato de entrada esperado")
    top_predictions: int = Field(..., description="Número de predicciones top retornadas")
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_name": "ISxOdin/vit-base-oxford-iiit-pets",
                "model_type": "Vision Transformer (ViT)",
                "dataset": "Oxford-IIIT Pet Dataset",
                "supported_classes": "37 razas de perros y gatos",
                "input_format": "RGB images",
                "top_predictions": 3
            }
        }
