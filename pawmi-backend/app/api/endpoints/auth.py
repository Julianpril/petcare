from __future__ import annotations

from app.api.deps import get_current_active_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models import User
from app.schemas.user import (GoogleLoginRequest, Token, UserCreate,
                              UserLoginRequest, UserRead)
from app.services.user import (authenticate_user, create_or_update_google_user,
                               create_user, get_user_by_email)
from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    return create_user(db, user_in)


@router.post("/login", response_model=Token)
def login(user_in: UserLoginRequest, db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(
        subject=str(user.id),
        extra_claims={"email": user.email, "role": user.role},
    )
    return Token(access_token=token)


@router.post("/google", response_model=Token)
def google_login(google_data: GoogleLoginRequest, db: Session = Depends(get_db)) -> Token:
    """
    Endpoint para autenticación con Google OAuth.
    Verifica el ID token de Google y crea/actualiza el usuario en la base de datos.
    """
    GOOGLE_CLIENT_ID = "298440754227-58krj7bdii9gdpbjorfg3u5ib4550dtu.apps.googleusercontent.com"
    
    try:
        # Verificar el ID token de Google
        idinfo = id_token.verify_oauth2_token(
            google_data.id_token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        # Extraer información del usuario
        google_id = idinfo.get("sub")
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token: missing required fields"
            )
        
        # Crear o actualizar usuario en la base de datos
        user = create_or_update_google_user(
            db=db,
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )
        
        # Crear token JWT para el usuario
        token = create_access_token(
            subject=str(user.id),
            extra_claims={"email": user.email, "role": user.role},
        )
        
        return Token(access_token=token)
        
    except ValueError as e:
        # Token inválido o expirado
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        # Cualquier otro error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing Google login: {str(e)}"
        )


@router.post("/logout")
def logout():
    """
    Endpoint de logout. El cliente debe eliminar el token localmente.
    En el futuro se podría implementar una blacklist de tokens.
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user
