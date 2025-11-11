"""
Esquemas Pydantic para Paseadores
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class WalkerBase(BaseModel):
    """Esquema base para paseadores"""
    bio: Optional[str] = Field(None, description="Biografía del paseador")
    experience_years: Optional[int] = Field(None, ge=0, description="Años de experiencia")
    certifications: Optional[List[str]] = Field(None, description="Certificaciones")
    hourly_rate: Optional[float] = Field(None, ge=0, description="Tarifa por hora")
    services: Optional[List[str]] = Field(None, description="Servicios ofrecidos")
    availability_schedule: Optional[str] = Field(None, description="Horario de disponibilidad (JSON)")
    max_pets_per_walk: int = Field(3, ge=1, le=10, description="Máximo de mascotas por paseo")
    city: Optional[str] = Field(None, max_length=100)
    neighborhood: Optional[str] = Field(None, max_length=100)
    service_radius_km: Optional[float] = Field(None, ge=0, description="Radio de servicio en km")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    accepted_pet_sizes: Optional[List[str]] = Field(None, description="Tamaños de mascotas aceptados")
    accepted_pet_types: Optional[List[str]] = Field(None, description="Tipos de mascotas aceptados")
    profile_photos: Optional[List[str]] = Field(None, description="URLs de fotos de perfil")


class WalkerCreate(WalkerBase):
    """Esquema para crear perfil de paseador"""
    pass


class WalkerUpdate(BaseModel):
    """Esquema para actualizar perfil de paseador"""
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    certifications: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    services: Optional[List[str]] = None
    availability_schedule: Optional[str] = None
    max_pets_per_walk: Optional[int] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    service_radius_km: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_pet_sizes: Optional[List[str]] = None
    accepted_pet_types: Optional[List[str]] = None
    profile_photos: Optional[List[str]] = None
    is_active: Optional[bool] = None


class WalkerResponse(WalkerBase):
    """Esquema de respuesta para paseadores"""
    id: UUID
    user_id: UUID
    is_active: bool
    is_verified: bool
    background_check_completed: bool
    total_walks: int
    rating_average: Optional[float]
    total_reviews: int
    created_at: datetime
    updated_at: datetime
    
    # Información del usuario
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_profile_image: Optional[str] = None
    user_phone: Optional[str] = None

    class Config:
        from_attributes = True


class WalkerReviewCreate(BaseModel):
    """Esquema para crear reseña de paseador"""
    walker_id: UUID
    rating: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = Field(None, max_length=1000)
    service_type: str = Field(..., description="Tipo de servicio")
    service_date: Optional[datetime] = None


class WalkerReviewResponse(BaseModel):
    """Esquema de respuesta para reseñas"""
    id: UUID
    walker_id: UUID
    reviewer_id: UUID
    rating: int
    comment: Optional[str]
    service_type: str
    service_date: Optional[datetime]
    created_at: datetime
    
    # Información del reviewer
    reviewer_name: Optional[str] = None
    reviewer_image: Optional[str] = None

    class Config:
        from_attributes = True


class WalkerBookingCreate(BaseModel):
    """Esquema para crear reserva"""
    walker_id: UUID
    pet_id: UUID
    service_type: str = Field(..., description="Tipo de servicio")
    scheduled_date: datetime
    duration_hours: float = Field(..., gt=0, le=24)
    notes: Optional[str] = None


class WalkerBookingUpdate(BaseModel):
    """Esquema para actualizar reserva"""
    scheduled_date: Optional[datetime] = None
    duration_hours: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class WalkerBookingResponse(BaseModel):
    """Esquema de respuesta para reservas"""
    id: UUID
    walker_id: UUID
    pet_owner_id: UUID
    pet_id: UUID
    service_type: str
    scheduled_date: datetime
    duration_hours: float
    total_price: Optional[float]
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Información adicional
    walker_name: Optional[str] = None
    pet_name: Optional[str] = None

    class Config:
        from_attributes = True


class WalkerSearchFilters(BaseModel):
    """Filtros para búsqueda de paseadores"""
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    max_hourly_rate: Optional[float] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    service_types: Optional[List[str]] = None
    pet_size: Optional[str] = None
    pet_type: Optional[str] = None
    available_date: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance_km: Optional[float] = None
