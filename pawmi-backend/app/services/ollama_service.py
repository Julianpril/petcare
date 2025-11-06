"""
Servicio de Ollama para mejorar la comprensión de síntomas y formatear respuestas.
NO cambia las predicciones del ML, solo ayuda a interpretar y comunicar.
"""
import json
import logging
from typing import Any, Dict, List

import requests

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self, model: str = "gemma3:1b", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"
        
    def _call_ollama(self, prompt: str, temperature: float = 0.3) -> str:
        """Llama a Ollama con un prompt y retorna la respuesta"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "temperature": temperature,
                "options": {
                    "num_predict": 300,  # Límite de tokens para respuestas concisas
                    "num_ctx": 2048,  # Contexto reducido para más velocidad
                }
            }
            
            response = requests.post(self.api_url, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            return result.get("response", "").strip()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Ollama: {e}")
            return ""
    
    def extract_symptoms_from_text(self, user_message: str) -> Dict[str, int]:
        """
        Usa Ollama para extraer síntomas del mensaje del usuario.
        Si Ollama falla, usa extracción por palabras clave (fallback).
        Retorna un diccionario con los síntomas detectados.
        """
        
        # TEMPORAL: Usar solo fallback para debugging
        logger.info("Usando extracción por palabras clave (Ollama desactivado temporalmente)")
        return self._extract_with_keywords(user_message)
        
        # Intentar con Ollama primero
        # try:
        #     return self._extract_with_ollama(user_message)
        # except Exception as e:
        #     logger.warning(f"Ollama falló, usando fallback de palabras clave: {e}")
        #     return self._extract_with_keywords(user_message)
    
    def _extract_with_keywords(self, user_message: str) -> Dict[str, int]:
        """Fallback: extracción simple por palabras clave"""
        symptoms = {}
        text_lower = user_message.lower()
        
        keyword_map = {
            'vomitos': ['vomit', 'vómito', 'devuelv', 'arcada'],
            'diarrea': ['diarrea', 'heces blandas', 'caca líquida', 'deposiciones'],
            'diarrea_hemorragica': ['sangre', 'hemorrágica', 'hemorragica', 'con sangre', 'sanguinolent'],
            'fiebre': ['fiebre', 'caliente', 'temperatura alta', 'calentura'],
            'letargo': ['letargo', 'decaído', 'sin energía', 'cansad', 'débil', 'apátic', 'no quiere comer'],
            'deshidratacion': ['deshidrat', 'seco', 'sin agua'],
            'tos': ['tos', 'toser', 'tose'],
            'disnea': ['dificultad respirar', 'respira mal', 'le cuesta respirar'],
            'cojera': ['cojea', 'cojera', 'renguea', 'no apoya'],
            'rigidez': ['rígido', 'rigidez', 'tieso', 'duro'],
            'dolor_articular': ['dolor articu', 'dolor en las patas', 'dolor en las piernas', 'artritis'],
            'dolor_abdominal': ['dolor abdominal', 'le duele la panza', 'dolor de estómago'],
            'prurito': ['picazón', 'rascarse', 'rasca', 'comezón'],
            'alopecia': ['pérdida de pelo', 'se le cae el pelo', 'calvo', 'sin pelo'],
            'estornudos': ['estornud', 'resfri'],
            'secrecion_nasal': ['mocos', 'nariz', 'secreción nasal'],
            'secrecion_ocular': ['legañ', 'ojos llorosos', 'secreción ocular'],
            'convulsiones': ['convulsion', 'temblor', 'espasmo', 'ataque'],
        }
        
        for symptom, keywords in keyword_map.items():
            if any(kw in text_lower for kw in keywords):
                symptoms[symptom] = 1
        
        logger.info(f"🔍 Síntomas detectados por keywords: {symptoms}")
        return symptoms
    
    def _extract_with_ollama(self, user_message: str) -> Dict[str, int]:
        """Extracción inteligente con Ollama"""
        
        # Lista de síntomas que el modelo ML espera
        available_symptoms = [
            "vomitos", "diarrea", "diarrea_hemorragica", "fiebre", "letargo",
            "deshidratacion", "tos", "disnea", "estornudos", "secrecion_nasal",
            "secrecion_ocular", "ulceras_orales", "prurito", "alopecia", "otitis",
            "dolor_abdominal", "ictericia", "hematuria", "disuria", "cojera",
            "rigidez", "dolor_articular", "convulsiones", "signos_neurologicos",
            "hipersalivacion", "soplo_cardiaco", "taquipnea"
        ]
        
        prompt = f"""Extrae los síntomas del texto. Responde SOLO con JSON.

Síntomas disponibles: {', '.join(available_symptoms[:15])}  

Texto: "{user_message}"

Formato: {{"sintoma": 1}}

Respuesta JSON:"""

        response = self._call_ollama(prompt, temperature=0.1)
        
        # Intentar parsear la respuesta como JSON
        try:
            # Limpiar la respuesta (puede tener markdown o texto extra)
            response = response.strip()
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            symptoms = json.loads(response)
            
            # Validar que solo contenga síntomas válidos
            validated = {}
            for symptom, value in symptoms.items():
                if symptom in available_symptoms:
                    validated[symptom] = 1 if value else 0
            
            logger.info(f"Síntomas extraídos por Ollama: {validated}")
            return validated
            
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.warning(f"No se pudo parsear respuesta de Ollama: {response}. Error: {e}")
            # Fallback: buscar síntomas mencionados en la respuesta
            validated = {}
            response_lower = response.lower()
            for symptom in available_symptoms:
                if symptom in response_lower:
                    validated[symptom] = 1
            return validated
    
    def format_prediction_response(
        self, 
        predictions: List[Dict[str, Any]], 
        pet_name: str,
        symptoms_mentioned: List[str]
    ) -> str:
        """
        Formatea las predicciones del modelo ML en un mensaje conversacional.
        NO cambia las predicciones, solo las presenta de forma amigable.
        """
        
        # TEMPORAL: Usar solo fallback para debugging  
        logger.info("Usando formato simple (Ollama desactivado temporalmente)")
        return self._fallback_response(predictions, pet_name)
        
        # Preparar lista de predicciones para el prompt
        # predictions_text = "\n".join([
        #     f"- {pred['disease']} ({pred['probability']:.1%} de probabilidad)"
        #     for pred in predictions[:3]
        # ])
        # 
        # symptoms_text = ", ".join(symptoms_mentioned) if symptoms_mentioned else "varios síntomas"
        # 
        # prompt = f"""...prompt largo..."""
        # 
        # response = self._call_ollama(prompt, temperature=0.7)
        # return response if response else self._fallback_response(predictions, pet_name)
    
    def _fallback_response(self, predictions: List[Dict[str, Any]], pet_name: str) -> str:
        """Respuesta de fallback si Ollama falla"""
        top_pred = predictions[0] if predictions else {"disease": "desconocida", "probability": 0}
        
        return f"""Basándome en los síntomas de {pet_name}, el análisis indica:

🔍 **Posibles diagnósticos:**
{chr(10).join([f"• {p['disease']}: {p['probability']:.1%}" for p in predictions[:3]])}

La condición más probable es **{top_pred['disease']}** con {top_pred['probability']:.1%} de confianza.

⚕️ **Recomendación:** Te sugiero consultar con un veterinario para un diagnóstico preciso y tratamiento adecuado."""


# Instancia global del servicio
ollama_service = OllamaService()
