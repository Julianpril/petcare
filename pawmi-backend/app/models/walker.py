"""
Modelo de Paseadores de Mascotas
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from app.db.base import Base
from sqlalchemy import (Boolean, DateTime, Float, ForeignKey, Integer, String,
                        Text, text)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .pet import Pet
    from .user import User


class Walker(Base):
    """
    Modelo para paseadores de mascotas.
    Un usuario puede registrarse como paseador y ofrecer sus servicios.
    """
    __tablename__ = "walkers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    
    # Relación con usuario
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # Un usuario solo puede ser un paseador
        index=True
    )
    
    # Información profesional
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    certifications: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    
    # Servicios y precios
    hourly_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Tarifa por hora
    services: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    # Servicios: walking, daycare, overnight, training, grooming
    
    # Disponibilidad
    availability_schedule: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    max_pets_per_walk: Mapped[int] = mapped_column(Integer, default=3)
    
    # Ubicación
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    neighborhood: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    service_radius_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Preferencias
    accepted_pet_sizes: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    # Sizes: small, medium, large, giant
    accepted_pet_types: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    # Types: dog, cat, other
    
    # Verificación y estado
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # Verificado por admin
    background_check_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Estadísticas
    total_walks: Mapped[int] = mapped_column(Integer, default=0)
    rating_average: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    
    # Fotos
    profile_photos: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    
    # Metadatos
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("NOW()"),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("NOW()"),
        nullable=False
    )
    
    # Relaciones
    user: Mapped["User"] = relationship("User", back_populates="walker_profile")
    reviews: Mapped[list["WalkerReview"]] = relationship("WalkerReview", back_populates="walker", cascade="all, delete-orphan")
    bookings: Mapped[list["WalkerBooking"]] = relationship("WalkerBooking", back_populates="walker", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Walker(id={self.id}, user_id={self.user_id}, rating={self.rating_average})>"


class WalkerReview(Base):
    """
    Modelo para reseñas de paseadores
    """
    __tablename__ = "walker_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    
    walker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("walkers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 estrellas
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Detalles del servicio
    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    service_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("NOW()"),
        nullable=False
    )
    
    # Relaciones
    walker: Mapped["Walker"] = relationship("Walker", back_populates="reviews")
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewer_id])

    def __repr__(self):
        return f"<WalkerReview(walker_id={self.walker_id}, rating={self.rating})>"


class WalkerBooking(Base):
    """
    Modelo para reservas de paseos
    """
    __tablename__ = "walker_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("uuid_generate_v4()"),
    )
    
    walker_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("walkers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    pet_owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    pet_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pets.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Detalles de la reserva
    service_type: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_hours: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Estado
    status: Mapped[str] = mapped_column(String(50), default="pending")
    # Status: pending, confirmed, in_progress, completed, cancelled
    
    # Notas
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Metadatos
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("NOW()"),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("NOW()"),
        nullable=False
    )
    
    # Relaciones
    walker: Mapped["Walker"] = relationship("Walker", back_populates="bookings")
    pet_owner: Mapped["User"] = relationship("User", foreign_keys=[pet_owner_id])
    pet: Mapped["Pet"] = relationship("Pet")
    
    def __repr__(self):
        return f"<WalkerBooking(id={self.id}, status={self.status})>"
