
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, date
from uuid import UUID
from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.schedule import ScheduleSlot
from app.core.enums import UserRole, AppointmentStatus, SlotStatus
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(prefix="/reports", tags=["Relatórios"])

class ConsultasPorPeriodoResponse(BaseModel):
    periodo: str
    total: int
    agendadas: int
    realizadas: int
    canceladas: int

class PagamentosPorPeriodoResponse(BaseModel):
    periodo: str
    total: int
    valor_total: Decimal

class OcupacaoMedicoResponse(BaseModel):
    doctor_id: UUID
    doctor_nome: str
    total_slots: int
    slots_livres: int
    slots_reservados: int
    slots_concluidos: int
    taxa_ocupacao: float

class FaturamentoMensalResponse(BaseModel):
    mes: str
    total_consultas: int
    valor_total: Decimal

@router.get("/patient/appointments", response_model=ConsultasPorPeriodoResponse)
def get_patient_appointments_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[AppointmentStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Relatório de consultas do paciente por período."""
    if current_user.role != UserRole.PACIENTE:
        raise HTTPException(status_code=403, detail="Apenas pacientes podem acessar este relatório")
    
    query = db.query(Appointment).filter(Appointment.patient_id == current_user.id)
    
    if start_date:
        query = query.filter(Appointment.created_at >= start_date)
    if end_date:
        query = query.filter(Appointment.created_at <= end_date)
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.all()
    
    total = len(appointments)
    agendadas = sum(1 for a in appointments if a.status == AppointmentStatus.AGENDADA)
    realizadas = sum(1 for a in appointments if a.status == AppointmentStatus.REALIZADA)
    canceladas = sum(1 for a in appointments if a.status == AppointmentStatus.CANCELADA)
    
    periodo = f"{start_date or 'início'} até {end_date or 'hoje'}"
    
    return {
        "periodo": periodo,
        "total": total,
        "agendadas": agendadas,
        "realizadas": realizadas,
        "canceladas": canceladas
    }

@router.get("/patient/payments", response_model=PagamentosPorPeriodoResponse)
def get_patient_payments_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Relatório de pagamentos do paciente por período."""
    if current_user.role != UserRole.PACIENTE:
        raise HTTPException(status_code=403, detail="Apenas pacientes podem acessar este relatório")
    
    query = db.query(Payment).filter(Payment.patient_id == current_user.id)
    
    if start_date:
        query = query.filter(func.date(Payment.created_at) >= start_date)
    if end_date:
        query = query.filter(func.date(Payment.created_at) <= end_date)
    
    payments = query.all()
    total = len(payments)
    valor_total = sum(p.valor for p in payments)
    
    periodo = f"{start_date or 'início'} até {end_date or 'hoje'}"
    
    return {
        "periodo": periodo,
        "total": total,
        "valor_total": valor_total
    }

@router.get("/doctor/occupancy", response_model=OcupacaoMedicoResponse)
def get_doctor_occupancy_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Relatório de ocupação/carga do médico."""
    if current_user.role != UserRole.MEDICO:
        raise HTTPException(status_code=403, detail="Apenas médicos podem acessar este relatório")
    
    query = db.query(ScheduleSlot).filter(ScheduleSlot.doctor_id == current_user.id)
    
    if start_date:
        query = query.filter(func.date(ScheduleSlot.inicio) >= start_date)
    if end_date:
        query = query.filter(func.date(ScheduleSlot.fim) <= end_date)
    
    slots = query.all()
    total_slots = len(slots)
    
    livres = sum(1 for s in slots if s.status == SlotStatus.LIVRE)
    reservados = sum(1 for s in slots if s.status == SlotStatus.RESERVADO)
    concluidos = sum(1 for s in slots if s.status == SlotStatus.CONCLUIDO)
    
    taxa_ocupacao = 0.0
    if total_slots > 0:
        taxa_ocupacao = ((reservados + concluidos) / total_slots) * 100
    
    return {
        "doctor_id": current_user.id,
        "doctor_nome": current_user.nome,
        "total_slots": total_slots,
        "slots_livres": livres,
        "slots_reservados": reservados,
        "slots_concluidos": concluidos,
        "taxa_ocupacao": round(taxa_ocupacao, 2)
    }

@router.get("/admin/monthly-revenue", response_model=List[FaturamentoMensalResponse])
def get_monthly_revenue_report(
    year: int = Query(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Relatório de faturamento mensal (Admin)."""
    payments = db.query(Payment).filter(
        extract('year', Payment.created_at) == year
    ).all()
    
    # Agrupar por mês
    monthly_data = {}
    for payment in payments:
        month_key = payment.created_at.strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {"total": 0, "valor": Decimal(0)}
        monthly_data[month_key]["total"] += 1
        monthly_data[month_key]["valor"] += payment.valor
    
    result = []
    for month, data in sorted(monthly_data.items()):
        result.append({
            "mes": month,
            "total_consultas": data["total"],
            "valor_total": data["valor"]
        })
    
    return result


