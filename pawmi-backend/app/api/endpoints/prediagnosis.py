"""
API endpoints para el flujo de prediagnóstico conversacional.
Procesa el flujo JSON de preguntas y genera predicciones ML.
"""
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.ml.predictor import get_predictor
from app.schemas.disease_prediction import (DiseasePredictionRequest,
                                            DiseasePredictionResponse)
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()

# Cargar el flujo de prediagnóstico
FLOW_PATH = Path(__file__).parent.parent.parent / "schemas" / "prediagnosis_flow.json"

def load_prediagnosis_flow() -> Dict[str, Any]:
    """Carga el flujo de prediagnóstico desde JSON."""
    try:
        with open(FLOW_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error cargando flujo de prediagnóstico: {str(e)}"
        )


# === SCHEMAS ===

class PrediagnosisAnswers(BaseModel):
    """Respuestas del usuario al flujo de prediagnóstico."""
    answers: Dict[str, Any] = Field(
        ...,
        description="Diccionario con las respuestas del usuario. Key = question_id, Value = respuesta"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "answers": {
                    "q_especie": "perro",
                    "q_edad": "2 años",
                    "q_vacunas": "sí",
                    "q_fiebre": "sí",
                    "q_vomitos": "sí",
                    "q_diarrea": "diarrea con sangre",
                    "q_decaimiento": "sí"
                }
            }
        }


class PrediagnosisResult(BaseModel):
    """Resultado del procesamiento de prediagnóstico."""
    predictions: List[Dict[str, Any]]
    model_accuracy: float
    disclaimer: str
    detected_symptoms: List[str]
    urgency_alert: Optional[str] = None
    recommendation: str


class FlowStep(BaseModel):
    """Información del siguiente paso en el flujo."""
    step_id: str
    step_type: str
    messages: Optional[List[str]] = None
    questions: Optional[List[Dict[str, Any]]] = None


# === HELPER FUNCTIONS ===

def parse_age_to_years(age_str: str) -> float:
    """Convierte edad en formato texto a años."""
    age_str = age_str.lower().strip()
    
    # Buscar patrones como "6 meses", "2 años", "1.5 años"
    if 'mes' in age_str:
        # Extraer número antes de "mes"
        import re
        match = re.search(r'(\d+(?:\.\d+)?)', age_str)
        if match:
            months = float(match.group(1))
            return months / 12.0
    elif 'año' in age_str or 'ano' in age_str:
        import re
        match = re.search(r'(\d+(?:\.\d+)?)', age_str)
        if match:
            return float(match.group(1))
    else:
        # Intentar convertir directamente a número
        import re
        match = re.search(r'(\d+(?:\.\d+)?)', age_str)
        if match:
            return float(match.group(1))
    
    # Default: 3 años si no se puede parsear
    return 3.0


