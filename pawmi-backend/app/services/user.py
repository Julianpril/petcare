from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from sqlalchemy import or_, select
from sqlalchemy.orm import Session


def get_user(db: Session, user_id: UUID) -> Optional[User]:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.scalar(stmt)


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    stmt = select(User).where(User.username == username)
    return db.scalar(stmt)


def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    """Obtener usuario por Google ID"""
    stmt = select(User).where(User.google_id == google_id)
    return db.scalar(stmt)


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        address=user_in.address,
        profile_image_url=user_in.profile_image_url,
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    for field, value in user_in.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    # Buscar usuario por email o username
    stmt = select(User).where(or_(User.email == email, User.username == email))
    user = db.scalar(stmt)
    
    if user is None:
        return None
    # Usuarios de Google no tienen contraseña, no pueden usar login tradicional
    if user.password_hash is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    user.last_login = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_or_update_google_user(
    db: Session,
    google_id: str,
    email: str,
    name: Optional[str] = None,
    picture: Optional[str] = None
) -> User:
    """
    Crear o actualizar usuario de Google OAuth.
    Si el usuario existe por email o google_id, actualiza sus datos.
    Si no existe, crea uno nuevo.
    """
    # Buscar por google_id primero
    user = get_user_by_google_id(db, google_id)
    
    if not user:
        # Buscar por email (usuario existente que se conecta con Google)
        user = get_user_by_email(db, email)
        
        if user:
            # Usuario existente conectándose con Google por primera vez
            user.google_id = google_id
            user.auth_provider = "google"
        else:
            # Crear nuevo usuario
            username = email.split('@')[0]  # Usar parte antes del @ como username
            
            # Si el username ya existe, agregar un número
            existing_username = db.scalar(select(User).where(User.username == username))
            if existing_username:
                import random
                username = f"{username}{random.randint(1000, 9999)}"
            
            user = User(
                email=email,
                username=username,
                full_name=name,
                profile_image_url=picture,
                google_id=google_id,
                auth_provider="google",
                password_hash=None,  # No tiene contraseña porque usa Google
                is_active=True,
                role="user"
            )
            db.add(user)
    
    # Actualizar last_login y otros datos
    user.last_login = datetime.now(timezone.utc)
    if name and not user.full_name:
        user.full_name = name
    if picture and not user.profile_image_url:
        user.profile_image_url = picture
    
    db.commit()
    db.refresh(user)
    return user
