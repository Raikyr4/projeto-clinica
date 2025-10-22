from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker  # <-- import correto
from app.config import settings

# garanta que DATABASE_URL é string
db_url = settings.DATABASE_URL
try:
    # se for SecretStr (Pydantic)
    db_url = db_url.get_secret_value()
except AttributeError:
    # se for AnyUrl/PostgresDsn (Pydantic v2) ou já for str
    db_url = str(db_url)

# Ex.: "postgresql+psycopg2://user:pass@localhost:5432/meubanco"
engine = create_engine(db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
