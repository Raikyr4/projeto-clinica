
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from app.core.enums import PaymentStatus

class PaymentCreate(BaseModel):
    appointment_id: UUID
    valor: Decimal = Field(..., ge=0)
    metodo: str = Field(default="CARTAO_FAKE")

class PaymentResponse(BaseModel):
    id: UUID
    appointment_id: UUID
    patient_id: UUID
    valor: Decimal
    status: PaymentStatus
    metodo: str
    nsu_fake: str
    created_at: datetime
    
    class Config:
        from_attributes = True


