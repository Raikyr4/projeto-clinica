
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.core.enums import SlotStatus

class ScheduleSlotCreate(BaseModel):
    inicio: datetime
    fim: datetime
    
    @validator('fim')
    def validate_fim(cls, v, values):
        if 'inicio' in values and v <= values['inicio']:
            raise ValueError('Fim deve ser maior que início')
        return v

class ScheduleSlotUpdate(BaseModel):
    inicio: Optional[datetime] = None
    fim: Optional[datetime] = None
    status: Optional[SlotStatus] = None
    
    @validator('fim')
    def validate_fim(cls, v, values):
        if 'inicio' in values and values['inicio'] and v and v <= values['inicio']:
            raise ValueError('Fim deve ser maior que início')
        return v

class ScheduleSlotResponse(BaseModel):
    id: UUID
    doctor_id: UUID
    inicio: datetime
    fim: datetime
    status: SlotStatus
    created_by: Optional[UUID]
    updated_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


