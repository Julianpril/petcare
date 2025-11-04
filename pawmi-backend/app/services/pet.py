from typing import List, Optional
from uuid import UUID

from app.models import Pet
from app.schemas.pet import PetCreate, PetUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def get_pet(db: Session, pet_id: UUID) -> Optional[Pet]:
    return db.get(Pet, pet_id)


def get_pets_by_owner(db: Session, owner_id: UUID) -> List[Pet]:
    stmt = select(Pet).where(Pet.owner_id == owner_id).order_by(Pet.created_at.desc())
    return list(db.scalars(stmt))


def create_pet(db: Session, pet_in: PetCreate) -> Pet:
    db_pet = Pet(**pet_in.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet


def update_pet(db: Session, db_pet: Pet, pet_in: PetUpdate) -> Pet:
    for field, value in pet_in.model_dump(exclude_unset=True).items():
        setattr(db_pet, field, value)
    db.commit()
    db.refresh(db_pet)
    return db_pet


def delete_pet(db: Session, db_pet: Pet) -> None:
    db.delete(db_pet)
    db.commit()
