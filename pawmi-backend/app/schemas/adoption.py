from typing import Optional

from pydantic import BaseModel, ConfigDict


class ShelterInfo(BaseModel):
    id: str
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    verificado: bool = False


class AdoptionPet(BaseModel):
    id: str
    nombre: str
    especie: Optional[str] = None
    raza: Optional[str] = None
    edad: Optional[int] = None
    tamano: Optional[str] = None
    sexo: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    descripcion: Optional[str] = None
    foto_url: Optional[str] = None
    vacunas_al_dia: Optional[bool] = None
    esterilizado: Optional[bool] = None
    adopcion_estado: Optional[str] = None
    peso_kg: Optional[float] = None
    peso_texto: Optional[str] = None
    caracteristicas: Optional[list[str]] = None
    refugio: Optional[ShelterInfo] = None

    model_config = ConfigDict(from_attributes=True)


class AdoptionResponse(BaseModel):
    animales: list[AdoptionPet]
    total: int
    source: str = "database"
