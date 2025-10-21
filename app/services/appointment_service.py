
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException
from datetime import datetime
from app.models.schedule import ScheduleSlot
from app.models.appointment import Appointment
from app.core.enums import SlotStatus, AppointmentStatus
from app.schemas.appointment import AppointmentCreate

class AppointmentService:
    @staticmethod
    def create_appointment(db: Session, patient_id: UUID, data: AppointmentCreate) -> Appointment:
        # Reserva atômica do slot
        slot = db.query(ScheduleSlot).filter(
            ScheduleSlot.id == data.slot_id
        ).with_for_update().first()
        
        if not slot:
            raise HTTPException(status_code=404, detail="Slot não encontrado")
        
        if slot.status != SlotStatus.LIVRE:
            raise HTTPException(status_code=400, detail="Slot não está disponível")
        
        # Atualiza status do slot
        slot.status = SlotStatus.RESERVADO
        
        # Cria consulta
        appointment = Appointment(
            slot_id=data.slot_id,
            patient_id=patient_id,
            status=AppointmentStatus.AGENDADA,
            observacoes=data.observacoes
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        
        return appointment
    
    @staticmethod
    def get_appointments_by_patient(db: Session, patient_id: UUID, skip: int = 0, limit: int = 20) -> List[Appointment]:
        return db.query(Appointment).filter(
            Appointment.patient_id == patient_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_appointments_by_doctor(db: Session, doctor_id: UUID, skip: int = 0, limit: int = 20) -> List[Appointment]:
        return db.query(Appointment).join(
            ScheduleSlot, Appointment.slot_id == ScheduleSlot.id
        ).filter(
            ScheduleSlot.doctor_id == doctor_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_appointment_status(db: Session, appointment_id: UUID, status: AppointmentStatus) -> Appointment:
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")
        
        appointment.status = status
        
        # Atualiza status do slot se necessário
        if status == AppointmentStatus.REALIZADA:
            appointment.slot.status = SlotStatus.CONCLUIDO
        elif status == AppointmentStatus.CANCELADA:
            appointment.slot.status = SlotStatus.CANCELADO
        
        db.commit()
        db.refresh(appointment)
        return appointment


