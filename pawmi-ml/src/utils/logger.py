import sys
from pathlib import Path
from typing import Optional

from loguru import logger


def setup_logger(name: str = "pawmi-ml", log_file: Optional[str] = None):
    """
    Configura logger con Loguru para PawMI ML
    
    Args:
        name: Nombre del logger
        log_file: Ruta al archivo de log (opcional)
    
    Returns:
        logger configurado
    """
    # Remover handlers por defecto
    logger.remove()
    
    # Console handler con colores
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # File handler si se proporciona
    if log_file is not None and log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.add(
            log_file,
            rotation="10 MB",
            retention="1 week",
            compression="zip",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function} - {message}",
            level="DEBUG"
        )
    
    return logger

# Logger por defecto
default_logger = setup_logger()
