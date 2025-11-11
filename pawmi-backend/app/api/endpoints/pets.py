from __future__ import annotations

from uuid import UUID

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models import Pet, User
from app.schemas.pet import PetCreate, PetRead, PetUpdate
from app.services.pet import (create_pet, delete_pet, get_pet,
                              get_pets_by_owner, update_pet)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=list[PetRead])
@router.get("/", response_model=list[PetRead])
def list_pets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[Pet]:
    return get_pets_by_owner(db, current_user.id)


@router.post("", response_model=PetRead, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PetRead, status_code=status.HTTP_201_CREATED)
def create_pet_endpoint(
    pet_in: PetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Pet:
    payload = pet_in.model_copy(update={"owner_id": current_user.id})
    return create_pet(db, payload)


@router.get("/{pet_id}", response_model=PetRead)
def read_pet(
    pet_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Pet:
    pet = get_pet(db, pet_id)
    if pet is None or pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.put("/{pet_id}", response_model=PetRead)
def update_pet_endpoint(
    pet_id: UUID,
    pet_in: PetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Pet:
    pet = get_pet(db, pet_id)
    if pet is None or pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")

    return update_pet(db, pet, pet_in)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet_endpoint(
    pet_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    pet = get_pet(db, pet_id)
    if pet is None or pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")

    delete_pet(db, pet)
