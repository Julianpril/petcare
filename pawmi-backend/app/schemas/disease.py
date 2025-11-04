"""
Schemas para predicción de enfermedades
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DiseasePredictionRequest(BaseModel):
    """Request para predicción de enfermedad"""
    # Datos demográficos
    animal_type: str = Field(..., description="Tipo de animal (perro/gato)")
    size: str = Field(..., description="Tamaño (pequeno/mediano/grande)")
    age: float = Field(..., description="Edad en años", ge=0)
    life_stage: str = Field(..., description="Etapa de vida (cachorro/joven/adulto/senior)")
    
    # Signos vitales
    weight: float = Field(..., description="Peso en kg", gt=0)
    bcs: int = Field(..., description="Body Condition Score (1-9)", ge=1, le=9)
    body_temperature: float = Field(..., description="Temperatura corporal °C", ge=35, le=42)
    heart_rate: float = Field(..., description="Frecuencia cardíaca (BPM)", gt=0)
    respiratory_rate: float = Field(..., description="Frecuencia respiratoria (RPM)", gt=0)
    
    # Síntomas binarios (0 o 1)
    vomitos: int = Field(0, ge=0, le=1)
    diarrea: int = Field(0, ge=0, le=1)
    diarrea_hemorragica: int = Field(0, ge=0, le=1)
    fiebre: int = Field(0, ge=0, le=1)
    letargo: int = Field(0, ge=0, le=1)
    deshidratacion: int = Field(0, ge=0, le=1)
    tos: int = Field(0, ge=0, le=1)
    disnea: int = Field(0, ge=0, le=1)
    estornudos: int = Field(0, ge=0, le=1)
    secrecion_nasal: int = Field(0, ge=0, le=1)
    secrecion_ocular: int = Field(0, ge=0, le=1)
    ulceras_orales: int = Field(0, ge=0, le=1)
    prurito: int = Field(0, ge=0, le=1)
    alopecia: int = Field(0, ge=0, le=1)
    otitis: int = Field(0, ge=0, le=1)
    dolor_abdominal: int = Field(0, ge=0, le=1)
    ictericia: int = Field(0, ge=0, le=1)
    hematuria: int = Field(0, ge=0, le=1)
    disuria: int = Field(0, ge=0, le=1)
    cojera: int = Field(0, ge=0, le=1)
    rigidez: int = Field(0, ge=0, le=1)
    dolor_articular: int = Field(0, ge=0, le=1)
    convulsiones: int = Field(0, ge=0, le=1)
    signos_neurologicos: int = Field(0, ge=0, le=1)
    hipersalivacion: int = Field(0, ge=0, le=1)
    soplo_cardiaco: int = Field(0, ge=0, le=1)
    taquipnea: int = Field(0, ge=0, le=1)
    
    # NUEVAS features del Dataset 3.0 (opcionales para compatibilidad)
    fever_objective: Optional[int] = Field(None, ge=0, le=1)
    tachycardia: Optional[int] = Field(None, ge=0, le=1)
    disease_cause: Optional[str] = Field(None)
    is_chronic: Optional[int] = Field(None, ge=0, le=1)
    is_seasonal: Optional[int] = Field(None, ge=0, le=1)
    prevalence: Optional[float] = Field(None, ge=0, le=1)
    prognosis: Optional[str] = Field(None)
    vaccination_updated: Optional[int] = Field(None, ge=0, le=1)

    class Config:
        json_schema_extra = {
            "example": {
                "animal_type": "perro",
                "size": "mediano",
                "age": 5.0,
                "life_stage": "adulto",
                "weight": 20.5,
                "bcs": 5,
                "body_temperature": 38.5,
                "heart_rate": 110,
                "respiratory_rate": 25,
                "vomitos": 1,
                "diarrea": 1,
                "fiebre": 1,
                "letargo": 1,
                "deshidratacion": 0,
                "tos": 0,
                "disnea": 0
            }
        }


class DiseasePrediction(BaseModel):
    """Predicción individual de enfermedad"""
    disease: str = Field(..., description="Nombre de la enfermedad")
    probability: float = Field(..., description="Probabilidad (0-1)", ge=0, le=1)
    confidence: str = Field(..., description="Nivel de confianza (alta/media/baja)")


class DiseasePredictionResponse(BaseModel):
    """Response de predicción de enfermedad"""
    success: bool = Field(..., description="Si la predicción fue exitosa")
    message: str = Field(..., description="Mensaje informativo")
    predictions: List[DiseasePrediction] = Field(..., description="Top 3 predicciones")
    model_version: str = Field(..., description="Versión del modelo usado")
    model_info: Optional[Dict[str, Any]] = Field(None, description="Información del modelo ML (accuracy, features, etc)")
    warning: Optional[str] = Field(None, description="Advertencia si aplica")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Predicción completada exitosamente",
                "predictions": [
                    {
                        "disease": "Parvovirus Canino",
                        "probability": 0.89,
                        "confidence": "alta"
                    },
                    {
                        "disease": "Gastroenteritis",
                        "probability": 0.07,
                        "confidence": "baja"
                    },
                    {
                        "disease": "Intoxicación",
                        "probability": 0.04,
                        "confidence": "baja"
                    }
                ],
                "model_version": "3.0",
                "warning": "Esta es una predicción automatizada. Consulte con un veterinario para diagnóstico definitivo."
            }
        }


class DiseasePredictionError(BaseModel):
    """Error en predicción de enfermedad"""
    success: bool = Field(False)
    message: str = Field(..., description="Mensaje de error")
    error_details: Optional[str] = Field(None, description="Detalles técnicos del error")
