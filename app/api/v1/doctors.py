
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.schemas.user import UserResponse
from app.schemas.profile import DoctorProfileResponse
from app.models.user import User
from app.core.enums import UserRole

router = APIRouter(prefix="/doctors", tags=["Médicos"])

@router.get("", response_model=List[UserResponse])
def list_doctors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lista todos os médicos (público)."""
    doctors = db.query(User).filter(
        User.role == UserRole.MEDICO,
        User.ativo == True
    ).offset(skip).limit(limit).all()
    return doctors

@router.get("/{doctor_id}", response_model=UserResponse)
def get_doctor(
    doctor_id: UUID,
    db: Session = Depends(get_db)
):
    """Consulta médico por ID (público)."""
    doctor = db.query(User).filter(
        User.id == doctor_id,
        User.role == UserRole.MEDICO
    ).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Médico não encontrado")
    
    return doctor

@router.get("/{doctor_id}/profile", response_model=DoctorProfileResponse)
def get_doctor_profile(
    doctor_id: UUID,
    db: Session = Depends(get_db)
):
    """Consulta perfil do médico (público)."""
    doctor = db.query(User).filter(
        User.id == doctor_id,
        User.role == UserRole.MEDICO
    ).first()
    
    if not doctor or not doctor.doctor_profile:
        raise HTTPException(status_code=404, detail="Perfil de médico não encontrado")
    
    return doctor.doctor_profile


# README.md

"""
# API Clínica de Psicologia

Sistema completo de gestão para clínicas de psicologia com autenticação JWT, RBAC e PostgreSQL.

## 🚀 Tecnologias

- **Python 3.11+**
- **FastAPI** - Framework web
- **SQLAlchemy 2.x** - ORM
- **Alembic** - Migrations
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

1. Python 3.11 ou superior
2. PostgreSQL 14+ instalado e rodando
3. Pip para gerenciar pacotes

## 🔧 Instalação

### 1. Clone o repositório e instale dependências

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente (Windows)
venv\\Scripts\\activate

# Ativar ambiente (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configurar banco de dados

```sql
-- Conecte no PostgreSQL como superusuário e execute:
CREATE DATABASE clinica_psicologia;
```

Depois execute o script SQL de criação das tabelas e seeds fornecido no prompt.

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste:

```bash
DATABASE_URL=postgresql+psycopg2://postgres:SUA_SENHA@localhost:5432/clinica_psicologia
SECRET_KEY=sua_chave_secreta_super_segura_aqui_min_32_chars_gere_uma_aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 4. Executar migrations (opcional - se usar Alembic)

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## ▶️ Executar a aplicação

```bash
uvicorn app.main:app --reload
```

A API estará disponível em: http://localhost:8000

- **Documentação Swagger**: http://localhost:8000/docs
- **Documentação ReDoc**: http://localhost:8000/redoc

## 👥 Usuários de Teste (Seeds)

### Admin
- Email: `admin@clinica.local`
- Senha: `Admin@123`

### Médicos
- Dra. Ana Silva: `ana.silva@clinica.local` / `Medico@123`
- Dr. Bruno Souza: `bruno.souza@clinica.local` / `Medico@123`

### Pacientes
- Carla: `carla@exemplo.com` / `Paciente@123`
- Diego: `diego@exemplo.com` / `Paciente@123`
- Eva: `eva@exemplo.com` / `Paciente@123`

## 🔐 Autenticação

1. **Registrar novo paciente** (público):
```bash
POST /api/v1/auth/register
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678901",
  "password": "Senha@123"
}
```

2. **Login**:
```bash
POST /api/v1/auth/login
{
  "email": "joao@exemplo.com",
  "password": "Senha@123"
}
```

Retorna:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

3. **Usar o token nas requisições**:
```
Authorization: Bearer eyJ...
```

## 📚 Principais Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Auto-cadastro de paciente
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Usuário atual

### Usuários (Admin)
- `POST /api/v1/users` - Criar usuário (qualquer role)
- `GET /api/v1/users` - Listar usuários
- `GET /api/v1/users/{id}` - Consultar usuário
- `PUT /api/v1/users/{id}` - Atualizar usuário
- `DELETE /api/v1/users/{id}` - Deletar usuário

### Perfis
- `GET /api/v1/profiles/doctor/me` - Meu perfil (médico)
- `PUT /api/v1/profiles/doctor/me` - Atualizar perfil (médico)
- `GET /api/v1/profiles/patient/me` - Meu perfil (paciente)
- `PUT /api/v1/profiles/patient/me` - Atualizar perfil (paciente)

### Médicos (Público)
- `GET /api/v1/doctors` - Listar médicos
- `GET /api/v1/doctors/{id}` - Consultar médico
- `GET /api/v1/doctors/{id}/profile` - Perfil do médico

### Agenda
- `GET /api/v1/doctors/{id}/agenda` - Ver agenda (público)
- `POST /api/v1/doctors/{id}/agenda/slots` - Criar slot (Admin/Médico)
- `DELETE /api/v1/agenda/slots/{id}` - Deletar slot

### Consultas
- `POST /api/v1/appointments` - Agendar consulta
- `GET /api/v1/appointments` - Listar consultas
- `PATCH /api/v1/appointments/{id}/status` - Atualizar status

### Pagamentos
- `POST /api/v1/payments` - Criar pagamento
- `GET /api/v1/payments` - Listar pagamentos
- `GET /api/v1/payments/{id}` - Consultar pagamento

## 🧪 Testes

```bash
pytest tests/ -v
```

## 📊 Regras de Negócio

1. **PACIENTE** pode se auto-cadastrar
2. **MÉDICO** e **ADMIN** só podem ser criados por ADMIN
3. Reserva de slot é **atômica** (sem overbooking)
4. Pagamentos são sempre **aprovados** (simulação)
5. Apenas slots **LIVRE** podem ser deletados
6. Cada papel tem acesso restrito aos seus próprios dados

## 🏗️ Estrutura do Projeto

```
clinica_psicologia/
├── app/
│   ├── main.py              # Aplicação FastAPI
│   ├── config.py            # Configurações
│   ├── database.py          # Conexão DB
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Schemas Pydantic
│   ├── api/                 # Routers
│   ├── services/            # Lógica de negócio
│   └── core/                # Security, enums
├── tests/                   # Testes
├── alembic/                 # Migrations
└── requirements.txt
```

## 📝 Licença

MIT
"""
