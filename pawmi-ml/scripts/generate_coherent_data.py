"""
Generador de datos sintéticos con coherencia clínica mejorada
"""
from pathlib import Path

import numpy as np
import pandas as pd

# Definición de enfermedades con patrones sintomáticos coherentes
DISEASE_PATTERNS = {
    "Parvovirosis": {
        "species": ["Perro"],
        "age_preference": ["cachorro/gatito", "adulto"],  # Más común en cachorros
        "core_symptoms": {
            "Vomitos": 0.95,
            "Diarrea": 0.98,
            "Diarrea_hemorragica": 0.85,
            "Fiebre": 0.90,
            "Letargo": 0.95,
            "Deshidratacion": 0.88
        },
        "secondary_symptoms": {
            "Dolor_abdominal": 0.60,
        },
        "is_chronic": 0.0,  # Aguda
        "prevalence": 0.15
    },
    
    "Dirofilariosis": {
        "species": ["Perro"],
        "age_preference": ["adulto", "maduro", "senior"],
        "core_symptoms": {
            "Tos": 0.85,
            "Disnea": 0.70,
            "Letargo": 0.80,
            "Taquipnea": 0.65
        },
        "secondary_symptoms": {
            "Soplo_cardiaco": 0.50,
            "Deshidratacion": 0.30,
        },
        "is_chronic": 0.95,  # Crónica
        "prevalence": 0.08
    },
    
    "Complejo respiratorio felino (FVR/FCV)": {
        "species": ["Gato"],
        "age_preference": ["cachorro/gatito", "adulto"],
        "core_symptoms": {
            "Estornudos": 0.95,
            "Secrecion_nasal": 0.90,
            "Secrecion_ocular": 0.85,
            "Fiebre": 0.75,
            "Ulceras_orales": 0.60
        },
        "secondary_symptoms": {
            "Letargo": 0.50,
            "Tos": 0.40,
        },
        "is_chronic": 0.0,
        "prevalence": 0.20
    },
    
    "Gastroenteritis aguda": {
        "species": ["Perro", "Gato"],
        "age_preference": ["adulto", "cachorro/gatito", "maduro"],
        "core_symptoms": {
            "Vomitos": 0.90,
            "Diarrea": 0.85,
            "Dolor_abdominal": 0.70,
            "Letargo": 0.60
        },
        "secondary_symptoms": {
            "Fiebre": 0.40,
            "Deshidratacion": 0.50,
        },
        "is_chronic": 0.05,
        "prevalence": 0.25
    },
    
    "Sarna demodécica": {
        "species": ["Perro"],
        "age_preference": ["cachorro/gatito", "adulto"],
        "core_symptoms": {
            "Alopecia": 0.95,
            "Prurito": 0.70,
        },
        "secondary_symptoms": {
            "Letargo": 0.30,
        },
        "is_chronic": 0.60,
        "prevalence": 0.08
    },
    
    "Insuficiencia renal crónica": {
        "species": ["Perro", "Gato"],
        "age_preference": ["maduro", "senior"],
        "core_symptoms": {
            "Letargo": 0.85,
            "Vomitos": 0.65,
            "Deshidratacion": 0.80,
        },
        "secondary_symptoms": {
            "Hematuria": 0.40,
            "Disuria": 0.35,
        },
        "is_chronic": 0.98,
        "prevalence": 0.12
    },
    
    "Diabetes mellitus (gato)": {
        "species": ["Gato"],
        "age_preference": ["maduro", "senior"],
        "core_symptoms": {
            "Letargo": 0.75,
            "Deshidratacion": 0.60,
        },
        "secondary_symptoms": {
            "Vomitos": 0.25,
        },
        "is_chronic": 0.99,
        "prevalence": 0.10
    },
    
    "Otitis externa": {
        "species": ["Perro", "Gato"],
        "age_preference": ["adulto", "cachorro/gatito", "maduro"],
        "core_symptoms": {
            "Otitis": 1.0,
            "Prurito": 0.75,
        },
        "secondary_symptoms": {
            "Hipersalivacion": 0.20,
        },
        "is_chronic": 0.40,
        "prevalence": 0.15
    },
    
    "Osteoartritis": {
        "species": ["Perro", "Gato"],
        "age_preference": ["maduro", "senior"],
        "core_symptoms": {
            "Cojera": 0.90,
            "Rigidez": 0.85,
            "Dolor_articular": 0.80,
        },
        "secondary_symptoms": {
            "Letargo": 0.50,
        },
        "is_chronic": 0.98,
        "prevalence": 0.18
    },
}

# Síntomas disponibles
ALL_SYMPTOMS = [
    'Vomitos', 'Diarrea', 'Diarrea_hemorragica', 'Fiebre', 'Letargo', 
    'Deshidratacion', 'Tos', 'Disnea', 'Estornudos', 'Secrecion_nasal',
    'Secrecion_ocular', 'Ulceras_orales', 'Prurito', 'Alopecia', 'Otitis',
    'Dolor_abdominal', 'Ictericia', 'Hematuria', 'Disuria', 'Cojera',
    'Rigidez', 'Dolor_articular', 'Convulsiones', 'Signos_neurologicos',
    'Hipersalivacion', 'Soplo_cardiaco', 'Taquipnea'
]

