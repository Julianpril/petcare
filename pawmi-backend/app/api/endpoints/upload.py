"""
Endpoint para subir imágenes con fallback automático:
- Intenta Supabase Storage primero (cloud)
- Si falla, guarda localmente en /storage
"""
import logging
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from app.api.deps import get_current_user
from app.models.user import User
from fastapi import (APIRouter, Depends, File, Form, HTTPException, Request,
                     UploadFile, status)
from supabase import create_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])

# Cliente de Supabase (puede ser None si las variables no están configuradas)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Inicializar cliente de Supabase solo si hay credenciales
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ Cliente de Supabase Storage inicializado")
    except Exception as e:
        logger.warning(f"⚠️  No se pudo inicializar Supabase Storage: {e}")

# Configuración de almacenamiento local
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # Raíz del proyecto
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

# Asegurar que existen las carpetas
for folder in ["pets", "reminders", "profiles"]:
    (STORAGE_DIR / folder).mkdir(exist_ok=True)


def get_base_url(request: Request) -> str:
    """Obtiene la URL base del servidor para construir URLs absolutas."""
    # Usar 0.0.0.0 no funciona para clientes externos, usar la IP real
    if "0.0.0.0" in str(request.base_url):
        # Obtener la IP local del servidor
        import socket
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        return f"http://{local_ip}:8000"
    return str(request.base_url).rstrip('/')


def save_file_locally(contents: bytes, folder: str, filename: str, file_ext: str, request: Request) -> str:
    """Guarda un archivo localmente y retorna la URL absoluta."""
    local_folder = STORAGE_DIR / folder
    local_folder.mkdir(exist_ok=True)
    
    file_path = local_folder / filename
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Retornar URL absoluta que el frontend puede acceder
    base_url = get_base_url(request)
    return f"{base_url}/storage/{folder}/{filename}"


def upload_to_supabase(contents: bytes, folder: str, filename: str, content_type: str) -> str:
    """Intenta subir a Supabase Storage. Retorna URL pública o lanza excepción."""
    if not supabase:
        raise Exception("Cliente de Supabase no inicializado")
    
    bucket_name = "pet-images"
    file_path = f"{folder}/{filename}"
    
    result = supabase.storage.from_(bucket_name).upload(
        path=file_path,
        file=contents,
        file_options={
            "content-type": content_type,
            "upsert": "false"
        }
    )
    
    if hasattr(result, 'error') and result.error:
        raise Exception(f"Error de Supabase: {result.error}")
    
    # Obtener URL pública
    public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
    return public_url


@router.post("/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    folder: str = Form("pets"),
    current_user: User = Depends(get_current_user)
):
    """
    Subir una imagen con fallback automático:
    1. Intenta Supabase Storage (cloud)
    2. Si falla, guarda localmente
    
    **Parámetros:**
    - file: Archivo de imagen
    - folder: Carpeta de destino (default: pets)
    
    **Retorna:**
    - publicUrl: URL pública de la imagen (Supabase) o URL local
    - path: Ruta del archivo en storage
    - storage: "supabase" o "local"
    """
    try:
        # Validar tipo de archivo
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de archivo no permitido: {file.content_type}"
            )
        
        # Validar tamaño (5MB máximo)
        contents = await file.read()
        file_size = len(contents)
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo es demasiado grande. Máximo 5MB"
            )
        
        # Generar nombre único
        file_ext = file.filename.split('.')[-1] if file.filename else 'jpg'
        unique_filename = f"{datetime.now().timestamp()}-{uuid.uuid4().hex[:8]}.{file_ext}"
        
        logger.info(f"📤 Subiendo imagen: {folder}/{unique_filename} ({file_size} bytes)")
        
        # Intentar subir a Supabase primero
        storage_used = "local"
        public_url = None
        
        try:
            public_url = upload_to_supabase(contents, folder, unique_filename, file.content_type)
            storage_used = "supabase"
            logger.info(f"✅ Imagen subida a Supabase: {public_url}")
        except Exception as supabase_error:
            # Fallback: guardar localmente
            logger.warning(f"⚠️  Supabase no disponible: {supabase_error}")
            logger.info(f"💾 Guardando imagen localmente...")
            public_url = save_file_locally(contents, folder, unique_filename, file_ext, request)
            logger.info(f"✅ Imagen guardada localmente: {public_url}")
        
        return {
            "publicUrl": public_url,
            "path": f"{folder}/{unique_filename}",
            "storage": storage_used,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error inesperado al subir imagen: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir imagen: {str(e)}"
        )


@router.get("/storage-status")
async def storage_status():
    """
    Retorna el estado del sistema de almacenamiento.
    """
    supabase_available = supabase is not None
    
    # Contar archivos locales
    local_files = {
        "pets": len(list((STORAGE_DIR / "pets").glob("*"))) if (STORAGE_DIR / "pets").exists() else 0,
        "reminders": len(list((STORAGE_DIR / "reminders").glob("*"))) if (STORAGE_DIR / "reminders").exists() else 0,
        "profiles": len(list((STORAGE_DIR / "profiles").glob("*"))) if (STORAGE_DIR / "profiles").exists() else 0,
    }
    
    return {
        "status": "ok",
        "storage": {
            "supabase": {
                "available": supabase_available,
                "url": SUPABASE_URL if supabase_available else None,
            },
            "local": {
                "available": True,
                "path": str(STORAGE_DIR),
                "files": local_files,
                "total_files": sum(local_files.values())
            }
        },
        "priority": "supabase" if supabase_available else "local",
        "message": "Almacenamiento funcionando con fallback automático"
    }
