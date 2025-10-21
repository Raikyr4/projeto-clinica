
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.core.security import decode_token
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_patient(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Auto-cadastro público para PACIENTES.
    Para criar MÉDICO ou ADMIN, usar /users (requer permissão ADMIN).
    """
    if user_data.role != "PACIENTE":
        raise HTTPException(
            status_code=403,
            detail="Auto-cadastro permitido apenas para pacientes"
        )
    
    user = AuthService.register_patient(db, user_data)
    return user

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login com email e senha."""
    user = AuthService.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    access_token, refresh_token = AuthService.create_tokens(str(user.id), user.role)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Renova o access token usando refresh token."""
    payload = decode_token(data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido"
        )
    
    user_id = payload.get("sub")
    role = payload.get("role")
    
    access_token, refresh_token = AuthService.create_tokens(user_id, role)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário autenticado."""
    return current_user
