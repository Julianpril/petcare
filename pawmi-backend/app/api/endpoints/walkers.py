"""
Endpoints para gestión de paseadores
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.api.deps import get_current_user, get_db
from app.models.pet import Pet
from app.models.user import User
from app.models.walker import Walker, WalkerBooking, WalkerReview
from app.schemas.walker import (WalkerBookingCreate, WalkerBookingResponse,
                                WalkerBookingUpdate, WalkerCreate,
                                WalkerResponse, WalkerReviewCreate,
                                WalkerReviewResponse, WalkerSearchFilters,
                                WalkerUpdate)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload

router = APIRouter()


# ============= WALKER PROFILES =============

@router.post("/walkers", response_model=WalkerResponse, status_code=status.HTTP_201_CREATED)
def become_walker(
    walker_data: WalkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registrarse como paseador"""
    # Verificar que el usuario no sea ya un paseador
    existing_walker = db.query(Walker).filter(Walker.user_id == current_user.id).first()
    if existing_walker:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya estás registrado como paseador"
        )
    
    # Actualizar rol del usuario a 'walker'
    current_user.role = "walker"
    
    # Crear perfil de paseador
    walker = Walker(
        user_id=current_user.id,
        **walker_data.model_dump(exclude_unset=True)
    )
    
    db.add(walker)
    db.commit()
    db.refresh(walker)
    
    # Agregar información del usuario
    response = WalkerResponse.model_validate(walker)
    response.user_name = current_user.full_name
    response.user_email = current_user.email
    response.user_profile_image = current_user.profile_image_url
    response.user_phone = current_user.phone
    
    return response


@router.get("/walkers/me", response_model=WalkerResponse)
def get_my_walker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener mi perfil de paseador"""
    walker = db.query(Walker).filter(Walker.user_id == current_user.id).first()
    if not walker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes un perfil de paseador"
        )
    
    response = WalkerResponse.model_validate(walker)
    response.user_name = current_user.full_name
    response.user_email = current_user.email
    response.user_profile_image = current_user.profile_image_url
    response.user_phone = current_user.phone
    
    return response


@router.get("/walkers", response_model=List[WalkerResponse])
def search_walkers(
    city: Optional[str] = Query(None),
    neighborhood: Optional[str] = Query(None),
    max_hourly_rate: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    service_type: Optional[str] = Query(None),
    pet_size: Optional[str] = Query(None),
    pet_type: Optional[str] = Query(None),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    max_distance_km: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Buscar paseadores con filtros"""
    query = db.query(Walker).options(joinedload(Walker.user))
    
    # Filtro: solo paseadores activos
    query = query.filter(Walker.is_active == True)
    
    # Filtros de ubicación
    if city:
        query = query.filter(Walker.city.ilike(f"%{city}%"))
    if neighborhood:
        query = query.filter(Walker.neighborhood.ilike(f"%{neighborhood}%"))
    
    # Filtro de precio
    if max_hourly_rate:
        query = query.filter(Walker.hourly_rate <= max_hourly_rate)
    
    # Filtro de calificación
    if min_rating:
        query = query.filter(Walker.rating_average >= min_rating)
    
    # Filtro de tipo de servicio
    if service_type:
        query = query.filter(Walker.services.contains([service_type]))
    
    # Filtro de tamaño de mascota
    if pet_size:
        query = query.filter(Walker.accepted_pet_sizes.contains([pet_size]))
    
    # Filtro de tipo de mascota
    if pet_type:
        query = query.filter(Walker.accepted_pet_types.contains([pet_type]))
    
    # Filtro de distancia (si se proporcionan coordenadas)
    if latitude and longitude and max_distance_km:
        # Usar fórmula Haversine simplificada (aproximación)
        # En producción, considerar usar PostGIS para mayor precisión
        lat_diff = func.abs(Walker.latitude - latitude)
        lon_diff = func.abs(Walker.longitude - longitude)
        # Aproximación: 1 grado ≈ 111 km
        distance = func.sqrt(
            func.pow(lat_diff * 111, 2) + 
            func.pow(lon_diff * 111 * func.cos(func.radians(latitude)), 2)
        )
        query = query.filter(distance <= max_distance_km)
    
    # Ordenar por calificación (descendente)
    query = query.order_by(Walker.rating_average.desc().nullslast())
    
    walkers = query.offset(skip).limit(limit).all()
    
    # Agregar información del usuario
    results = []
    for walker in walkers:
        response = WalkerResponse.model_validate(walker)
        response.user_name = walker.user.full_name
        response.user_email = walker.user.email
        response.user_profile_image = walker.user.profile_image_url
        response.user_phone = walker.user.phone
        results.append(response)
    
    return results


