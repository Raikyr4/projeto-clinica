# 📋 API Clínica de Psicologia - README Completo

## 📖 Visão Geral

Sistema completo de gestão para clínicas de psicologia desenvolvido com FastAPI e PostgreSQL. Possui autenticação JWT, controle de acesso baseado em roles (RBAC), gestão de agendas, consultas, pagamentos simulados e relatórios.

### Funcionalidades Principais

- ✅ **Autenticação JWT** (Access Token + Refresh Token)
- 👥 **3 Tipos de Usuários**: Admin, Médico e Paciente
- 📅 **Gestão de Agenda** para médicos
- 🏥 **Agendamento de Consultas** com reserva atômica (sem overbooking)
- 💳 **Pagamentos Simulados** (sempre aprovados para fins de teste)
- 📊 **Relatórios** por paciente, médico e admin
- 📈 **Dashboard** com KPIs e métricas

---

## 🛠 Tecnologias Utilizadas

- **Python 3.11+**
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy 2.x** - ORM para Python
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash seguro de senhas
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- **Python 3.11 ou superior** → [Download Python](https://www.python.org/downloads/)
- **PostgreSQL 14+** → [Download PostgreSQL](https://www.postgresql.org/download/)
- **DBeaver** (opcional, mas recomendado) → [Download DBeaver](https://dbeaver.io/download/)
- **Git** (para clonar o repositório) → [Download Git](https://git-scm.com/downloads)

---

## 🐘 Instalação do PostgreSQL

### Windows

1. **Baixar o instalador**:
   - Acesse: https://www.postgresql.org/download/windows/
   - Clique em "Download the installer"
   - Escolha a versão mais recente (ex: PostgreSQL 15 ou 16)

2. **Executar o instalador**:
   - Execute o arquivo baixado (.exe)
   - Clique em "Next" nas telas iniciais
   - Selecione os componentes (deixe todos marcados)
   - Escolha o diretório de instalação (padrão: `C:\Program Files\PostgreSQL\15`)
   - **IMPORTANTE**: Defina uma senha para o usuário `postgres` (anote essa senha!)
   - Defina a porta (padrão: `5432`)
   - Escolha o locale (padrão: `Portuguese, Brazil`)
   - Clique em "Next" e depois "Finish"

3. **Verificar instalação**:
   ```bash
   # Abra o PowerShell ou CMD e digite:
   psql --version
   ```
   Deve exibir algo como: `psql (PostgreSQL) 15.x`

### Linux (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verificar se está rodando
sudo systemctl status postgresql

# Definir senha do usuário postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD '110903';
\q
```

### macOS

```bash
# Usando Homebrew
brew install postgresql@15

# Iniciar serviço
brew services start postgresql@15

# Definir senha
psql postgres
ALTER USER postgres PASSWORD '110903';
\q
```

---

## 🗄️ Instalação do DBeaver

### Windows / Linux / macOS

1. **Baixar**:
   - Acesse: https://dbeaver.io/download/
   - Escolha a versão Community (gratuita)
   - Baixe para seu sistema operacional

2. **Instalar**:
   - Windows: Execute o instalador `.exe`
   - Linux: Use o `.deb` ou `.rpm` conforme sua distribuição
   - macOS: Arraste para a pasta Applications

3. **Conectar ao PostgreSQL**:
   - Abra o DBeaver
   - Clique em "Nova Conexão" (ícone de tomada com +)
   - Selecione "PostgreSQL"
   - Preencha:
     - **Host**: `localhost`
     - **Port**: `5432`
     - **Database**: `postgres` (por enquanto)
     - **Username**: `postgres`
     - **Password**: (a senha que você definiu)
   - Clique em "Test Connection" para verificar
   - Clique em "Finish"

---

## 📥 Configuração do Projeto

### 1. Clonar o Repositório

```bash
# Clone o projeto (ou extraia o ZIP)
git clone <url-do-repositorio>
cd back-end-clinica

# OU se você tem o ZIP:
# Extraia o ZIP em uma pasta
# cd back-end-clinica
```

### 2. Criar o Banco de Dados

#### Opção A: Via Terminal/CMD

```bash
# Windows (PowerShell ou CMD)
psql -U postgres -h localhost

# Você será solicitado a digitar a senha
# Digite a senha do postgres e pressione Enter

# Agora, dentro do psql, crie o banco:
CREATE DATABASE public;

# Para sair do psql:
\q
```

#### Opção B: Via DBeaver

1. Abra o DBeaver
2. Clique com botão direito em "Databases"
3. Selecione "Create New Database"
4. Nome: `public`
5. Clique em "OK"

### 3. Executar os Scripts SQL

Agora vamos criar as tabelas e popular o banco com dados de teste.

#### Via Terminal/CMD

```bash
# Script de criação das tabelas
psql -U postgres -d public -f scripts/scriptCriacaoTabelas.sql

# Script de população (dados de teste)
psql -U postgres -d public -f scripts/scriptPopulaTabelas.sql
```

#### Via DBeaver

1. Abra o DBeaver
2. Conecte ao banco `public`
3. Clique com botão direito no banco → "SQL Editor" → "New SQL Script"
4. Abra o arquivo `scripts/scriptCriacaoTabelas.sql` no seu editor de texto
5. Copie todo o conteúdo e cole no SQL Editor do DBeaver
6. Clique em "Execute SQL Script" (ícone ▶ laranja) ou pressione `Ctrl+Alt+X`
7. Repita os passos 3-6 para o arquivo `scripts/scriptPopulaTabelas.sql`

### 4. Configurar o Ambiente Virtual Python

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

**Nota**: Após ativar, você verá `(venv)` no início da linha do terminal.

### 5. Instalar as Dependências

```bash
# Com o ambiente virtual ativado:
pip install --upgrade pip
pip install -r requirements.txt
```

Isso instalará todos os pacotes necessários:
- FastAPI
- Uvicorn
- SQLAlchemy
- Psycopg2
- Pydantic
- PyJWT
- Passlib
- E outros...

### 6. Configurar o Arquivo `.env`

Crie um arquivo chamado `.env` na raiz do projeto (mesma pasta onde está o `main.py`):

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

Edite o arquivo `.env` com os seguintes valores:

```ini
DATABASE_URL=postgresql+psycopg2://postgres:110903@localhost:5432/public
SECRET_KEY=A_HKko5SlolIWdq_vYehtlIsUdaOtemH-paKZLAeMzFVM5ytXHqSAbY8s8IDNoOYWj5VyEiidrpQI7lGsak5tA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**⚠️ IMPORTANTE**: 
- Substitua `110903` pela senha que você definiu para o usuário `postgres`
- Em produção, gere uma `SECRET_KEY` forte usando:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```

---

## 🚀 Executando a API

### 1. Ativar o Ambiente Virtual

```bash
# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 2. Rodar o Servidor

```bash
uvicorn app.main:app --reload
```

Você verá algo como:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**✅ Pronto! A API está rodando!**

### 3. Acessar a Documentação (Swagger)

Abra seu navegador e acesse:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 🔐 Como Usar o Swagger para Testar a API

### Passo 1: Fazer Login

1. No Swagger (http://localhost:8000/docs), encontre a seção **"Autenticação"**
2. Clique em `POST /api/v1/auth/login`
3. Clique em "Try it out"
4. No campo "Request body", insira as credenciais de um usuário de teste:

```json
{
  "email": "admin@clinica.com",
  "password": "Admin@123"
}
```

5. Clique em "Execute"
6. Na resposta, você verá algo como:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJyb2xlIjoiQURNSU4iLCJleHAiOjE3MDU2NzMxMjAsInR5cGUiOiJhY2Nlc3MifQ...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

7. **Copie APENAS o valor do `access_token`** (sem as aspas)

### Passo 2: Autenticar no Swagger

1. No topo da página do Swagger, clique no botão **"Authorize"** (cadeado verde)
2. Cole o `access_token` no campo "Value"
3. Clique em "Authorize"
4. Clique em "Close"

**✅ Agora você está autenticado!** Todas as requisições que você fizer no Swagger usarão esse token automaticamente.

### Passo 3: Testar Endpoints Protegidos

Exemplo: **Listar usuários** (requer permissão de Admin)

1. Vá até `GET /api/v1/users`
2. Clique em "Try it out"
3. Ajuste os parâmetros de paginação se desejar (skip=0, limit=20)
4. Clique em "Execute"
5. Você verá a lista de usuários retornada

---

## 👥 Usuários de Teste (Pré-cadastrados)

Após executar o script de população, você terá os seguintes usuários disponíveis:

### 🔑 Admin
- **Email**: `admin@clinica.com`
- **Senha**: `Admin@123`
- **Permissões**: Acesso total ao sistema

### 👨‍⚕️ Médicos

**Dra. Ana Silva**
- **Email**: `ana.silva@clinica.com`
- **Senha**: `Medico@123`
- **CRP**: CRP 12/3456
- **Especialidade**: Terapia Cognitivo-Comportamental

**Dr. Bruno Souza**
- **Email**: `bruno.souza@clinica.com`
- **Senha**: `Medico@123`
- **CRP**: CRP 34/7890
- **Especialidade**: Psicanálise

### 👤 Pacientes

**Carla Paciente**
- **Email**: `carla@exemplo.com`
- **Senha**: `Paciente@123`

**Diego Paciente**
- **Email**: `diego@exemplo.com`
- **Senha**: `Paciente@123`

**Eva Paciente**
- **Email**: `eva@exemplo.com`
- **Senha**: `Paciente@123`

---

## 📁 Estrutura do Projeto

```
back-end-clinica/
│
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependências (autenticação, RBAC)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py          # Login, registro, refresh token
│   │       ├── users.py         # CRUD de usuários (Admin)
│   │       ├── profiles.py      # Perfis de médicos e pacientes
│   │       ├── doctors.py       # Listagem pública de médicos
│   │       ├── schedule.py      # Gestão de agenda (slots)
│   │       ├── appointments.py  # Agendamento de consultas
│   │       ├── payments.py      # Pagamentos simulados
│   │       ├── reports.py       # Relatórios
│   │       └── dashboard.py     # KPIs e métricas
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── enums.py             # Enums (UserRole, SlotStatus, etc)
│   │   └── security.py          # JWT, hash de senhas
│   │
│   ├── models/                  # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── schedule.py
│   │   ├── appointment.py
│   │   ├── payment.py
│   │   └── audit.py
│   │
│   ├── schemas/                 # Schemas Pydantic (validação)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── schedule.py
│   │   ├── appointment.py
│   │   ├── payment.py
│   │   ├── auth.py
│   │   └── common.py
│   │
│   ├── services/                # Lógica de negócio
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── schedule_service.py
│   │   ├── appointment_service.py
│   │   ├── payment_service.py
│   │   └── audit_service.py
│   │
│   ├── config.py                # Configurações (carrega .env)
│   ├── database.py              # Conexão com PostgreSQL
│   └── main.py                  # Aplicação FastAPI
│
├── scripts/
│   ├── scriptCriacaoTabelas.sql   # DDL (CREATE TABLE)
│   └── scriptPopulaTabelas.sql    # DML (INSERT de dados teste)
│
├── tests/                       # Testes automatizados
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_appointments.py
│   ├── test_payments.py
│   └── test_reports.py
│
├── docs/                        # Documentação adicional
│   ├── README.md
│   └── WINDOWS_SETUP_AND_RUN.txt
│
├── .env                         # Variáveis de ambiente (NÃO versionar!)
├── .env.example                 # Exemplo de .env
├── requirements.txt             # Dependências Python
└── README.md                    # Este arquivo
```

---

## 🔗 Principais Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/auth/register` | Auto-cadastro de paciente | ❌ |
| POST | `/api/v1/auth/login` | Login (retorna tokens) | ❌ |
| POST | `/api/v1/auth/refresh` | Renovar access token | ❌ |
| GET | `/api/v1/auth/me` | Dados do usuário logado | ✅ |

### Usuários (Admin)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/users` | Criar usuário (qualquer role) | Admin |
| GET | `/api/v1/users` | Listar usuários | Admin |
| GET | `/api/v1/users/{id}` | Consultar usuário | Admin/Próprio |
| PUT | `/api/v1/users/{id}` | Atualizar usuário | Admin |
| DELETE | `/api/v1/users/{id}` | Deletar usuário | Admin |

### Médicos (Público)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/doctors` | Listar médicos | ❌ |
| GET | `/api/v1/doctors/{id}` | Consultar médico | ❌ |
| GET | `/api/v1/doctors/{id}/profile` | Perfil do médico | ❌ |

### Agenda

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/doctors/{id}/agenda` | Ver agenda do médico | ❌ |
| POST | `/api/v1/doctors/{id}/agenda/slots` | Criar slot | Admin/Médico |
| DELETE | `/api/v1/agenda/slots/{id}` | Deletar slot | Admin/Médico |

### Consultas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/appointments` | Agendar consulta | Paciente |
| GET | `/api/v1/appointments` | Listar consultas | Usuário |
| PATCH | `/api/v1/appointments/{id}/status` | Atualizar status | Admin/Médico |

### Pagamentos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/payments` | Criar pagamento | Paciente |
| GET | `/api/v1/payments` | Listar pagamentos | Usuário |
| GET | `/api/v1/payments/{id}` | Consultar pagamento | Usuário |

### Dashboard

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/dashboard/kpis` | KPIs do dashboard | Usuário |

---

## 📝 Exemplos de Uso (cURL)

### 1. Fazer Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinica.com",
    "password": "Admin@123"
  }'
```

**Resposta**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 2. Listar Médicos (sem autenticação)

```bash
curl -X GET "http://localhost:8000/api/v1/doctors"
```

### 3. Ver Agenda de um Médico

```bash
curl -X GET "http://localhost:8000/api/v1/doctors/22222222-2222-2222-2222-222222222222/agenda?start=2025-10-27&end=2025-10-31"
```

### 4. Agendar Consulta (como paciente)

```bash
# Primeiro faça login como paciente e copie o token

curl -X POST "http://localhost:8000/api/v1/appointments" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "77777777-7777-7777-7777-777777777702",
    "observacoes": "Primeira consulta"
  }'
```

---

## 🧪 Executando os Testes

```bash
# Com o ambiente virtual ativado:
pytest tests/ -v

# Para ver cobertura:
pytest tests/ --cov=app --cov-report=html
```

---

## 🐛 Troubleshooting (Problemas Comuns)

### ❌ Erro: "could not connect to server"

**Solução**:
- Verifique se o PostgreSQL está rodando
- Windows: Abra "Serviços" e veja se "postgresql-x64-15" está em execução
- Linux: `sudo systemctl status postgresql`
- Verifique se a senha no `.env` está correta

### ❌ Erro: "relation does not exist"

**Solução**:
- Você esqueceu de executar os scripts SQL
- Execute novamente os scripts de criação e população

### ❌ Erro: "ModuleNotFoundError: No module named 'app'"

**Solução**:
- Certifique-se de que o ambiente virtual está ativado
- Execute `pip install -r requirements.txt` novamente
- Verifique se está no diretório correto (`back-end-clinica`)

### ❌ Erro: "Token inválido ou expirado"

**Solução**:
- Faça login novamente para obter um novo token
- Tokens expiram após 60 minutos (configurável no `.env`)

### ❌ Porta 8000 já está em uso

**Solução**:
```bash
# Use outra porta
uvicorn app.main:app --reload --port 8001
```

---

## 📚 Recursos Adicionais

- **Documentação FastAPI**: https://fastapi.tiangolo.com/
- **Documentação SQLAlchemy**: https://docs.sqlalchemy.org/
- **Documentação PostgreSQL**: https://www.postgresql.org/docs/
- **JWT.io**: https://jwt.io/ (para decodificar tokens)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Desenvolvedor

Desenvolvido como projeto acadêmico de sistema de gestão para clínicas de psicologia.

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique a seção [Troubleshooting](#-troubleshooting-problemas-comuns)
2. Consulte a documentação do Swagger em http://localhost:8000/docs
3. Abra uma issue no repositório

---

**🎉 Parabéns! Você configurou com sucesso a API da Clínica de Psicologia!**

Agora você pode começar a explorar os endpoints no Swagger e desenvolver sua aplicação frontend! 🚀