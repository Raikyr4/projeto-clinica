from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService
from app.api.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.core.enums import UserRole

router = APIRouter(prefix="/payments", tags=["Pagamentos"])

@router.post("", response_model=PaymentResponse, status_code=201)
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria pagamento simulado (sempre aprovado)."""
    payment = PaymentService.create_payment(db, current_user.id, data)
    return payment

@router.get("", response_model=List[PaymentResponse])
def list_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista pagamentos:
    - PACIENTE: seus próprios pagamentos
    - ADMIN: todos os pagamentos
    """
    query = db.query(Payment)
    
    if current_user.role == UserRole.PACIENTE:
        query = query.filter(Payment.patient_id == current_user.id)
    
    payments = query.offset(skip).limit(limit).all()
    return payments

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consulta detalhes de um pagamento."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    
    # Verifica permissão
    if current_user.role == UserRole.PACIENTE and payment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return payment