@router.get("/walkers/{walker_id}", response_model=WalkerResponse)
def get_walker(walker_id: UUID, db: Session = Depends(get_db)):
    """Obtener perfil de paseador por ID"""
    walker = db.query(Walker).options(joinedload(Walker.user)).filter(Walker.id == walker_id).first()
    if not walker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
        detail="Paseador no encontrado"
    )
    
    response = WalkerResponse.model_validate(walker)
    response.user_name = walker.user.full_name
    response.user_email = walker.user.email
    response.user_profile_image = walker.user.profile_image_url
    response.user_phone = walker.user.phone
    
    return response
@router.put("/walkers/{walker_id}", response_model=WalkerResponse)
def update_walker(
    walker_id: UUID,
    walker_data: WalkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar perfil de paseador"""
    walker = db.query(Walker).filter(Walker.id == walker_id).first()
    if not walker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paseador no encontrado"
        )
    
    # Verificar que sea el dueño del perfil
    if walker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este perfil"
        )
    
    # Actualizar campos
    for field, value in walker_data.model_dump(exclude_unset=True).items():
        setattr(walker, field, value)
    
    walker.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(walker)
    
    response = WalkerResponse.model_validate(walker)
    response.user_name = current_user.full_name
    response.user_email = current_user.email
    response.user_profile_image = current_user.profile_image_url
    response.user_phone = current_user.phone
    
    return response


# ============= WALKER REVIEWS =============

@router.post("/walkers/{walker_id}/reviews", response_model=WalkerReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    walker_id: UUID,
    review_data: WalkerReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear reseña para un paseador"""
    # Verificar que el paseador existe
    walker = db.query(Walker).filter(Walker.id == walker_id).first()
    if not walker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paseador no encontrado"
        )
    
    # Verificar que no sea su propia reseña
    if walker.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes reseñar tu propio perfil"
        )
    
    # Verificar que el usuario tenga una reserva completada con este paseador
    completed_booking = db.query(WalkerBooking).filter(
        and_(
            WalkerBooking.walker_id == walker_id,
            WalkerBooking.pet_owner_id == current_user.id,
            WalkerBooking.status == "completed"
        )
    ).first()
    
    if not completed_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes tener al menos una reserva completada con este paseador"
        )
    
    # Crear reseña
    review = WalkerReview(
        walker_id=walker_id,
        reviewer_id=current_user.id,
        **review_data.model_dump(exclude={"walker_id"})
    )
    
    db.add(review)
    
    # Actualizar estadísticas del paseador
    total_reviews = db.query(func.count(WalkerReview.id)).filter(
        WalkerReview.walker_id == walker_id
    ).scalar() + 1
    
    avg_rating = db.query(func.avg(WalkerReview.rating)).filter(
        WalkerReview.walker_id == walker_id
    ).scalar()
    avg_rating = (avg_rating * (total_reviews - 1) + review_data.rating) / total_reviews
    
    walker.total_reviews = total_reviews
    walker.rating_average = round(avg_rating, 2)
    
    db.commit()
    db.refresh(review)
    
    response = WalkerReviewResponse.model_validate(review)
    response.reviewer_name = current_user.full_name
    response.reviewer_image = current_user.profile_image_url
    
    return response


