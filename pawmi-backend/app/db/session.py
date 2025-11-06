import logging
import time
from collections.abc import Generator

from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

# Configurar logging
logger = logging.getLogger(__name__)

# URLs de las bases de datos
SUPABASE_URL = "postgresql://postgres:PawMi2502..@db.jnttxcptkmokdwglxqpu.supabase.co:5432/postgres"
LOCAL_URL = "postgresql://postgres:2502@localhost:5432/pawMi_db"

# Variable global para trackear el estado
_current_db_url = None
_last_check_time = 0
_check_interval = 60  # Verificar cada 60 segundos si cambió la conexión

def test_database_connection(url: str, timeout: int = 5) -> bool:
    """Prueba si una base de datos está disponible."""
    try:
        test_engine = create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": timeout}
        )
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        test_engine.dispose()
        return True
    except Exception as e:
        logger.debug(f"Database connection test failed for {url}: {str(e)}")
        return False

def get_active_database_url() -> str:
    """
    Determina qué base de datos usar:
    1. Intenta Supabase primero (si hay internet)
    2. Cae a local si Supabase no responde
    3. Re-chequea periódicamente para reconectar a Supabase cuando vuelva internet
    """
    global _current_db_url, _last_check_time
    
    current_time = time.time()
    
    # Si ya tenemos una URL y no ha pasado suficiente tiempo, usarla
    if _current_db_url and (current_time - _last_check_time) < _check_interval:
        return _current_db_url
    
    # Actualizar el tiempo de chequeo
    _last_check_time = current_time
    
    # Primero intentar Supabase (preferida)
    logger.info("Verificando conexión a Supabase...")
    if test_database_connection(SUPABASE_URL, timeout=3):
        if _current_db_url != SUPABASE_URL:
            logger.info("✅ Conectado a Supabase (remota)")
        _current_db_url = SUPABASE_URL
        return SUPABASE_URL
    
    # Si Supabase falla, usar local
    logger.info("Supabase no disponible, verificando base de datos local...")
    if test_database_connection(LOCAL_URL, timeout=2):
        if _current_db_url != LOCAL_URL:
            logger.warning("⚠️  Usando base de datos LOCAL (pawMi_db) - Supabase no disponible")
        _current_db_url = LOCAL_URL
        return LOCAL_URL
    
    # Si ninguna funciona, intentar la URL del .env como último recurso
    logger.error("❌ Ni Supabase ni base local están disponibles. Usando configuración de .env")
    return settings.database_url

# Crear engine con la URL activa
def get_engine():
    """Obtiene el engine de la base de datos activa."""
    db_url = get_active_database_url()
    return create_engine(db_url, pool_pre_ping=True)

# Inicializar engine y session
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency que provee una sesión de base de datos.
    Automáticamente usa Supabase si hay conexión, o local si no hay.
    """
    # Verificar si cambió la base de datos activa
    global engine, SessionLocal
    active_url = get_active_database_url()
    
    # Si cambió la URL, recrear el engine
    if _current_db_url and active_url != engine.url:
        logger.info(f"Cambiando conexión de base de datos...")
        engine.dispose()
        engine = get_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