def map_answers_to_ml_features(answers: Dict[str, Any], flow: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mapea las respuestas del flujo a features del modelo ML.
    
    Returns:
        Dict con las features necesarias para DiseasePredictionRequest
    """
    # Obtener mapeo de columnas
    column_mapping = flow.get("mapeo_columnas_dataset", {})
    
    # Inicializar features (usando etiquetas en inglés del dataset)
    ml_features = {
        "animal_type": "Perro",  # Default
        "age": 3.0,
        "size": "Medium",  # English: Small/Medium/Large
        "life_stage": "Adult",  # English: Puppy/Kitten/Adult/Senior
        "weight_kg": 15.0,
        "sex": "Male",  # English: Male/Female
        "vaccination_up_to_date": 0,  # Numeric: 0/1
        "symptoms": {}
    }
    
    # Procesar respuestas básicas
    if "q_especie" in answers:
        especie = answers["q_especie"].lower()
        ml_features["animal_type"] = "Perro" if "perro" in especie else "Gato"
    
    if "q_edad" in answers:
        ml_features["age"] = parse_age_to_years(answers["q_edad"])
        
        # Inferir life_stage de la edad (usando etiquetas en inglés)
        age = ml_features["age"]
        if age < 1:
            ml_features["life_stage"] = "Puppy" if ml_features["animal_type"] == "Perro" else "Kitten"
        elif age < 7:
            ml_features["life_stage"] = "Adult"
        else:
            ml_features["life_stage"] = "Senior"
    
    if "q_vacunas" in answers:
        vacunas = answers["q_vacunas"].lower()
        ml_features["vaccination_up_to_date"] = 1 if "sí" in vacunas or "si" in vacunas else 0
    
    # Mapear síntomas usando el mapeo del JSON
    for symptom_col, question_ids in column_mapping.items():
        for q_id in question_ids:
            if q_id in answers:
                answer = answers[q_id]
                
                # Convertir respuesta a binario
                if isinstance(answer, str):
                    answer_lower = answer.lower()
                    
                    # Casos especiales
                    if q_id == "q_diarrea":
                        if "con sangre" in answer_lower:
                            ml_features["symptoms"]["diarrhea"] = 1
                            ml_features["symptoms"]["diarrhea_hemorrhagic"] = 1
                        elif "sin sangre" in answer_lower:
                            ml_features["symptoms"]["diarrhea"] = 1
                            ml_features["symptoms"]["diarrhea_hemorrhagic"] = 0
                        else:
                            ml_features["symptoms"]["diarrhea"] = 0
                            ml_features["symptoms"]["diarrhea_hemorrhagic"] = 0
                    elif q_id == "q_tos":
                        if "no" in answer_lower:
                            ml_features["symptoms"]["cough"] = 0
                        else:
                            ml_features["symptoms"]["cough"] = 1
                    else:
                        # Mapeo estándar sí/no
                        if "sí" in answer_lower or "si" in answer_lower:
                            ml_features["symptoms"][symptom_col] = 1
                        elif "no" in answer_lower:
                            ml_features["symptoms"][symptom_col] = 0
                        # "no estoy seguro/a" se trata como 0
                        else:
                            ml_features["symptoms"][symptom_col] = 0
                
                elif isinstance(answer, (int, float)):
                    ml_features["symptoms"][symptom_col] = int(answer)
    
    # Rellenar síntomas no mencionados con 0
    all_symptoms = [
        'fever', 'vomiting', 'diarrhea', 'diarrhea_hemorrhagic', 'loss_appetite', 'lethargy',
        'dehydration', 'abdominal_pain', 'cough', 'nasal_discharge', 'ocular_discharge',
        'sneezing', 'salivation', 'mouth_ulcers', 'conjunctivitis', 'breathing_difficulty',
        'tachypnea', 'weight_loss', 'increased_thirst', 'increased_urination', 'increased_appetite',
        'seizures', 'convulsions', 'neurologic_signs', 'alopecia', 'itching', 'skin_crusts',
        'thickened_skin', 'ear_discharge', 'ear_odor', 'head_shaking', 'limping', 'stiff_gait',
        'difficulty_rising', 'reluctance_to_jump', 'joint_pain', 'hyperactivity', 'unkempt_coat',
        'wheezing', 'open_mouth_breathing', 'dry_cough', 'exercise_intolerance', 'painful_belly'
    ]
    
    for symptom in all_symptoms:
        if symptom not in ml_features["symptoms"]:
            ml_features["symptoms"][symptom] = 0
    
    return ml_features


def check_urgency_criteria(ml_features: Dict[str, Any], flow: Dict[str, Any]) -> Optional[str]:
    """
    Verifica si las respuestas cumplen criterios de urgencia.
    
    Returns:
        Mensaje de urgencia o None si no hay urgencia
    """
    criteria = flow.get("criterios_urgencia", [])
    symptoms = ml_features.get("symptoms", {})
    
    for criterion in criteria:
        rule = criterion.get("rule", "")
        
        # Evaluar regla simple (esto se puede mejorar con un parser más robusto)
        urgency_detected = False
        
        if "breathing_difficulty == 1" in rule and symptoms.get("breathing_difficulty") == 1:
            urgency_detected = True
        elif "seizures == 1" in rule and symptoms.get("seizures") == 1:
            urgency_detected = True
        elif "diarrhea_hemorrhagic == 1 && dehydration == 1" in rule:
            if symptoms.get("diarrhea_hemorrhagic") == 1 and symptoms.get("dehydration") == 1:
                urgency_detected = True
        
        if urgency_detected:
            return criterion.get("message", "Te recomiendo acudir a una clínica veterinaria pronto.")
    
    return None


def filter_predictions_by_species(
    predictions: List[Dict[str, Any]], 
    animal_type: str,
    flow: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Filtra predicciones según compatibilidad con la especie."""
    compatibility = flow.get("compatibilidad_especie_enfermedad", {})
    
    species_key = "perro" if animal_type.lower() in ["perro", "dog"] else "gato"
    valid_diseases = compatibility.get(species_key, [])
    
    logger.info(f"🔍 Filtrando predicciones para especie: {species_key}")
    logger.info(f"📋 Enfermedades válidas para {species_key}: {valid_diseases}")
    
    # Si no hay restricciones, devolver todas
    if not valid_diseases:
        logger.warning("⚠️  No hay restricciones de especie configuradas")
        return predictions
    
    # Filtrar predicciones compatibles
    filtered = []
    removed = []
    
    for pred in predictions:
        disease = pred.get("disease", "")
        # Buscar coincidencia parcial (por si hay diferencias en mayúsculas/minúsculas)
        is_compatible = any(
            disease.lower() in valid_disease.lower() or valid_disease.lower() in disease.lower()
            for valid_disease in valid_diseases
        )
        
        if is_compatible:
            filtered.append(pred)
            logger.info(f"✅ {disease} es compatible con {species_key}")
        else:
            removed.append(disease)
            logger.info(f"❌ {disease} NO es compatible con {species_key} - REMOVIDA")
    
    if removed:
        logger.warning(f"🚫 Enfermedades removidas por incompatibilidad de especie: {removed}")
    
    # Si después de filtrar no queda nada, devolver las originales con advertencia
    if not filtered:
        logger.error(f"⚠️  TODAS las predicciones fueron incompatibles con {species_key}. Devolviendo predicciones originales.")
        return predictions
    
    return filtered


def apply_symptom_boost(
    predictions: List[Dict[str, Any]],
    animal_type: str,
    symptoms: Dict[str, int]
) -> List[Dict[str, Any]]:
    """
    Aplica refuerzo (boost) a probabilidades basado en síntomas característicos.
    
    Reglas de boost:
    - Gato + estornudos + secreción nasal/ocular → +30% FVR/FCV
    - Perro + tos + disnea → +20% Dirofilariasis o Moquillo
    - Penalización si síntomas no coinciden con enfermedad
    """
    species = "gato" if animal_type.lower() in ["gato", "cat"] else "perro"
    
    boosted_predictions = []
    
    for pred in predictions:
        disease = pred.get("disease", "").lower()
        original_prob = pred.get("probability", 0.0)
        boost_factor = 0.0
        reason = []
        
        # REGLA 1: Gato + síntomas respiratorios → Boost FVR/FCV
        if species == "gato":
            has_respiratory = (
                symptoms.get("sneezing", 0) == 1 or 
                symptoms.get("nasal_discharge", 0) == 1 or
                symptoms.get("ocular_discharge", 0) == 1
            )
            
            if has_respiratory and "fvr" in disease or "fcv" in disease or "respiratorio felino" in disease:
                boost_factor += 0.30
                reason.append("síntomas respiratorios típicos de FVR/FCV")
                logger.info(f"✨ Boost +30% para {pred['disease']} (gato + respiratorio)")
        
        # REGLA 2: Perro + tos + dificultad respiratoria → Boost Dirofilariosis/Moquillo
        if species == "perro":
            has_cough_dyspnea = (
                symptoms.get("cough", 0) == 1 and 
                (symptoms.get("breathing_difficulty", 0) == 1 or symptoms.get("tachypnea", 0) == 1)
            )
            
            if has_cough_dyspnea:
                if "dirofilariosis" in disease or "dirofilaria" in disease:
                    boost_factor += 0.20
                    reason.append("tos + disnea típico de dirofilariosis")
                    logger.info(f"✨ Boost +20% para {pred['disease']} (perro + tos + disnea)")
                elif "moquillo" in disease or "distemper" in disease:
                    boost_factor += 0.20
                    reason.append("tos + disnea puede ser moquillo")
                    logger.info(f"✨ Boost +20% para {pred['disease']} (perro + tos + disnea)")
        
        # REGLA 3: Penalización por incoherencia clínica
        # Si solo hay síntomas respiratorios, penalizar enfermedades digestivas
        only_respiratory = (
            (symptoms.get("sneezing", 0) == 1 or 
             symptoms.get("cough", 0) == 1 or 
             symptoms.get("nasal_discharge", 0) == 1) and
            symptoms.get("vomiting", 0) == 0 and
            symptoms.get("diarrhea", 0) == 0
        )
        
        if only_respiratory:
            digestive_diseases = ["parvovirosis", "gastroenteritis", "panleucopenia"]
            if any(d in disease for d in digestive_diseases):
                boost_factor -= 0.15
                reason.append("sin síntomas digestivos")
                logger.info(f"⬇️ Penalización -15% para {pred['disease']} (solo respiratorio)")
        
        # Aplicar boost
        new_prob = min(1.0, max(0.0, original_prob + boost_factor))
        
        boosted_pred = pred.copy()
        boosted_pred["probability"] = new_prob
        if reason:
            boosted_pred["boost_reason"] = " | ".join(reason)
        
        boosted_predictions.append(boosted_pred)
    
    # Reordenar por probabilidad ajustada
    boosted_predictions.sort(key=lambda x: x["probability"], reverse=True)
    
    return boosted_predictions


# === ENDPOINTS ===

@router.get("/flow")
async def get_prediagnosis_flow():
    """
    Obtiene el flujo completo de prediagnóstico.
    
    Returns:
        JSON con el flujo de preguntas, mapeos y configuración
    """
    flow = load_prediagnosis_flow()
    return flow


@router.post("/process", response_model=PrediagnosisResult)
async def process_prediagnosis(answers_data: PrediagnosisAnswers):
    """
    Procesa las respuestas del prediagnóstico y genera predicciones ML.
    
    Args:
        answers_data: Respuestas del usuario al flujo de preguntas
        
    Returns:
        Predicciones de enfermedades con probabilidades y recomendaciones
    """
    # Cargar flujo
    flow = load_prediagnosis_flow()
    
    # Mapear respuestas a features ML
    try:
        ml_features = map_answers_to_ml_features(answers_data.answers, flow)
        logger.info(f"🐾 Respuestas recibidas: {answers_data.answers}")
        logger.info(f"📊 Features ML generados: {ml_features}")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error mapeando respuestas a features ML: {str(e)}"
        )
    
    # Crear request para el modelo ML
    try:
        prediction_request = DiseasePredictionRequest(
            animal_type=ml_features["animal_type"],
            age=ml_features["age"],
            size=ml_features["size"],
            life_stage=ml_features["life_stage"],
            weight_kg=ml_features["weight_kg"],
            sex=ml_features["sex"],
            vaccination_up_to_date=ml_features["vaccination_up_to_date"],
            symptoms=ml_features["symptoms"],
            top_k=3
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error creando request de predicción: {str(e)}"
        )
    
    # Obtener predictor
    predictor = get_predictor()
    if predictor.model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo ML no está cargado. Por favor, reinicia el servidor."
        )
    
    # Hacer predicción
    try:
        # Llamar al predictor con los parámetros individuales
        predictions: List[Dict[str, Any]] = predictor.predict(
            symptoms=prediction_request.symptoms,
            animal_type=prediction_request.animal_type,
            age=prediction_request.age,
            size=prediction_request.size,
            life_stage=prediction_request.life_stage,
            weight_kg=prediction_request.weight_kg,
            sex=prediction_request.sex,
            vaccination_up_to_date=prediction_request.vaccination_up_to_date,
            top_k=prediction_request.top_k
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en predicción ML: {str(e)}"
        )
    
    # Filtrar por especie
    filtered_predictions = filter_predictions_by_species(
        predictions,
        ml_features["animal_type"],
        flow
    )
    
    # Aplicar boost basado en síntomas característicos
    boosted_predictions = apply_symptom_boost(
        filtered_predictions,
        ml_features["animal_type"],
        ml_features["symptoms"]
    )
    
    # Log predicciones con boost (sin f-string anidado)
    boost_summary = [(p['disease'], f"{p['probability']:.2%}") for p in boosted_predictions[:3]]
    logger.info(f"📈 Predicciones después de boost: {boost_summary}")
    
    # Detectar síntomas presentes
    detected_symptoms = [
        symptom for symptom, value in ml_features["symptoms"].items()
        if value == 1
    ]
    
    # Verificar criterios de urgencia
    urgency_alert = check_urgency_criteria(ml_features, flow)
    
    # Generar recomendación
    if urgency_alert:
        recommendation = "🚨 " + urgency_alert
    elif boosted_predictions and boosted_predictions[0].get("confidence") == "high":
        top_disease = boosted_predictions[0].get("disease", "")
        recommendation = f"Basándome en los síntomas, es posible que sea {top_disease}. Te recomiendo consultar con un veterinario para confirmar el diagnóstico 🩺."
    else:
        recommendation = "Los síntomas pueden corresponder a varias condiciones. Te recomiendo consultar con un veterinario para una evaluación completa 💙."
    
    # Construir respuesta
    result = PrediagnosisResult(
        predictions=boosted_predictions,
        model_accuracy=0.8490,  # Tu modelo Logistic Regression
        disclaimer="Este diagnóstico es orientativo y NO reemplaza la consulta veterinaria profesional.",
        detected_symptoms=detected_symptoms,
        urgency_alert=urgency_alert,
        recommendation=recommendation
    )
    
    return result