@router.get("/walkers/{walker_id}/reviews", response_model=List[WalkerReviewResponse])
def get_walker_reviews(
    walker_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtener reseñas de un paseador"""
    reviews = db.query(WalkerReview).options(
        joinedload(WalkerReview.reviewer)
    ).filter(
        WalkerReview.walker_id == walker_id
    ).order_by(
        WalkerReview.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    results = []
    for review in reviews:
        response = WalkerReviewResponse.model_validate(review)
        response.reviewer_name = review.reviewer.full_name
        response.reviewer_image = review.reviewer.profile_image_url
        results.append(response)
    
    return results


# ============= WALKER BOOKINGS =============

@router.post("/walkers/bookings", response_model=WalkerBookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: WalkerBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crear una reserva con un paseador"""
    # Verificar que el paseador existe y está activo
    walker = db.query(Walker).filter(Walker.id == booking_data.walker_id).first()
    if not walker or not walker.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paseador no encontrado o inactivo"
        )
    
    # Verificar que la mascota existe y pertenece al usuario
    pet = db.query(Pet).filter(
        and_(Pet.id == booking_data.pet_id, Pet.owner_id == current_user.id)
    ).first()
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mascota no encontrada"
        )
    
    # Calcular precio total
    total_price = walker.hourly_rate * booking_data.duration_hours if walker.hourly_rate else None
    
    # Crear reserva
    booking = WalkerBooking(
        walker_id=booking_data.walker_id,
        pet_owner_id=current_user.id,
        pet_id=booking_data.pet_id,
        service_type=booking_data.service_type,
        scheduled_date=booking_data.scheduled_date,
        duration_hours=booking_data.duration_hours,
        total_price=total_price,
        notes=booking_data.notes,
        status="pending"
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    response = WalkerBookingResponse.model_validate(booking)
    response.walker_name = walker.user.full_name
    response.pet_name = pet.name
    
    return response


@router.get("/walkers/bookings", response_model=List[WalkerBookingResponse])
def get_my_bookings(
    status_filter: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener mis reservas (como dueño de mascota o como paseador)"""
    # Verificar si el usuario es paseador
    walker = db.query(Walker).filter(Walker.user_id == current_user.id).first()
    
    if walker:
        # Mostrar reservas donde es el paseador
        query = db.query(WalkerBooking).options(
            joinedload(WalkerBooking.pet_owner),
            joinedload(WalkerBooking.pet)
        ).filter(WalkerBooking.walker_id == walker.id)
    else:
        # Mostrar reservas donde es el dueño
        query = db.query(WalkerBooking).options(
            joinedload(WalkerBooking.walker).joinedload(Walker.user),
            joinedload(WalkerBooking.pet)
        ).filter(WalkerBooking.pet_owner_id == current_user.id)
    
    if status_filter:
        query = query.filter(WalkerBooking.status == status_filter)
    
    bookings = query.order_by(
        WalkerBooking.scheduled_date.desc()
    ).offset(skip).limit(limit).all()
    
    results = []
    for booking in bookings:
        response = WalkerBookingResponse.model_validate(booking)
        response.pet_name = booking.pet.name
        
        if walker:
            # Como paseador, mostrar nombre del dueño
            response.walker_name = current_user.full_name
        else:
            # Como dueño, mostrar nombre del paseador
            response.walker_name = booking.walker.user.full_name
        
        results.append(response)
    
    return results


@router.get("/walkers/bookings/{booking_id}", response_model=WalkerBookingResponse)
def get_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener detalles de una reserva"""
    booking = db.query(WalkerBooking).options(
        joinedload(WalkerBooking.walker).joinedload(Walker.user),
        joinedload(WalkerBooking.pet_owner),
        joinedload(WalkerBooking.pet)
    ).filter(WalkerBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    # Verificar que sea parte de la reserva
    if booking.pet_owner_id != current_user.id and booking.walker.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta reserva"
        )
    
    response = WalkerBookingResponse.model_validate(booking)
    response.walker_name = booking.walker.user.full_name
    response.pet_name = booking.pet.name
    
    return response


@router.put("/walkers/bookings/{booking_id}", response_model=WalkerBookingResponse)
def update_booking(
    booking_id: UUID,
    booking_data: WalkerBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar una reserva (cambiar estado, fecha, etc.)"""
    booking = db.query(WalkerBooking).options(
        joinedload(WalkerBooking.walker).joinedload(Walker.user),
        joinedload(WalkerBooking.pet)
    ).filter(WalkerBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    # Verificar permisos
    is_owner = booking.pet_owner_id == current_user.id
    is_walker = booking.walker.user_id == current_user.id
    
    if not is_owner and not is_walker:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar esta reserva"
        )
    
    # Validar cambios de estado según rol
    if booking_data.status:
        if booking_data.status == "confirmed" and not is_walker:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el paseador puede confirmar la reserva"
            )
        if booking_data.status == "cancelled":
            # Ambos pueden cancelar
            pass
        if booking_data.status in ["in_progress", "completed"] and not is_walker:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el paseador puede cambiar a este estado"
            )
    
    # Actualizar campos
    for field, value in booking_data.model_dump(exclude_unset=True).items():
        setattr(booking, field, value)
    
    # Si se completa, incrementar contador de paseos
    if booking_data.status == "completed" and booking.status != "completed":
        booking.walker.total_walks += 1
    
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    
    response = WalkerBookingResponse.model_validate(booking)
    response.walker_name = booking.walker.user.full_name
    response.pet_name = booking.pet.name
    
    return response