LIFE_STAGES = ['cachorro/gatito', 'adulto', 'maduro', 'senior']
SIZES = ['pequeño', 'mediano', 'grande']


def generate_patient(disease, pattern, case_id):
    """Genera un caso sintético coherente para una enfermedad"""
    
    # Especie
    species = np.random.choice(pattern["species"])
    
    # Edad y life stage
    life_stage = np.random.choice(
        pattern["age_preference"],
        p=[0.6 if i == 0 else 0.4 / (len(pattern["age_preference"]) - 1) 
           for i in range(len(pattern["age_preference"]))]
    )
    
    # Mapeo edad según life stage
    age_ranges = {
        'cachorro/gatito': (0.2, 1.5),
        'adulto': (1.5, 6.5),
        'maduro': (6.5, 10.0),
        'senior': (10.0, 16.0)
    }
    age = np.random.uniform(*age_ranges[life_stage])
    
    # Tamaño (gatos tienden a ser pequeños)
    if species == "Gato":
        size = "pequeño"
        weight = np.random.uniform(3, 7)
    else:
        size = np.random.choice(SIZES)
        weight_ranges = {'pequeño': (3, 12), 'mediano': (12, 30), 'grande': (30, 50)}
        weight = np.random.uniform(*weight_ranges[size])
    
    # BCS (condición corporal)
    bcs = np.random.choice([3, 4, 5, 6], p=[0.1, 0.3, 0.4, 0.2])
    
    # Signos vitales base
    temp_base = 38.5 if species == "Perro" else 38.7
    hr_base = 100 if species == "Perro" else 150
    rr_base = 25 if species == "Perro" else 30
    
    # Inicializar síntomas
    symptoms = {s: 0 for s in ALL_SYMPTOMS}
    
    # Síntomas principales (alta probabilidad)
    for symptom, prob in pattern["core_symptoms"].items():
        if np.random.random() < prob:
            symptoms[symptom] = 1
            
            # Ajustar signos vitales según síntomas
            if symptom == "Fiebre":
                temp_base += np.random.uniform(1.0, 2.5)
            if symptom in ["Disnea", "Taquipnea"]:
                rr_base *= np.random.uniform(1.3, 1.8)
    
    # Síntomas secundarios (menor probabilidad)
    for symptom, prob in pattern.get("secondary_symptoms", {}).items():
        if np.random.random() < prob:
            symptoms[symptom] = 1
    
    # Cronicidad
    is_chronic = 1 if np.random.random() < pattern["is_chronic"] else 0
    
    # Estacionalidad (bajo para la mayoría)
    is_seasonal = 1 if np.random.random() < 0.1 else 0
    
    # Signos objetivos
    fever_objective = 1 if temp_base > 39.5 else 0
    tachycardia = 1 if hr_base > 140 else 0
    
    # Vacunación (afecta probabilidad)
    vaccination = np.random.choice([0, 1], p=[0.2, 0.8])
    
    return {
        "Case_ID": case_id,
        "Animal_Type": species,
        "Size": size,
        "Age": round(age, 1),
        "Life_Stage": life_stage,
        "Weight": round(weight, 1),
        "BCS": bcs,
        "Body_Temperature": round(temp_base, 1),
        "Heart_Rate": int(hr_base),
        "Respiratory_Rate": int(rr_base),
        **symptoms,
        "Fever_Objective": fever_objective,
        "Tachycardia": tachycardia,
        "Is_Chronic": is_chronic,
        "Is_Seasonal": is_seasonal,
        "Prevalence": pattern["prevalence"],
        "Vaccination_Updated": vaccination,
        "Disease": disease
    }


def generate_coherent_dataset(n_cases_per_disease=500, output_path=None):
    """
    Genera dataset completo con casos coherentes
    
    Args:
        n_cases_per_disease: Número de casos por enfermedad
        output_path: Ruta de salida (opcional)
    """
    all_cases = []
    case_id = 1
    
    print("🔬 Generando dataset con coherencia clínica...")
    
    for disease, pattern in DISEASE_PATTERNS.items():
        print(f"   Generando {n_cases_per_disease} casos de: {disease}")
        
        for _ in range(n_cases_per_disease):
            case = generate_patient(disease, pattern, f"SYN_{case_id:06d}")
            all_cases.append(case)
            case_id += 1
    
    df = pd.DataFrame(all_cases)
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Estadísticas
    print(f"\n✅ Dataset generado:")
    print(f"   Total casos: {len(df)}")
    print(f"   Enfermedades: {df['Disease'].nunique()}")
    print(f"\n📊 Distribución de enfermedades:")
    print(df['Disease'].value_counts())
    
    # Guardar
    if output_path is None:
        output_path = Path(__file__).parent.parent / "data" / "synthetic" / "coherent_dataset.csv"
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"\n💾 Guardado en: {output_path}")
    
    return df


if __name__ == "__main__":
    # Generar 500 casos por enfermedad = 4500 casos totales
    df = generate_coherent_dataset(n_cases_per_disease=500)
    
    print("\n✨ Listo para reentrenar el modelo con datos coherentes!")
    print("   Ejecuta: python scripts/train_model.py")
