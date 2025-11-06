"""
Schemas para predicción de enfermedades
"""
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator


class DiseasePredictionRequest(BaseModel):
    """Request para predicción de enfermedades"""
    
    # Información demográfica de la mascota (usando etiquetas en inglés del dataset)
    animal_type: Literal["Perro", "Gato"] = Field(..., description="Tipo de animal")
    age: float = Field(..., ge=0, le=30, description="Edad en años")
    size: Literal["Small", "Medium", "Large"] = Field(..., description="Tamaño del animal (English)")
    life_stage: Literal["Puppy", "Kitten", "Adult", "Senior"] = Field(..., description="Etapa de vida (English)")
    weight_kg: float = Field(..., ge=0.5, le=100, description="Peso en kilogramos")
    sex: Literal["Male", "Female"] = Field(..., description="Sexo (English)")
    vaccination_up_to_date: Literal[0, 1] = Field(..., description="Vacunación al día (0=No, 1=Sí)")
    
    # Síntomas (diccionario con valores binarios 0/1)
    symptoms: Dict[str, int] = Field(
        default_factory=dict,
        description="Diccionario de síntomas donde la clave es el nombre del síntoma y el valor es 0 o 1"
    )
    
    # Opciones de predicción
    top_k: int = Field(default=3, ge=1, le=10, description="Número de predicciones a retornar")
    
    @validator('symptoms')
    def validate_symptoms(cls, v):
        """Valida que los valores de síntomas sean 0 o 1"""
        for symptom, value in v.items():
            if value not in [0, 1]:
                raise ValueError(f"El síntoma '{symptom}' debe ser 0 o 1, se recibió {value}")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "animal_type": "Perro",
                "age": 3.5,
                "size": "Medium",
                "life_stage": "Adult",
                "weight_kg": 15.0,
                "sex": "Male",
                "vaccination_up_to_date": 1,
                "symptoms": {
                    "fever": 1,
                    "vomiting": 1,
                    "diarrhea": 1,
                    "loss_appetite": 1,
                    "lethargy": 1
                },
                "top_k": 3
            }
        }


class DiseasePrediction(BaseModel):
    """Una predicción individual de enfermedad"""
    
    disease: str = Field(..., description="Nombre de la enfermedad")
    probability: float = Field(..., ge=0, le=1, description="Probabilidad (0-1)")
    confidence: Literal["high", "medium", "low"] = Field(..., description="Nivel de confianza")
    
    class Config:
        json_schema_extra = {
            "example": {
                "disease": "Parvovirosis",
                "probability": 0.85,
                "confidence": "high"
            }
        }


class DiseasePredictionResponse(BaseModel):
    """Response de predicción de enfermedades"""
    
    predictions: List[DiseasePrediction] = Field(..., description="Lista de predicciones ordenadas por probabilidad")
    model_accuracy: Optional[float] = Field(None, description="Accuracy del modelo (si está disponible)")
    disclaimer: str = Field(
        default="Esta es una predicción automática. Consulte con un veterinario para un diagnóstico preciso.",
        description="Descargo de responsabilidad"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "disease": "Parvovirosis",
                        "probability": 0.85,
                        "confidence": "high"
                    },
                    {
                        "disease": "Gastroenteritis",
                        "probability": 0.12,
                        "confidence": "low"
                    },
                    {
                        "disease": "Intoxicación",
                        "probability": 0.03,
                        "confidence": "low"
                    }
                ],
                "model_accuracy": 0.849,
                "disclaimer": "Esta es una predicción automática. Consulte con un veterinario para un diagnóstico preciso."
            }
        }


class ModelInfoResponse(BaseModel):
    """Información sobre el modelo de ML cargado"""
    
    loaded: bool = Field(..., description="Si el modelo está cargado")
    model_type: Optional[str] = Field(None, description="Tipo de modelo")
    n_features: Optional[int] = Field(None, description="Número total de features")
    n_symptoms: Optional[int] = Field(None, description="Número de síntomas")
    symptoms: Optional[List[str]] = Field(None, description="Lista de síntomas soportados")
    demographic_features: Optional[List[str]] = Field(None, description="Features demográficas")
    error: Optional[str] = Field(None, description="Mensaje de error si el modelo no está cargado")
    
    class Config:
        json_schema_extra = {
            "example": {
                "loaded": True,
                "model_type": "LogisticRegression",
                "n_features": 50,
                "n_symptoms": 43,
                "symptoms": ["fever", "vomiting", "diarrhea", "..."],
                "demographic_features": ["animal_type", "age", "size", "life_stage", "weight_kg", "sex", "vaccination_up_to_date"]
            }
        }


class SymptomsList(BaseModel):
    """Lista de todos los síntomas soportados"""
    
    symptoms: List[str] = Field(..., description="Lista de nombres de síntomas")
    total: int = Field(..., description="Total de síntomas disponibles")
    
    class Config:
        json_schema_extra = {
            "example": {
                "symptoms": ["fever", "vomiting", "diarrhea", "cough", "lethargy"],
                "total": 43
            }
        }
