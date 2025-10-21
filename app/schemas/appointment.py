
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.core.enums import AppointmentStatus

class AppointmentCreate(BaseModel):
    slot_id: UUID
    observacoes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    observacoes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: UUID
    slot_id: UUID
    patient_id: UUID
    status: AppointmentStatus
    observacoes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


