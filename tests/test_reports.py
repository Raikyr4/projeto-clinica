
from datetime import datetime, timedelta

def test_patient_appointments_report(client, test_patient, test_doctor, db):
    """Testa relatório de consultas do paciente."""
    from app.models.schedule import ScheduleSlot
    from app.models.appointment import Appointment
    from app.core.enums import SlotStatus, AppointmentStatus
    
    # Cria slots e consultas
    slot1 = ScheduleSlot(
        doctor_id=test_doctor.id,
        inicio=datetime.now() - timedelta(days=5),
        fim=datetime.now() - timedelta(days=5, hours=-1),
        status=SlotStatus.CONCLUIDO
    )
    db.add(slot1)
    db.flush()
    
    appointment1 = Appointment(
        slot_id=slot1.id,
        patient_id=test_patient.id,
        status=AppointmentStatus.REALIZADA
    )
    db.add(appointment1)
    db.commit()
    
    # Login do paciente
    login_response = client.post("/api/v1/auth/login", json={
        "email": "paciente@test.com",
        "password": "Test@123"
    })
    token = login_response.json()["access_token"]
    
    # Busca relatório
    response = client.get(
        "/api/v1/reports/patient/appointments",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["realizadas"] >= 1

def test_doctor_occupancy_report(client, test_doctor, db):
    """Testa relatório de ocupação do médico."""
    from app.models.schedule import ScheduleSlot
    from app.core.enums import SlotStatus
    
    # Cria alguns slots
    for i in range(5):
        slot = ScheduleSlot(
            doctor_id=test_doctor.id,
            inicio=datetime.now() + timedelta(days=i+1),
            fim=datetime.now() + timedelta(days=i+1, hours=1),
            status=SlotStatus.LIVRE if i < 2 else SlotStatus.RESERVADO
        )
        db.add(slot)
    db.commit()
    
    # Login do médico
    login_response = client.post("/api/v1/auth/login", json={
        "email": "medico@test.com",
        "password": "Test@123"
    })
    token = login_response.json()["access_token"]
    
    # Busca relatório
    response = client.get(
        "/api/v1/reports/doctor/occupancy",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_slots"] == 5
    assert data["slots_livres"] == 2
    assert data["slots_reservados"] == 3
    assert data["taxa_ocupacao"] == 60.0


