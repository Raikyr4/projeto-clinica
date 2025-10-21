
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.core.enums import UserRole

class UserBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=200)
    email: EmailStr
    cpf: str = Field(..., min_length=11, max_length=11)
    
    @validator('cpf')
    def validate_cpf(cls, v):
        if not v.isdigit():
            raise ValueError('CPF deve conter apenas dígitos')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.PACIENTE

class UserUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=200)
    email: Optional[EmailStr] = None
    ativo: Optional[bool] = None

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: UUID
    role: UserRole
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserWithProfile(UserResponse):
    admin_profile: Optional[Any] = None
    doctor_profile: Optional[Any] = None
    patient_profile: Optional[Any] = None


