from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from app.db.base import Base
from sqlalchemy import (Boolean, DateTime, ForeignKey, Numeric, String, Text,
                        text)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:  # Only import for type checking to avoid circular deps
    from .reminder import Reminder
    from .user import User


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    species: Mapped[str] = mapped_column(String(50), nullable=False)
    breed: Mapped[str | None] = mapped_column(String(100))
    age: Mapped[str | None] = mapped_column(String(20))
    age_years: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    weight: Mapped[str | None] = mapped_column(String(20))
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
    gender: Mapped[str | None] = mapped_column(String(20))
    color: Mapped[str | None] = mapped_column(String(100))
    microchip_id: Mapped[str | None] = mapped_column(String(50))
    image_url: Mapped[str | None] = mapped_column(Text)
    medical_history: Mapped[str | None] = mapped_column(Text)
    allergies: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    traits: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Campos para adopción (refugios)
    is_for_adoption: Mapped[bool] = mapped_column(Boolean, default=False)  # Está en adopción
    adoption_status: Mapped[str | None] = mapped_column(String(50))  # 'available', 'pending', 'adopted'
    adoption_fee: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))  # Costo de adopción
    adoption_requirements: Mapped[str | None] = mapped_column(Text)  # Requisitos para adoptar
    sterilized: Mapped[bool | None] = mapped_column(Boolean)  # ¿Está esterilizado?
    vaccinated: Mapped[bool | None] = mapped_column(Boolean)  # ¿Tiene vacunas al día?
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )

    owner: Mapped["User"] = relationship("User", back_populates="pets")
    reminders: Mapped[list["Reminder"]] = relationship(
        "Reminder", back_populates="pet", cascade="all, delete-orphan"
    )
