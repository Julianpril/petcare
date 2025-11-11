from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from app.db.base import Base
from sqlalchemy import Boolean, DateTime, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .pet import Pet
    from .reminder import Reminder
    from .walker import Walker


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email"), UniqueConstraint("username"))

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)  # Nullable para Google OAuth
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    profile_image_url: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(50), default="user")  # 'user', 'admin', 'shelter'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Campos específicos para refugios
    shelter_name: Mapped[str | None] = mapped_column(String(255))  # Nombre del refugio
    shelter_description: Mapped[str | None] = mapped_column(Text)  # Descripción del refugio
    shelter_license: Mapped[str | None] = mapped_column(String(100))  # Licencia/registro oficial
    is_verified_shelter: Mapped[bool] = mapped_column(Boolean, default=False)  # Verificado por admin
    
    # Google OAuth fields
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    auth_provider: Mapped[str] = mapped_column(String(50), default="local")  # 'local' or 'google'
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("NOW()"), onupdate=text("NOW()")
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    pets: Mapped[list["Pet"]] = relationship("Pet", back_populates="owner", cascade="all, delete-orphan")
    reminders: Mapped[list["Reminder"]] = relationship(
        "Reminder", back_populates="user", cascade="all, delete-orphan"
    )
    walker_profile: Mapped["Walker"] = relationship("Walker", back_populates="user", uselist=False, cascade="all, delete-orphan")
