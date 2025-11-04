"""
Esquemas para la clasificación de razas de mascotas
"""
from typing import List, Optional

from pydantic import BaseModel, Field


class BreedPrediction(BaseModel):
    """Predicción individual de raza"""
    breed: str = Field(..., description="Nombre de la raza formateado")
    confidence: float = Field(..., ge=0, le=100, description="Confianza en porcentaje (0-100)")
    raw_label: str = Field(..., description="Etiqueta raw del modelo")

class BreedClassificationResponse(BaseModel):
    """Respuesta completa de clasificación de raza"""
    success: bool = Field(True, description="Indica si la clasificación fue exitosa")
    message: str = Field("Clasificación completada", description="Mensaje descriptivo")
    predictions: List[BreedPrediction] = Field(..., description="Top 3 predicciones de raza")
    model_info: Optional[dict] = Field(None, description="Información del modelo usado")

class BreedClassificationError(BaseModel):
    """Respuesta de error en clasificación"""
    success: bool = Field(False)
    message: str = Field(..., description="Mensaje de error")
    error_code: str = Field(..., description="Código de error")
    detail: Optional[str] = Field(None, description="Detalles adicionales del error")