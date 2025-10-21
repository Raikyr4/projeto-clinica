
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.profile import DoctorProfile, PatientProfile, AdminProfile
from app.core.security import get_password_hash, verify_password
from app.core.enums import UserRole
from app.schemas.user import UserCreate, UserUpdate

class UserService:
    @staticmethod
    def create_user(db: Session, user_data: UserCreate, creator_role: UserRole) -> User:
        # Apenas ADMIN pode criar MEDICO e ADMIN
        if user_data.role in [UserRole.MEDICO, UserRole.ADMIN] and creator_role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Apenas administradores podem criar médicos ou outros admins")
        
        # Verifica duplicatas
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        if db.query(User).filter(User.cpf == user_data.cpf).first():
            raise HTTPException(status_code=400, detail="CPF já cadastrado")
        
        # Cria usuário
        user = User(
            nome=user_data.nome,
            email=user_data.email,
            cpf=user_data.cpf,
            password_hash=get_password_hash(user_data.password),
            role=user_data.role,
            ativo=True
        )
        db.add(user)
        db.flush()
        
        # Cria perfil apropriado
        if user_data.role == UserRole.ADMIN:
            db.add(AdminProfile(user_id=user.id))
        elif user_data.role == UserRole.MEDICO:
            db.add(DoctorProfile(user_id=user.id, crm_crp="PENDENTE", valor_padrao_consulta=0))
        elif user_data.role == UserRole.PACIENTE:
            db.add(PatientProfile(user_id=user.id))
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 20) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: UUID, user_data: UserUpdate) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        if user_data.nome:
            user.nome = user_data.nome
        if user_data.email:
            if db.query(User).filter(User.email == user_data.email, User.id != user_id).first():
                raise HTTPException(status_code=400, detail="Email já em uso")
            user.email = user_data.email
        if user_data.ativo is not None:
            user.ativo = user_data.ativo
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: UUID) -> None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        db.delete(user)
        db.commit()
    
    @staticmethod
    def change_password(db: Session, user_id: UUID, old_password: str, new_password: str) -> None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Senha atual incorreta")
        
        user.password_hash = get_password_hash(new_password)
        db.commit()


