from __future__ import annotations

from uuid import UUID

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models import Reminder, User
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.services.pet import get_pet
from app.services.reminder import (create_reminder, delete_reminder,
                                   get_reminder, get_reminders_for_pet,
                                   get_reminders_for_user, update_reminder)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/", response_model=list[ReminderRead])
def list_reminders(
    pet_id: UUID | None = Query(default=None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[Reminder]:
    if pet_id:
        pet = get_pet(db, pet_id)
        if pet is None or pet.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
        return get_reminders_for_pet(db, pet_id)

    return get_reminders_for_user(db, current_user.id)


@router.post("/", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
def create_reminder_endpoint(
    reminder_in: ReminderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Reminder:
    pet = get_pet(db, reminder_in.pet_id)
    if pet is None or pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")

    payload = reminder_in.model_copy(update={"user_id": current_user.id})
    return create_reminder(db, payload)


@router.put("/{reminder_id}", response_model=ReminderRead)
def update_reminder_endpoint(
    reminder_id: UUID,
    reminder_in: ReminderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Reminder:
    reminder = get_reminder(db, reminder_id)
    if reminder is None or reminder.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    if reminder_in.pet_id:
        pet = get_pet(db, reminder_in.pet_id)
        if pet is None or pet.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")

    return update_reminder(db, reminder, reminder_in)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder_endpoint(
    reminder_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> None:
    reminder = get_reminder(db, reminder_id)
    if reminder is None or reminder.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    delete_reminder(db, reminder)
