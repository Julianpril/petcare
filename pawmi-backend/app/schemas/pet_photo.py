"""
Esquemas Pydantic para fotografías de mascotas
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PetPhotoBase(BaseModel):
    """Esquema base para fotografías de mascotas"""
    category: str = Field(default="general", description="Categoría de la foto")
    description: Optional[str] = Field(None, description="Descripción opcional de la foto")
    treatment_id: Optional[str] = Field(None, description="ID del tratamiento asociado")
    is_primary: bool = Field(default=False, description="Si es la foto principal")
    taken_at: Optional[datetime] = Field(None, description="Fecha en que se tomó la foto")


class PetPhotoCreate(PetPhotoBase):
    """Esquema para crear una fotografía"""
    pet_id: str = Field(..., description="ID de la mascota")
    photo_url: str = Field(..., description="URL pública de la foto")
    storage_path: str = Field(..., description="Ruta en storage")


class PetPhotoUpdate(BaseModel):
    """Esquema para actualizar una fotografía"""
    category: Optional[str] = None
    description: Optional[str] = None
    is_primary: Optional[bool] = None
    taken_at: Optional[datetime] = None


class PetPhotoResponse(PetPhotoBase):
    """Esquema de respuesta para fotografías"""
    id: str
    pet_id: str
    photo_url: str
    storage_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BeforeAfterPhotos(BaseModel):
    """Esquema para fotos antes/después de un tratamiento"""
    treatment_id: str
    before_photo: Optional[PetPhotoResponse] = None
    after_photo: Optional[PetPhotoResponse] = None
    description: Optional[str] = None
