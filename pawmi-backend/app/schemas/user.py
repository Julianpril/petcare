from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: str = Field(default="user", max_length=50)
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: Optional[str] = Field(default=None, max_length=50)
    is_active: Optional[bool] = None


class UserRead(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserPublic(BaseModel):
    id: UUID
    username: str
    full_name: Optional[str] = None
    profile_image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
    email: Optional[EmailStr] = None
    role: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    """Schema para login con Google OAuth"""
    id_token: str
    access_token: Optional[str] = None


class GoogleUserInfo(BaseModel):
    """Información del usuario de Google"""
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: str = Field(..., alias="sub")
