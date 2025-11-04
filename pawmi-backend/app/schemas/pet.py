from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PetBase(BaseModel):
    name: str = Field(max_length=100)
    species: str = Field(max_length=50)
    breed: Optional[str] = Field(default=None, max_length=100)
    age: Optional[str] = Field(default=None, max_length=20)
    age_years: Optional[Decimal] = Field(default=None, ge=0)
    weight: Optional[str] = Field(default=None, max_length=20)
    weight_kg: Optional[Decimal] = Field(default=None, ge=0)
    gender: Optional[str] = Field(default=None, max_length=20)
    color: Optional[str] = Field(default=None, max_length=100)
    microchip_id: Optional[str] = Field(default=None, max_length=50)
    image_url: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[List[str]] = None
    traits: Optional[List[str]] = None
    is_active: bool = True


class PetCreate(PetBase):
    owner_id: Optional[UUID] = None


class PetUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=100)
    species: Optional[str] = Field(default=None, max_length=50)
    breed: Optional[str] = Field(default=None, max_length=100)
    age: Optional[str] = Field(default=None, max_length=20)
    age_years: Optional[Decimal] = Field(default=None, ge=0)
    weight: Optional[str] = Field(default=None, max_length=20)
    weight_kg: Optional[Decimal] = Field(default=None, ge=0)
    gender: Optional[str] = Field(default=None, max_length=20)
    color: Optional[str] = Field(default=None, max_length=100)
    microchip_id: Optional[str] = Field(default=None, max_length=50)
    image_url: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[List[str]] = None
    traits: Optional[List[str]] = None
    is_active: Optional[bool] = None


class PetRead(PetBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
