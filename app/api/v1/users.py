
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserPasswordUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_admin, get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Usuários"])

@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Cria usuário (apenas ADMIN). Pode criar qualquer role."""
    user = UserService.create_user(db, user_data, current_admin.role)
    return user

@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Lista todos os usuários (apenas ADMIN)."""
    users = UserService.list_users(db, skip, limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consulta usuário por ID."""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Apenas ADMIN ou o próprio usuário pode ver
    if current_user.role != "ADMIN" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Atualiza usuário (apenas ADMIN)."""
    user = UserService.update_user(db, user_id, user_data)
    return user

@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Deleta usuário (apenas ADMIN)."""
    UserService.delete_user(db, user_id)
    return None

@router.patch("/{user_id}/password", status_code=204)
def change_password(
    user_id: UUID,
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Altera senha do usuário."""
    # Apenas o próprio usuário pode alterar sua senha
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Você só pode alterar sua própria senha")
    
    UserService.change_password(db, user_id, password_data.old_password, password_data.new_password)
    return None


