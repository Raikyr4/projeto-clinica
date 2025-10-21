
"""API V1 Routes"""
from app.api.v1 import (
    auth,
    users,
    profiles,
    doctors,
    schedule,
    appointments,
    payments,
    reports,
    dashboard
)

__all__ = [
    "auth",
    "users",
    "profiles",
    "doctors",
    "schedule",
    "appointments",
    "payments",
    "reports",
    "dashboard"
]


