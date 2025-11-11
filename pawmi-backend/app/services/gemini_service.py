"""
Servicio para interactuar con Gemini API de Google
"""
from typing import Optional

import google.generativeai as genai
from app.core.config import settings
from loguru import logger

# Configurar Gemini API
GEMINI_API_KEY = settings.gemini_api_key

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY, transport="rest")
    # Algunas rutas del SDK todavía requieren la variable de entorno
    # GOOGLE_API_KEY; la establecemos por compatibilidad.
    import os

    os.environ.setdefault("GOOGLE_API_KEY", GEMINI_API_KEY)
    logger.info("✅ Gemini API configurada correctamente (transport=rest)")
else:
    logger.warning("⚠️ GEMINI_API_KEY no encontrada en variables de entorno")


def generate_exercise_routine(
    name: str,
    breed: str,
    age: Optional[str],
    weight: Optional[str],
    animal_type: str = "perro"
) -> str:
    """
    Genera una rutina de ejercicio personalizada para una mascota
    
    Args:
        name: Nombre de la mascota
        breed: Raza de la mascota
        age: Edad de la mascota
        weight: Peso de la mascota
        animal_type: Tipo de animal (perro, gato, etc)
    
    Returns:
        str: Rutina de ejercicio personalizada en formato markdown
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY no configurada. Agrega tu API key en el archivo .env")
    
    # Construir el prompt
    prompt = f"""
Eres un experto veterinario y entrenador profesional de mascotas. 

Genera una rutina de ejercicio personalizada y detallada para la siguiente mascota:

**Nombre:** {name}
**Tipo:** {animal_type}
**Raza:** {breed}
**Edad:** {age}
**Peso:** {weight}

La rutina debe incluir:

1. **Análisis de la mascota**: Breve descripción de las características de esta raza y consideraciones especiales según su edad y peso.

2. **Rutina semanal**: Planificación día por día con:
   - Actividades específicas
   - Duración recomendada
   - Intensidad (baja/media/alta)
   - Horarios ideales

3. **Ejercicios recomendados**: 
   - Al menos 5 ejercicios específicos con descripción de cómo hacerlos
   - Beneficios de cada ejercicio
   - Precauciones a tener en cuenta

4. **Tips importantes**:
   - Señales de cansancio a vigilar
   - Hidratación
   - Clima y temperatura
   - Progresión gradual

5. **Actividades de enriquecimiento mental**: Juegos y actividades que estimulen su mente

Sigue esta estructura estricta en formato markdown y no uses tablas:

# Plan de ejercicio para {name} 🐾

## 1. Perfil rápido
- **Raza:** ...
- **Edad:** ...
- **Peso:** ...
- **Resumen:** ...

## 2. Rutina semanal
Para cada día (Lunes a Domingo) incluye un bloque con este formato:
### Día - Emoji descriptivo
- **Horario ideal:** ...
- **Actividades clave:** ...
- **Duración total:** ...
- **Intensidad:** ...

## 3. Ejercicios recomendados
Lista numerada (1-5) donde cada elemento incluya:
- **Nombre del ejercicio**
- **Cómo hacerlo**
- **Beneficios**
- **Precauciones**

## 4. Tips importantes
Lista con viñetas para cansancio, hidratación, clima/temperatura y progresión.

## 5. Enriquecimiento mental
Lista con al menos cuatro ideas concretas.

Usa encabezados (`#`, `##`, `###`) y listas simples (`-`, `1.`). No utilices tablas, párrafos sueltos sin título ni listas anidadas. Mantén los emojis puntuales para dar calidez sin sobrecargar el texto. Responde en español.
"""

    # Los modelos evolucionan con frecuencia; probamos primero las versiones más recientes
    model_candidates = [
        "models/gemini-2.5-flash",
        "gemini-2.5-flash",
        "models/gemini-2.5-flash-lite",
        "gemini-2.5-flash-lite",
        "models/gemini-2.0-flash",
        "gemini-2.0-flash",
        "models/gemini-2.0-flash-lite",
        "gemini-2.0-flash-lite",
        "models/gemini-1.5-flash",
        "gemini-1.5-flash",
        "models/gemini-1.5-flash-latest",
        "gemini-1.5-flash-latest",
        "models/gemini-1.0-pro",
        "gemini-1.0-pro",
        "models/gemini-pro",
        "gemini-pro",
    ]

    last_error: Optional[Exception] = None

    for model_name in model_candidates:
        try:
            logger.info(f"🔎 Probando modelo de Gemini: {model_name}")
            model = genai.GenerativeModel(model_name)

            # Generar la respuesta
            response = model.generate_content(prompt)

            if not response.text:
                raise ValueError("Gemini no generó ninguna respuesta")

            logger.info(f"✅ Rutina generada exitosamente para {name} usando {model_name}")
            return response.text

        except Exception as model_error:  # pragma: no cover - logging auxiliar
            last_error = model_error
            logger.warning(
                "⚠️ Modelo {} no disponible o falló: {}",
                model_name,
                model_error,
            )

    logger.error("❌ Todos los modelos de Gemini probados fallaron")
    raise Exception(
        "Error al comunicarse con Gemini AI. Último error: "
        + (str(last_error) if last_error else "desconocido")
    )
