
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.profile import PatientProfile, DoctorProfile, AdminProfile
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.enums import UserRole
from app.schemas.user import UserCreate

class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.ativo:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def create_tokens(user_id: str, role: str) -> Tuple[str, str]:
        token_data = {"sub": user_id, "role": role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        return access_token, refresh_token
    
    @staticmethod
    def register_patient(db: Session, user_data: UserCreate) -> User:
        # Verifica duplicatas
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        existing_cpf = db.query(User).filter(User.cpf == user_data.cpf).first()
        if existing_cpf:
            raise HTTPException(status_code=400, detail="CPF já cadastrado")
        
        # Cria usuário
        user = User(
            nome=user_data.nome,
            email=user_data.email,
            cpf=user_data.cpf,
            password_hash=get_password_hash(user_data.password),
            role=UserRole.PACIENTE,
            ativo=True
        )
        db.add(user)
        db.flush()
        
        # Cria perfil de paciente
        patient_profile = PatientProfile(user_id=user.id)
        db.add(patient_profile)
        db.commit()
        db.refresh(user)
        
        return user


