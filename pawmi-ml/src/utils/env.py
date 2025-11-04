"""
Utilidad para cargar variables de entorno desde .env
"""
import os
from pathlib import Path
from typing import Optional, overload


def load_env_file(env_path: Optional[str] = None):
    """
    Carga variables de entorno desde archivo .env
    
    Args:
        env_path: Ruta al archivo .env (opcional)
    """
    env_file: Path
    if env_path is None:
        # Buscar .env en el directorio raíz del proyecto
        current_dir = Path(__file__).parent.parent
        env_file = current_dir / ".env"
    else:
        env_file = Path(env_path)
    
    if not env_file.exists():
        print(f"⚠️ Warning: .env file not found at {env_file}")
        return
    
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            
            # Ignorar comentarios y líneas vacías
            if not line or line.startswith('#'):
                continue
            
            # Separar clave=valor
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Remover comillas si existen
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                # Setear variable de entorno
                os.environ[key] = value
    
    print(f"✅ Environment variables loaded from {env_file}")

@overload
def get_env(key: str, default: str) -> str: ...

@overload
def get_env(key: str, default: None = None) -> Optional[str]: ...

def get_env(key: str, default: Optional[str] = None) -> Optional[str]:
    """
    Obtiene variable de entorno
    
    Args:
        key: Nombre de la variable
        default: Valor por defecto si no existe
    
    Returns:
        Valor de la variable o default
    """
    value = os.environ.get(key, default)
    return value if value is not None else default

def get_env_bool(key: str, default: bool = False) -> bool:
    """
    Obtiene variable de entorno como booleano
    
    Args:
        key: Nombre de la variable
        default: Valor por defecto
    
    Returns:
        Valor booleano
    """
    value = get_env(key)
    if value is None:
        return default
    
    return value.lower() in ('true', '1', 'yes', 'on')

def get_env_int(key: str, default: int = 0) -> int:
    """
    Obtiene variable de entorno como entero
    
    Args:
        key: Nombre de la variable
        default: Valor por defecto
    
    Returns:
        Valor entero
    """
    value = get_env(key)
    if value is None:
        return default
    
    try:
        return int(value)
    except ValueError:
        return default

def get_env_float(key: str, default: float = 0.0) -> float:
    """
    Obtiene variable de entorno como float
    
    Args:
        key: Nombre de la variable
        default: Valor por defecto
    
    Returns:
        Valor float
    """
    value = get_env(key)
    if value is None:
        return default
    
    try:
        return float(value)
    except ValueError:
        return default

# Auto-cargar .env al importar el módulo
try:
    load_env_file()
except Exception as e:
    print(f"⚠️ Could not load .env file: {e}")
