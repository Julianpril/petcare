from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from app.models import Reminder
from app.schemas.reminder import ReminderCreate, ReminderUpdate
from sqlalchemy import select
from sqlalchemy.orm import Session


def get_reminder(db: Session, reminder_id: UUID) -> Optional[Reminder]:
    return db.get(Reminder, reminder_id)


def get_reminders_for_user(db: Session, user_id: UUID) -> List[Reminder]:
    stmt = select(Reminder).where(Reminder.user_id == user_id).order_by(Reminder.start_date.asc())
    return list(db.scalars(stmt))


def get_reminders_for_pet(db: Session, pet_id: UUID) -> List[Reminder]:
    stmt = select(Reminder).where(Reminder.pet_id == pet_id).order_by(Reminder.start_date.asc())
    return list(db.scalars(stmt))


def create_reminder(db: Session, reminder_in: ReminderCreate) -> Reminder:
    db_reminder = Reminder(**reminder_in.model_dump())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder


def update_reminder(db: Session, db_reminder: Reminder, reminder_in: ReminderUpdate) -> Reminder:
    data = reminder_in.model_dump(exclude_unset=True)
    is_completed = data.pop("is_completed", None)

    for field, value in data.items():
        setattr(db_reminder, field, value)

    if is_completed is not None:
        db_reminder.is_completed = is_completed
    db_reminder.completed_at = datetime.now(timezone.utc) if is_completed else None

    db.commit()
    db.refresh(db_reminder)
    return db_reminder


def delete_reminder(db: Session, db_reminder: Reminder) -> None:
    db.delete(db_reminder)
    db.commit()
