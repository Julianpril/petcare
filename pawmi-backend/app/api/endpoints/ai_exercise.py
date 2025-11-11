"""
Endpoint para generar rutinas de ejercicio usando Gemini AI
"""
from typing import Any
from uuid import UUID

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.services.gemini_service import generate_exercise_routine
from app.services.pet import get_pet
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class ExerciseRoutineRequest(BaseModel):
    pet_id: UUID


class ExerciseRoutineResponse(BaseModel):
    routine: str
    pet_name: str


@router.post("/generate-exercise-routine", response_model=ExerciseRoutineResponse)
def generate_exercise_routine_endpoint(
    request: ExerciseRoutineRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Genera una rutina de ejercicio personalizada para una mascota usando Gemini AI
    """
    # Verificar que la mascota existe y pertenece al usuario
    pet = get_pet(db, request.pet_id)
    if pet is None or pet.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet not found"
        )

    # Generar la rutina usando Gemini
    try:
        routine = generate_exercise_routine(
            name=pet.name,
            breed=pet.breed or "Desconocida",
            age=pet.age or (f"{pet.age_years} años" if pet.age_years else "Desconocida"),
            weight=pet.weight or (f"{pet.weight_kg} kg" if pet.weight_kg else "Desconocido"),
            animal_type=pet.species or "perro"
        )
        
        return ExerciseRoutineResponse(
            routine=routine,
            pet_name=pet.name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating exercise routine: {str(e)}"
        )