@router.post("/next-step")
async def get_next_step(current_step_id: str, answers: Dict[str, Any]) -> FlowStep:
    """
    Obtiene el siguiente paso del flujo basado en respuestas.
    
    Args:
        current_step_id: ID del paso actual
        answers: Respuestas acumuladas hasta ahora
        
    Returns:
        Información del siguiente paso (mensajes y/o preguntas)
    """
    flow = load_prediagnosis_flow()
    flow_steps = {step["id"]: step for step in flow.get("flow", [])}
    
    if current_step_id not in flow_steps:
        raise HTTPException(
            status_code=404,
            detail=f"Paso '{current_step_id}' no encontrado en el flujo"
        )
    
    current_step = flow_steps[current_step_id]
    
    # Determinar siguiente paso usando routing_rules si existen
    next_step_id = current_step.get("default_next") or current_step.get("next")
    
    if "routing_rules" in current_step:
        # Evaluar reglas de routing (simplificado)
        for rule in current_step["routing_rules"]:
            # Aquí se debería evaluar la condición "when"
            # Por ahora, usar next_step_id default
            pass
    
    if not next_step_id or next_step_id not in flow_steps:
        # Fin del flujo
        return FlowStep(
            step_id="cierre",
            step_type="messages",
            messages=["¡Gracias! Ya tengo toda la información necesaria. 💙"]
        )
    
    next_step = flow_steps[next_step_id]
    
    return FlowStep(
        step_id=next_step["id"],
        step_type=next_step["type"],
        messages=next_step.get("messages"),
        questions=next_step.get("questions")
    )
