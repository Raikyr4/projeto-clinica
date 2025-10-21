
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotResponse, ScheduleSlotUpdate
from app.services.schedule_service import ScheduleService
from app.api.deps import get_current_user, get_current_admin_or_doctor
from app.models.user import User
from app.core.enums import UserRole

router = APIRouter(tags=["Agenda"])

@router.get("/doctors/{doctor_id}/agenda", response_model=List[ScheduleSlotResponse])
def get_doctor_agenda(
    doctor_id: UUID,
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Consulta agenda de um médico (pública)."""
    slots = ScheduleService.get_doctor_agenda(db, doctor_id, start, end)
    return slots

@router.post("/doctors/{doctor_id}/agenda/slots", response_model=ScheduleSlotResponse, status_code=201)
def create_schedule_slot(
    doctor_id: UUID,
    data: ScheduleSlotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria slot na agenda.
    ADMIN: pode criar para qualquer médico.
    MEDICO: pode criar apenas na própria agenda.
    """
    if current_user.role == UserRole.MEDICO and current_user.id != doctor_id:
        raise HTTPException(status_code=403, detail="Você só pode criar slots na sua própria agenda")
    elif current_user.role == UserRole.PACIENTE:
        raise HTTPException(status_code=403, detail="Pacientes não podem criar slots")
    
    slot = ScheduleService.create_slot(db, doctor_id, data, current_user.id)
    return slot

@router.delete("/agenda/slots/{slot_id}", status_code=204)
def delete_schedule_slot(
    slot_id: UUID,
    current_user: User = Depends(get_current_admin_or_doctor),
    db: Session = Depends(get_db)
):
    """Deleta um slot (apenas se LIVRE)."""
    ScheduleService.delete_slot(db, slot_id)
    return None


