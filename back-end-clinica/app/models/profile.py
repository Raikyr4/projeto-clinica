from sqlalchemy import Column, String, Date, Numeric, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class AdminProfile(Base):
    __tablename__ = "admin_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    user = relationship("User", back_populates="admin_profile")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    crm_crp = Column(String, nullable=False)
    especialidade = Column(String)
    bio = Column(String)
    valor_padrao_consulta = Column(Numeric(10, 2), nullable=False, default=0)
    
    user = relationship("User", back_populates="doctor_profile")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    data_nascimento = Column(Date)
    telefone = Column(String)
    endereco = Column(String)
    
    user = relationship("User", back_populates="patient_profile")