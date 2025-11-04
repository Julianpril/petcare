from pathlib import Path
from typing import Any, Dict

import yaml
from loguru import logger


def load_config(config_path: str) -> Dict[str, Any]:
    """
    Carga archivo de configuración YAML para PawMI ML
    
    Args:
        config_path: Ruta al archivo YAML
    
    Returns:
        Diccionario con configuración
    """
    config_file = Path(config_path)
    
    if not config_file.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    with open(config_file, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    logger.info(f"✅ Config loaded from: {config_path}")
    return config

class Config:
    """Clase de configuración global para PawMI ML"""
    
    def __init__(self, config_dict: Dict[str, Any]):
        self._config = config_dict
    
    def get(self, key: str, default=None):
        """Get config value with dot notation"""
        keys = key.split('.')
        value = self._config
        
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, default)
            else:
                return default
        
        return value
    
    def __getitem__(self, key):
        return self._config[key]
    
    def __contains__(self, key):
        return key in self._config
