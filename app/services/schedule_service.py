
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException
from datetime import datetime
from app.models.schedule import ScheduleSlot
from app.core.enums import SlotStatus
from app.schemas.schedule import ScheduleSlotCreate

class ScheduleService:
    @staticmethod
    def create_slot(db: Session, doctor_id: UUID, data: ScheduleSlotCreate, created_by: UUID) -> ScheduleSlot:
        # Verifica sobreposição
        overlapping = db.query(ScheduleSlot).filter(
            and_(
                ScheduleSlot.doctor_id == doctor_id,
                ScheduleSlot.inicio < data.fim,
                ScheduleSlot.fim > data.inicio
            )
        ).first()
        
        if overlapping:
            raise HTTPException(status_code=400, detail="Já existe um slot neste horário")
        
        slot = ScheduleSlot(
            doctor_id=doctor_id,
            inicio=data.inicio,
            fim=data.fim,
            status=SlotStatus.LIVRE,
            created_by=created_by
        )
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return slot
    
    @staticmethod
    def get_doctor_agenda(
        db: Session,
        doctor_id: UUID,
        start: datetime = None,
        end: datetime = None
    ) -> List[ScheduleSlot]:
        query = db.query(ScheduleSlot).filter(ScheduleSlot.doctor_id == doctor_id)
        
        if start:
            query = query.filter(ScheduleSlot.inicio >= start)
        if end:
            query = query.filter(ScheduleSlot.fim <= end)
        
        return query.order_by(ScheduleSlot.inicio).all()
    
    @staticmethod
    def delete_slot(db: Session, slot_id: UUID) -> None:
        slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
        if not slot:
            raise HTTPException(status_code=404, detail="Slot não encontrado")
        
        if slot.status != SlotStatus.LIVRE:
            raise HTTPException(status_code=400, detail="Apenas slots livres podem ser deletados")
        
        db.delete(slot)
        db.commit()


