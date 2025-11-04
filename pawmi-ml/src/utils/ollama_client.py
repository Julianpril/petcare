import json
from typing import Dict, List, Optional

import requests
from loguru import logger


class OllamaClient:
    """Cliente para interactuar con Ollama (Gemma) - PawMI ML"""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.generate_url = f"{base_url}/api/generate"
        self.chat_url = f"{base_url}/api/chat"
    
    def generate(
        self,
        prompt: str,
        model: str = "gemma:latest",
        temperature: float = 0.7,
        stream: bool = False,
        options: Optional[Dict] = None
    ) -> str:
        """
        Genera respuesta con Gemma
        
        Args:
            prompt: Prompt para el modelo
            model: Nombre del modelo
            temperature: Temperatura (0.0-1.0)
            stream: Si retornar streaming
            options: Opciones adicionales
        
        Returns:
            Respuesta del modelo
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            "options": options or {"temperature": temperature}
        }
        
        try:
            response = requests.post(
                self.generate_url,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Error calling Ollama: {e}")
            raise
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gemma:latest",
        temperature: float = 0.7
    ) -> str:
        """
        Chat con contexto
        
        Args:
            messages: Lista de mensajes [{"role": "user", "content": "..."}]
            model: Nombre del modelo
            temperature: Temperatura
        
        Returns:
            Respuesta del modelo
        """
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        
        try:
            response = requests.post(
                self.chat_url,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("message", {}).get("content", "")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Error calling Ollama chat: {e}")
            raise
    
    def parse_json_response(self, response: str) -> Optional[Dict]:
        """
        Extrae JSON de la respuesta del modelo
        
        Args:
            response: Texto de respuesta
        
        Returns:
            Dict con JSON parseado o None
        """
        try:
            # Buscar inicio y fin de JSON
            start = response.find('{')
            end = response.rfind('}') + 1
            
            if start != -1 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
            
            return None
            
        except json.JSONDecodeError as e:
            logger.warning(f"⚠️ Error parsing JSON: {e}")
            return None
    
    def is_available(self) -> bool:
        """Verifica si Ollama está disponible"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
