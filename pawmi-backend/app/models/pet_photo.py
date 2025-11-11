"""
Modelo de fotografías de mascotas
"""
from datetime import datetime
from typing import Optional

from app.db.base import Base
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class PetPhoto(Base):
    """
    Modelo para galería de fotos de mascotas.
    Permite múltiples fotos por mascota con categorización.
    """
    __tablename__ = "pet_photos"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    pet_id: Mapped[str] = mapped_column(String, ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Categoría de la foto
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="general")
    # Categorías: general, medical, before, after, profile, vaccination, grooming
    
    # Descripción opcional
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # ID de tratamiento relacionado (para fotos antes/después)
    treatment_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Indica si es la foto principal/perfil
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Metadatos
    taken_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    # pet = relationship("Pet", back_populates="photos")

    def __repr__(self):
        return f"<PetPhoto(id={self.id}, pet_id={self.pet_id}, category={self.category})>"
