from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, date, time
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
    start: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS)"),
    end: Optional[str] = Query(None, description="Data final (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS)"),
    db: Session = Depends(get_db)
):
    start_dt = None
    end_dt = None
    
    if start:
        try:
            if 'T' in start:
                start = start.rstrip('Z')
                start_dt = datetime.fromisoformat(start)
            else:
                start_date = datetime.strptime(start, '%Y-%m-%d').date()
                start_dt = datetime.combine(start_date, time.min)
        except ValueError as e:
            raise HTTPException(
                status_code=422,
                detail=f"Formato inválido para 'start'. Use YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS. Erro: {str(e)}"
            )
    
    if end:
        try:
            if 'T' in end:
                end = end.rstrip('Z')
                end_dt = datetime.fromisoformat(end)
            else:
                end_date = datetime.strptime(end, '%Y-%m-%d').date()
                end_dt = datetime.combine(end_date, time.max)
        except ValueError as e:
            raise HTTPException(
                status_code=422,
                detail=f"Formato inválido para 'end'. Use YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS. Erro: {str(e)}"
            )
    
    slots = ScheduleService.get_doctor_agenda(db, doctor_id, start_dt, end_dt)
    return slots

@router.post("/doctors/{doctor_id}/agenda/slots", response_model=ScheduleSlotResponse, status_code=201)
def create_schedule_slot(
    doctor_id: UUID,
    data: ScheduleSlotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
    ScheduleService.delete_slot(db, slot_id)
    return None