
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
import json

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        user_id: Optional[UUID],
        acao: str,
        alvo: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """Registra uma ação no log de auditoria."""
        audit_log = AuditLog(
            user_id=user_id,
            acao=acao,
            alvo=alvo,
            payload_json=payload
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        return audit_log
    
    @staticmethod
    def log_user_created(db: Session, admin_id: UUID, new_user_id: UUID, role: str):
        """Log de criação de usuário."""
        return AuditService.log_action(
            db,
            user_id=admin_id,
            acao="USER_CREATED",
            alvo=str(new_user_id),
            payload={"role": role}
        )
    
    @staticmethod
    def log_appointment_created(db: Session, patient_id: UUID, appointment_id: UUID, doctor_id: UUID):
        """Log de criação de consulta."""
        return AuditService.log_action(
            db,
            user_id=patient_id,
            acao="APPOINTMENT_CREATED",
            alvo=str(appointment_id),
            payload={"doctor_id": str(doctor_id)}
        )
    
    @staticmethod
    def log_payment_created(db: Session, patient_id: UUID, payment_id: UUID, valor: float):
        """Log de criação de pagamento."""
        return AuditService.log_action(
            db,
            user_id=patient_id,
            acao="PAYMENT_CREATED",
            alvo=str(payment_id),
            payload={"valor": float(valor)}
        )


