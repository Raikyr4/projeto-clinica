
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.profile import (
    DoctorProfileResponse, DoctorProfileUpdate,
    PatientProfileResponse, PatientProfileUpdate
)
from app.api.deps import get_current_user, get_current_doctor, get_current_patient
from app.models.user import User
from app.models.profile import DoctorProfile, PatientProfile

router = APIRouter(prefix="/profiles", tags=["Perfis"])

@router.get("/doctor/me", response_model=DoctorProfileResponse)
def get_my_doctor_profile(
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Retorna perfil do médico autenticado."""
    if not current_doctor.doctor_profile:
        raise HTTPException(status_code=404, detail="Perfil de médico não encontrado")
    return current_doctor.doctor_profile

@router.put("/doctor/me", response_model=DoctorProfileResponse)
def update_my_doctor_profile(
    profile_data: DoctorProfileUpdate,
    current_doctor: User = Depends(get_current_doctor),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do médico autenticado."""
    profile = current_doctor.doctor_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil de médico não encontrado")
    
    if profile_data.crm_crp:
        profile.crm_crp = profile_data.crm_crp
    if profile_data.especialidade:
        profile.especialidade = profile_data.especialidade
    if profile_data.bio:
        profile.bio = profile_data.bio
    if profile_data.valor_padrao_consulta is not None:
        profile.valor_padrao_consulta = profile_data.valor_padrao_consulta
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/patient/me", response_model=PatientProfileResponse)
def get_my_patient_profile(
    current_patient: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Retorna perfil do paciente autenticado."""
    if not current_patient.patient_profile:
        raise HTTPException(status_code=404, detail="Perfil de paciente não encontrado")
    return current_patient.patient_profile

@router.put("/patient/me", response_model=PatientProfileResponse)
def update_my_patient_profile(
    profile_data: PatientProfileUpdate,
    current_patient: User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Atualiza perfil do paciente autenticado."""
    profile = current_patient.patient_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil de paciente não encontrado")
    
    if profile_data.data_nascimento:
        profile.data_nascimento = profile_data.data_nascimento
    if profile_data.telefone:
        profile.telefone = profile_data.telefone
    if profile_data.endereco:
        profile.endereco = profile_data.endereco
    
    db.commit()
    db.refresh(profile)
    return profile


