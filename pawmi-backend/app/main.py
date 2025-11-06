import logging

from app.api.endpoints import (auth, breed, disease, disease_prediction, pets,
                               prediagnosis, reminders)
from app.core.config import settings
from app.db.session import (LOCAL_URL, SUPABASE_URL, _current_db_url,
                            get_active_database_url)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

# App
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Veterinary Diagnosis API with AI",
)


@app.on_event("startup")
async def startup_event():
    """Show database status on startup."""
    db_url = get_active_database_url()
    
    if "supabase" in db_url:
        logger.info("=" * 60)
        logger.info("✅ CONECTADO A SUPABASE (Remota)")
        logger.info("   Base de datos: db.jnttxcptkmokdwglxqpu.supabase.co")
        logger.info("   Modo: Producción con datos reales")
        logger.info("=" * 60)
    elif "localhost" in db_url:
        logger.warning("=" * 60)
        logger.warning("⚠️  USANDO BASE DE DATOS LOCAL (pawMi_db)")
        logger.warning("   Base de datos: localhost:5432/pawMi_db")
        logger.warning("   Modo: Desarrollo offline - Supabase no disponible")
        logger.warning("   Se reconectará automáticamente a Supabase cuando haya internet")
        logger.warning("=" * 60)
    
    logger.info("🔄 Sistema de fallback automático activo")
    logger.info("   - Prioridad 1: Supabase (remota)")
    logger.info("   - Prioridad 2: PostgreSQL local (pawMi_db)")


# CORS Configuration
# Always allow these origins for development
allow_origins = [
    "http://localhost:8081",      # Expo web dev server
    "http://localhost:19006",     # Expo web alternative port
    "http://localhost:19000",     # Expo CLI
    "http://localhost:3000",      # React dev server
    "exp://localhost:8081",       # Expo protocol
    "*",                          # Allow all origins in development
]

# Add custom origins from settings if provided
if settings.cors_origins:
    allow_origins.extend(settings.cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(reminders.router)
app.include_router(breed.router)
app.include_router(disease.router, prefix="/disease", tags=["Disease Prediction"])
app.include_router(disease_prediction.router, prefix="/api/ml", tags=["ML Disease Prediction"])
app.include_router(prediagnosis.router, prefix="/api/prediagnosis", tags=["Prediagnosis Flow"])


@app.get("/")
def root():
    return {
        "message": "PawMI API - Veterinary Diagnosis with AI",
        "version": settings.app_version,
        "status": "healthy",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "pawmi-backend"}


@app.get("/database-status")
def database_status():
    """Endpoint para verificar qué base de datos está activa."""
    db_type = "unknown"
    db_name = "unknown"
    
    if _current_db_url:
        if "supabase" in _current_db_url:
            db_type = "remote"
            db_name = "Supabase"
        elif "localhost" in _current_db_url:
            db_type = "local"
            db_name = "pawMi_db (Local PostgreSQL)"
    
    return {
        "status": "ok",
        "database": {
            "type": db_type,
            "name": db_name,
            "url": _current_db_url.replace("2502", "****") if _current_db_url else "not initialized",
            "fallback_enabled": True,
            "primary": "Supabase (remote)",
            "secondary": "pawMi_db (local)"
        },
        "message": "La base de datos cambia automáticamente según disponibilidad"
    }
