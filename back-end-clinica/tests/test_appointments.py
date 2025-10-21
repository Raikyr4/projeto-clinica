
from datetime import datetime, timedelta

def test_create_appointment_atomic(client, test_patient, test_doctor, db):
    # Cria um slot
    from app.models.schedule import ScheduleSlot
    from app.core.enums import SlotStatus
    
    slot = ScheduleSlot(
        doctor_id=test_doctor.id,
        inicio=datetime.now() + timedelta(days=1),
        fim=datetime.now() + timedelta(days=1, hours=1),
        status=SlotStatus.LIVRE
    )
    db.add(slot)
    db.commit()
    
    # Login do paciente
    login_response = client.post("/api/v1/auth/login", json={
        "email": "paciente@test.com",
        "password": "Test@123"
    })
    token = login_response.json()["access_token"]
    
    # Cria consulta
    response = client.post(
        "/api/v1/appointments",
        json={"slot_id": str(slot.id)},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    assert response.json()["status"] == "AGENDADA"
    
    # Verifica que o slot foi reservado
    db.refresh(slot)
    assert slot.status == SlotStatus.RESERVADO


