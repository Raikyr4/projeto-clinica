
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, appointments, schedule, payments, users, profiles, doctors, reports, dashboard

app = FastAPI(
    title="API Clínica de Psicologia",
    description="Sistema completo de gestão para clínicas de psicologia",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS - IMPORTANTE: deve vir ANTES dos routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",  # Caso use Vite padrão
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(profiles.router, prefix="/api/v1")
app.include_router(doctors.router, prefix="/api/v1")
app.include_router(schedule.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "API Clínica de Psicologia",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}


