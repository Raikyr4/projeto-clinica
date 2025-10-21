
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
import random
from app.models.payment import Payment
from app.models.appointment import Appointment
from app.core.enums import PaymentStatus
from app.schemas.payment import PaymentCreate

class PaymentService:
    @staticmethod
    def create_payment(db: Session, patient_id: UUID, data: PaymentCreate) -> Payment:
        # Verifica se a consulta existe
        appointment = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")
        
        # Verifica se já existe pagamento
        existing_payment = db.query(Payment).filter(Payment.appointment_id == data.appointment_id).first()
        if existing_payment:
            raise HTTPException(status_code=400, detail="Esta consulta já possui um pagamento")
        
        # Pagamento sempre aprovado (simulado)
        nsu = f"NSU-{random.randint(100000, 999999)}"
        
        payment = Payment(
            appointment_id=data.appointment_id,
            patient_id=patient_id,
            valor=data.valor,
            status=PaymentStatus.APROVADO,
            metodo=data.metodo,
            nsu_fake=nsu
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        return payment


