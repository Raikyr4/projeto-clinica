from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from decimal import Decimal
from app.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User
from app.models.appointment import Appointment
from app.models.payment import Payment
from app.models.schedule import ScheduleSlot
from app.core.enums import UserRole, AppointmentStatus
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

class DashboardKPIs(BaseModel):
    total_consultas_mes: int
    faturamento_mes: Decimal
    taxa_ocupacao: float
    proximos_atendimentos: List[Dict[str, Any]]
    total_usuarios_ativos: int  # NOVO CAMPO

@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """KPIs do dashboard conforme o papel do usuário."""
    hoje = datetime.now()
    inicio_mes = hoje.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Total de consultas do mês
    query_consultas = db.query(func.count(Appointment.id)).filter(
        Appointment.created_at >= inicio_mes
    )
    
    if current_user.role == UserRole.PACIENTE:
        query_consultas = query_consultas.filter(Appointment.patient_id == current_user.id)
    elif current_user.role == UserRole.MEDICO:
        query_consultas = query_consultas.join(ScheduleSlot).filter(
            ScheduleSlot.doctor_id == current_user.id
        )
    
    total_consultas_mes = query_consultas.scalar() or 0
    
    # Faturamento do mês
    query_faturamento = db.query(func.sum(Payment.valor)).filter(
        Payment.created_at >= inicio_mes
    )
    
    if current_user.role == UserRole.PACIENTE:
        query_faturamento = query_faturamento.filter(Payment.patient_id == current_user.id)
    elif current_user.role == UserRole.MEDICO:
        query_faturamento = query_faturamento.join(Appointment).join(ScheduleSlot).filter(
            ScheduleSlot.doctor_id == current_user.id
        )
    
    faturamento_mes = query_faturamento.scalar() or Decimal(0)
    
    # Taxa de ocupação
    taxa_ocupacao = 0.0
    if current_user.role == UserRole.MEDICO:
        # Para médico: sua taxa individual
        slots = db.query(ScheduleSlot).filter(
            ScheduleSlot.doctor_id == current_user.id,
            ScheduleSlot.inicio >= inicio_mes
        ).all()
        
        if slots:
            ocupados = sum(1 for s in slots if s.status != "LIVRE")
            taxa_ocupacao = (ocupados / len(slots)) * 100
    elif current_user.role == UserRole.ADMIN:
        # Para admin: taxa geral de todos os médicos
        slots = db.query(ScheduleSlot).filter(
            ScheduleSlot.inicio >= inicio_mes
        ).all()
        
        if slots:
            ocupados = sum(1 for s in slots if s.status != "LIVRE")
            taxa_ocupacao = (ocupados / len(slots)) * 100
    
    # Total de usuários ativos (novo)
    total_usuarios_ativos = 0
    if current_user.role == UserRole.ADMIN:
        # Para admin: conta todos os usuários ativos
        total_usuarios_ativos = db.query(func.count(User.id)).filter(
            User.ativo == True
        ).scalar() or 0
    elif current_user.role == UserRole.MEDICO:
        # Para médico: conta pacientes únicos que tiveram consulta com ele
        total_usuarios_ativos = db.query(func.count(func.distinct(Appointment.patient_id))).join(
            ScheduleSlot
        ).filter(
            ScheduleSlot.doctor_id == current_user.id
        ).scalar() or 0
    elif current_user.role == UserRole.PACIENTE:
        # Para paciente: sempre 1 (ele mesmo)
        total_usuarios_ativos = 1
    
    # Próximos atendimentos
    proximos_query = db.query(Appointment).join(ScheduleSlot).filter(
        ScheduleSlot.inicio >= hoje,
        Appointment.status == AppointmentStatus.AGENDADA
    )
    
    if current_user.role == UserRole.PACIENTE:
        proximos_query = proximos_query.filter(Appointment.patient_id == current_user.id)
    elif current_user.role == UserRole.MEDICO:
        proximos_query = proximos_query.filter(ScheduleSlot.doctor_id == current_user.id)
    
    proximos = proximos_query.order_by(ScheduleSlot.inicio).limit(5).all()
    
    proximos_atendimentos = [
        {
            "id": str(apt.id),
            "data_hora": apt.slot.inicio.isoformat(),
            "paciente": apt.patient.nome if current_user.role != UserRole.PACIENTE else None,
            "medico": apt.slot.doctor.nome if current_user.role == UserRole.PACIENTE else None
        }
        for apt in proximos
    ]
    
    return {
        "total_consultas_mes": total_consultas_mes,
        "faturamento_mes": faturamento_mes,
        "taxa_ocupacao": round(taxa_ocupacao, 2),
        "proximos_atendimentos": proximos_atendimentos,
        "total_usuarios_ativos": total_usuarios_ativos  # NOVO
    }