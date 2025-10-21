
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
from uuid import UUID
from decimal import Decimal

class DoctorProfileCreate(BaseModel):
    crm_crp: str = Field(..., min_length=3)
    especialidade: Optional[str] = None
    bio: Optional[str] = None
    valor_padrao_consulta: Decimal = Field(default=0, ge=0)

class DoctorProfileUpdate(BaseModel):
    crm_crp: Optional[str] = Field(None, min_length=3)
    especialidade: Optional[str] = None
    bio: Optional[str] = None
    valor_padrao_consulta: Optional[Decimal] = Field(None, ge=0)

class DoctorProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    crm_crp: str
    especialidade: Optional[str]
    bio: Optional[str]
    valor_padrao_consulta: Decimal
    
    class Config:
        from_attributes = True

class PatientProfileCreate(BaseModel):
    data_nascimento: Optional[date] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None

class PatientProfileUpdate(BaseModel):
    data_nascimento: Optional[date] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None

class PatientProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    data_nascimento: Optional[date]
    telefone: Optional[str]
    endereco: Optional[str]
    
    class Config:
        from_attributes = True


