from app.api.endpoints import auth, breed, disease, pets, reminders
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# App
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Veterinary Diagnosis API with AI",
)

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
