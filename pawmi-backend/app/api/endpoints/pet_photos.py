"""
Endpoints para gestión de fotografías de mascotas
"""
import logging
import uuid
from typing import List

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.pet import Pet
from app.models.pet_photo import PetPhoto
from app.models.user import User
from app.schemas.pet_photo import (BeforeAfterPhotos, PetPhotoCreate,
                                   PetPhotoResponse, PetPhotoUpdate)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pet-photos", tags=["Pet Photos"])


@router.post("", response_model=PetPhotoResponse, status_code=status.HTTP_201_CREATED)
async def create_pet_photo(
    photo_data: PetPhotoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva fotografía para una mascota.
    
    **Categorías disponibles:**
    - general: Fotos generales
    - medical: Fotos médicas
    - before: Foto antes de tratamiento
    - after: Foto después de tratamiento
    - profile: Foto de perfil
    - vaccination: Foto de vacunación
    - grooming: Foto de aseo/baño
    """
    try:
        # Verificar que la mascota existe y pertenece al usuario
        pet = db.query(Pet).filter(
            and_(Pet.id == photo_data.pet_id, Pet.owner_id == current_user.id)
        ).first()
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada"
            )
        
        # Si es foto principal, desmarcar las anteriores
        if photo_data.is_primary:
            db.query(PetPhoto).filter(
                and_(PetPhoto.pet_id == photo_data.pet_id, PetPhoto.is_primary == True)
            ).update({"is_primary": False})
            
            # También actualizar la foto principal de la mascota
            pet.image_url = photo_data.photo_url
        
        # Crear la foto
        new_photo = PetPhoto(
            id=str(uuid.uuid4()),
            **photo_data.model_dump()
        )
        
        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)
        
        logger.info(f"✅ Foto creada para mascota {photo_data.pet_id} por usuario {current_user.email}")
        return new_photo
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creando foto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la foto: {str(e)}"
        )


@router.get("/pet/{pet_id}", response_model=List[PetPhotoResponse])
async def get_pet_photos(
    pet_id: str,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las fotos de una mascota.
    
    **Filtros opcionales:**
    - category: Filtrar por categoría específica
    """
    try:
        # Verificar que la mascota pertenece al usuario
        pet = db.query(Pet).filter(
            and_(Pet.id == pet_id, Pet.owner_id == current_user.id)
        ).first()
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada"
            )
        
        # Construir query
        query = db.query(PetPhoto).filter(PetPhoto.pet_id == pet_id)
        
        if category:
            query = query.filter(PetPhoto.category == category)
        
        photos = query.order_by(PetPhoto.created_at.desc()).all()
        
        return photos
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo fotos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las fotos: {str(e)}"
        )


@router.get("/{photo_id}", response_model=PetPhotoResponse)
async def get_pet_photo(
    photo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener una foto específica"""
    try:
        photo = db.query(PetPhoto).filter(PetPhoto.id == photo_id).first()
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Foto no encontrada"
            )
        
        # Verificar que la mascota pertenece al usuario
        pet = db.query(Pet).filter(
            and_(Pet.id == photo.pet_id, Pet.owner_id == current_user.id)
        ).first()
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para ver esta foto"
            )
        
        return photo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo foto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la foto: {str(e)}"
        )


@router.put("/{photo_id}", response_model=PetPhotoResponse)
async def update_pet_photo(
    photo_id: str,
    photo_data: PetPhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar información de una foto"""
    try:
        photo = db.query(PetPhoto).filter(PetPhoto.id == photo_id).first()
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Foto no encontrada"
            )
        
        # Verificar permisos
        pet = db.query(Pet).filter(
            and_(Pet.id == photo.pet_id, Pet.owner_id == current_user.id)
        ).first()
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para editar esta foto"
            )
        
        # Si se marca como principal, desmarcar las demás
        if photo_data.is_primary:
            db.query(PetPhoto).filter(
                and_(PetPhoto.pet_id == photo.pet_id, PetPhoto.is_primary == True)
            ).update({"is_primary": False})
            
            # Actualizar foto principal de la mascota
            pet.image_url = photo.photo_url
        
        # Actualizar campos
        update_data = photo_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(photo, field, value)
        
        db.commit()
        db.refresh(photo)
        
        logger.info(f"✅ Foto {photo_id} actualizada")
        return photo
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error actualizando foto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la foto: {str(e)}"
        )


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet_photo(
    photo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Eliminar una foto"""
    try:
        photo = db.query(PetPhoto).filter(PetPhoto.id == photo_id).first()
        
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Foto no encontrada"
            )
        
        # Verificar permisos
        pet = db.query(Pet).filter(
            and_(Pet.id == photo.pet_id, Pet.owner_id == current_user.id)
        ).first()
        
        if not pet:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar esta foto"
            )
        
        db.delete(photo)
        db.commit()
        
        logger.info(f"✅ Foto {photo_id} eliminada")
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error eliminando foto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la foto: {str(e)}"
        )


@router.get("/treatment/{treatment_id}/before-after", response_model=BeforeAfterPhotos)
async def get_before_after_photos(
    treatment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener fotos antes/después de un tratamiento específico.
    """
    try:
        before_photo = db.query(PetPhoto).filter(
            and_(
                PetPhoto.treatment_id == treatment_id,
                PetPhoto.category == "before"
            )
        ).first()
        
        after_photo = db.query(PetPhoto).filter(
            and_(
                PetPhoto.treatment_id == treatment_id,
                PetPhoto.category == "after"
            )
        ).first()
        
        # Verificar permisos si existe alguna foto
        if before_photo or after_photo:
            photo_to_check = before_photo if before_photo else after_photo
            if photo_to_check:
                pet = db.query(Pet).filter(
                    and_(Pet.id == photo_to_check.pet_id, Pet.owner_id == current_user.id)
                ).first()
                
                if not pet:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No tienes permiso para ver estas fotos"
                    )
        
        # Convertir a PetPhotoResponse
        before_response = PetPhotoResponse.model_validate(before_photo) if before_photo else None
        after_response = PetPhotoResponse.model_validate(after_photo) if after_photo else None
        
        return BeforeAfterPhotos(
            treatment_id=treatment_id,
            before_photo=before_response,
            after_photo=after_response,
            description=before_photo.description if before_photo else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo fotos antes/después: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las fotos: {str(e)}"
        )
