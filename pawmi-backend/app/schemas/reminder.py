from datetime import date, datetime
from datetime import time as datetime_time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReminderBase(BaseModel):
    category: str = Field(max_length=50)
    title: str = Field(max_length=255)
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    time: Optional[datetime_time] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = Field(default=None, max_length=50)
    is_completed: bool = False
    notification_sent: bool = False


class ReminderCreate(ReminderBase):
    pet_id: UUID
    user_id: UUID


class ReminderUpdate(BaseModel):
    pet_id: Optional[UUID] = None
    category: Optional[str] = Field(default=None, max_length=50)
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    time: Optional[datetime_time] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = Field(default=None, max_length=50)
    is_completed: Optional[bool] = None
    notification_sent: Optional[bool] = None


class ReminderRead(ReminderBase):
    id: UUID
    pet_id: UUID
    user_id: UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
