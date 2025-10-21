
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.profile import PatientProfile, DoctorProfile
from app.core.enums import UserRole

# Banco de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def test_patient(db):
    user = User(
        nome="Paciente Teste",
        email="paciente@test.com",
        cpf="11111111111",
        password_hash=get_password_hash("Test@123"),
        role=UserRole.PACIENTE,
        ativo=True
    )
    db.add(user)
    db.flush()
    
    profile = PatientProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)
    
    return user

@pytest.fixture
def test_doctor(db):
    user = User(
        nome="Médico Teste",
        email="medico@test.com",
        cpf="22222222222",
        password_hash=get_password_hash("Test@123"),
        role=UserRole.MEDICO,
        ativo=True
    )
    db.add(user)
    db.flush()
    
    profile = DoctorProfile(
        user_id=user.id,
        crm_crp="CRP 12345",
        valor_padrao_consulta=200.00
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    
    return user


