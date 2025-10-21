
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.services.appointment_service import AppointmentService
from app.api.deps import get_current_user, get_current_admin_or_doctor
from app.models.user import User
from app.core.enums import UserRole, AppointmentStatus

router = APIRouter(prefix="/appointments", tags=["Consultas"])

@router.post("", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova consulta (reserva um slot).
    PACIENTE: cria para si mesmo.
    ADMIN/MEDICO: pode criar para qualquer paciente (implementar patient_id no body se necessário).
    """
    patient_id = current_user.id
    appointment = AppointmentService.create_appointment(db, patient_id, data)
    return appointment

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista consultas conforme o papel:
    - PACIENTE: suas próprias consultas
    - MEDICO: consultas com ele
    - ADMIN: todas as consultas
    """
    if current_user.role == UserRole.PACIENTE:
        appointments = AppointmentService.get_appointments_by_patient(db, current_user.id, skip, limit)
    elif current_user.role == UserRole.MEDICO:
        appointments = AppointmentService.get_appointments_by_doctor(db, current_user.id, skip, limit)
    else:  # ADMIN
        appointments = db.query(Appointment).offset(skip).limit(limit).all()
    
    return appointments

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: UUID,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_admin_or_doctor),
    db: Session = Depends(get_db)
):
    """Atualiza status da consulta (ADMIN ou MEDICO)."""
    if update_data.status:
        appointment = AppointmentService.update_appointment_status(db, appointment_id, update_data.status)
        return appointment
    raise HTTPException(status_code=400, detail="Status é obrigatório")


