from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

# Configuração do bcrypt com parâmetros explícitos
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Número de rounds do bcrypt
)

def _truncate_password(password: str) -> bytes:
    """
    Trunca a senha para 72 bytes (limite do bcrypt).
    Bcrypt só aceita até 72 bytes, então precisamos truncar senhas longas.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return password_bytes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha fornecida corresponde ao hash."""
    try:
        # Trunca a senha para 72 bytes antes de verificar
        truncated_password = _truncate_password(plain_password).decode('utf-8')
        return pwd_context.verify(truncated_password, hashed_password)
    except Exception as e:
        # Log do erro para debug (em produção, use logging adequado)
        print(f"Erro ao verificar senha: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Gera o hash da senha."""
    # Trunca a senha para 72 bytes antes de fazer hash
    truncated_password = _truncate_password(password).decode('utf-8')
    return pwd_context.hash(truncated_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Cria um token de acesso JWT."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Cria um token de refresh JWT."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica e valida um token JWT."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None