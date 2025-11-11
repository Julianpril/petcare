from __future__ import annotations

import re
from typing import Iterable

from app.api.deps import get_db
from app.models import Pet, User
from app.schemas.adoption import AdoptionPet, AdoptionResponse, ShelterInfo
from app.services.pets.adoption_data import ADOPTABLE_PETS
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

router = APIRouter(prefix="/public/adoptions", tags=["adoptions"])


def _normalize_species(species: str | None) -> str | None:
    if not species:
        return None
    value = species.strip().lower()
    mapping = {
        "dog": "Perro",
        "perro": "Perro",
        "canino": "Perro",
        "cat": "Gato",
        "gato": "Gato",
        "felino": "Gato",
    }
    if value in mapping:
        return mapping[value]
    return species.strip().title()


def _normalize_gender(gender: str | None) -> str | None:
    if not gender:
        return None
    value = gender.strip().lower()
    mapping = {
        "male": "Macho",
        "macho": "Macho",
        "hembra": "Hembra",
        "female": "Hembra",
    }
    return mapping.get(value, gender.strip().title())


def _extract_location(address: str | None) -> tuple[str | None, str | None]:
    if not address:
        return None, None
    parts = [part.strip() for part in address.split(",") if part.strip()]
    if len(parts) >= 2:
        return parts[-2], parts[-1]
    if parts:
        return parts[-1], None
    return None, None


def _format_weight(value: float) -> str:
    return f"{value:.1f} kg" if value % 1 else f"{int(value)} kg"


def _infer_weight(pet: Pet) -> tuple[float | None, str | None]:
    if pet.weight_kg is not None:
        weight = float(pet.weight_kg)
        return weight, _format_weight(weight)
    if pet.weight:
        match = re.search(r"(\d+(?:[\.,]\d+)?)", pet.weight)
        if match:
            weight = float(match.group(1).replace(",", "."))
            return weight, _format_weight(weight)
        return None, pet.weight.strip()
    return None, None


def _infer_size(weight_kg: float | None) -> str | None:
    if weight_kg is None:
        return None
    if weight_kg < 10:
        return "pequeno"
    if weight_kg < 25:
        return "mediano"
    return "grande"


def _infer_age(pet: Pet) -> int | None:
    if pet.age_years is not None:
        return max(1, int(round(float(pet.age_years))))
    if pet.age:
        match = re.search(r"(\d+)", pet.age)
        if match:
            return max(1, int(match.group(1)))
    return None


def _compose_description(pet: Pet) -> str:
    for field in (pet.adoption_requirements, pet.medical_history):
        if field:
            return field
    if pet.traits:
        traits_str = ", ".join(trait for trait in pet.traits if trait)
        if traits_str:
            return f"Caracteristicas: {traits_str}"
    return "Mascota disponible para adopcion mediante Pawmi."


def _build_pet_from_model(pet: Pet) -> AdoptionPet:
    owner = pet.owner
    city = department = None
    shelter_info: ShelterInfo | None = None

    if owner:
        city, department = _extract_location(owner.address)
        shelter_info = ShelterInfo(
            id=str(owner.id),
            nombre=owner.shelter_name or owner.full_name or owner.username,
            telefono=owner.phone,
            email=owner.email,
            direccion=owner.address,
            ciudad=city,
            departamento=department,
            verificado=bool(getattr(owner, "is_verified_shelter", False)),
        )

    weight_kg, weight_text = _infer_weight(pet)
    size = _infer_size(weight_kg)
    traits = [trait for trait in (pet.traits or []) if trait]
    image_url = pet.image_url or "https://placehold.co/400x300?text=Pawmi"

    return AdoptionPet(
        id=str(pet.id),
        nombre=pet.name,
        especie=_normalize_species(pet.species),
        raza=(pet.breed or "Sin raza"),
        edad=_infer_age(pet),
        tamano=size,
        sexo=_normalize_gender(pet.gender),
        ciudad=city,
        departamento=department,
        descripcion=_compose_description(pet),
        foto_url=image_url,
        vacunas_al_dia=pet.vaccinated,
        esterilizado=pet.sterilized,
        adopcion_estado=pet.adoption_status or "available",
        peso_kg=weight_kg,
        peso_texto=weight_text,
        caracteristicas=traits or None,
        refugio=shelter_info,
    )


def _build_pet_from_mapping(data: dict) -> AdoptionPet:
    refugio_data = data.get("refugio") or {}
    shelter = ShelterInfo(**refugio_data) if refugio_data.get("id") else None
    return AdoptionPet(
        id=str(data.get("id")),
        nombre=data.get("nombre", "Mascota"),
        especie=data.get("especie"),
        raza=data.get("raza"),
        edad=data.get("edad"),
        tamano=data.get("tamano"),
        sexo=data.get("sexo"),
        ciudad=data.get("ciudad"),
        departamento=data.get("departamento"),
        descripcion=data.get("descripcion"),
        foto_url=data.get("foto_url"),
        vacunas_al_dia=data.get("vacunas_al_dia"),
        esterilizado=data.get("esterilizado"),
        adopcion_estado=data.get("adopcion_estado"),
        peso_kg=data.get("peso_kg"),
        peso_texto=data.get("peso_texto"),
        caracteristicas=data.get("caracteristicas") or data.get("traits"),
        refugio=shelter,
    )


def _filter_pets(
    pets: Iterable[AdoptionPet],
    species: str | None,
    city: str | None,
    search: str | None,
) -> list[AdoptionPet]:
    result = list(pets)

    if species:
        species_lower = species.lower()
        result = [pet for pet in result if (pet.especie or "").lower() == species_lower]

    if city:
        city_lower = city.lower()
        result = [
            pet
            for pet in result
            if (pet.ciudad or "").lower() == city_lower
            or (pet.refugio and (pet.refugio.ciudad or "").lower() == city_lower)
        ]

    if search:
        query = search.lower()
        result = [
            pet
            for pet in result
            if query in (pet.nombre or "").lower()
            or query in (pet.raza or "").lower()
            or query in (pet.descripcion or "").lower()
        ]

    return result


def _load_adoptable_pets(db: Session) -> list[AdoptionPet]:
    stmt = (
        select(Pet)
        .options(joinedload(Pet.owner))
        .where(Pet.is_for_adoption.is_(True))
        .where(Pet.is_active.is_(True))
        .where(or_(Pet.adoption_status.is_(None), Pet.adoption_status != "adopted"))
        .where(Pet.owner.has(User.role == "shelter"))
        .order_by(Pet.created_at.desc())
    )

    pets = db.scalars(stmt).all()
    return [_build_pet_from_model(pet) for pet in pets]


@router.get("", response_model=AdoptionResponse)
def list_adoptable_pets(
    species: str | None = Query(default=None, description="Filtra por especie, por ejemplo 'Perro' o 'Gato'"),
    city: str | None = Query(default=None, description="Filtra por ciudad"),
    search: str | None = Query(default=None, description="Texto libre para buscar por nombre, raza o descripcion"),
    db: Session = Depends(get_db),
) -> AdoptionResponse:
    adoptable_pets = _load_adoptable_pets(db)
    source = "database"

    dataset = adoptable_pets
    if not adoptable_pets:
        fallback_pets = [_build_pet_from_mapping(pet) for pet in ADOPTABLE_PETS]
        dataset = fallback_pets
        source = "fallback"

    filtered = _filter_pets(dataset, species, city, search)

    return AdoptionResponse(animales=filtered, total=len(filtered), source=source)
