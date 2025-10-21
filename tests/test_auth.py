
def test_register_patient(client):
    response = client.post("/api/v1/auth/register", json={
        "nome": "Novo Paciente",
        "email": "novo@test.com",
        "cpf": "99999999999",
        "password": "Test@123",
        "role": "PACIENTE"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "novo@test.com"

def test_register_non_patient_fails(client):
    response = client.post("/api/v1/auth/register", json={
        "nome": "Médico Invalido",
        "email": "medico@test.com",
        "cpf": "88888888888",
        "password": "Test@123",
        "role": "MEDICO"
    })
    assert response.status_code == 403

def test_login_success(client, test_patient):
    response = client.post("/api/v1/auth/login", json={
        "email": "paciente@test.com",
        "password": "Test@123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()

def test_login_wrong_password(client, test_patient):
    response = client.post("/api/v1/auth/login", json={
        "email": "paciente@test.com",
        "password": "WrongPassword"
    })
    assert response.status_code == 401


