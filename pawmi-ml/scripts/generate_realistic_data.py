"""
Generador de datos sintéticos REALISTAS con ruido y variabilidad
Añade casos ambiguos, síntomas ausentes y falsos positivos para evitar overfitting
"""
import random
from pathlib import Path

import numpy as np
import pandas as pd

# Razas comunes por especie y tamaño
DOG_BREEDS = {
    "pequeño": [
        "Chihuahua", "Yorkshire Terrier", "Pomerania", "Maltés", "Pug",
        "Shih Tzu", "Boston Terrier", "French Bulldog", "Dachshund", "Beagle"
    ],
    "mediano": [
        "Cocker Spaniel", "Border Collie", "Bulldog", "Boxer", "Pit Bull",
        "Australian Shepherd", "Springer Spaniel", "Schnauzer", "Shetland", "Corgi"
    ],
    "grande": [
        "Labrador", "Golden Retriever", "Pastor Alemán", "Rottweiler", "Doberman",
        "Gran Danés", "San Bernardo", "Husky", "Akita", "Mastín"
    ]
}

CAT_BREEDS = {
    "pequeño": [
        "Siamés", "Devon Rex", "Singapura", "Cornish Rex", "Munchkin",
        "American Curl", "Abisinio", "Oriental", "Burmés", "Tonkinés"
    ],
    "mediano": [
        "Común Europeo", "Persa", "British Shorthair", "Scottish Fold", "Ragdoll",
        "Bengalí", "Angora", "Siberiano", "Bosque de Noruega", "Exótico"
    ],
    "grande": [
        "Maine Coon", "Savannah", "Ragdoll", "Siberiano", "Bosque de Noruega"
    ]
}

# CONFIGURACIÓN DE REALISMO
REALISM_CONFIG = {
    'symptom_noise': 0.15,  # 15% probabilidad de síntomas aleatorios (falsos positivos)
    'missing_symptom': 0.20,  # 20% probabilidad de que falte un síntoma esperado
    'vital_variance': 0.15,  # 15% varianza en signos vitales
    'ambiguous_cases': 0.10,  # 10% casos con síntomas superpuestos
}

# Patrones de enfermedades (mismo que antes pero con variabilidad)
DISEASE_PATTERNS = {
    "Parvovirosis": {
        "species": ["Perro"],
        "age_range": (0.1, 2.0),
        "size_preference": ["pequeño", "mediano"],
        "breed_susceptibility": {
            "Rottweiler": 1.5, "Doberman": 1.4, "Pit Bull": 1.3,
            "Labrador": 1.2, "Pastor Alemán": 1.2
        },
        "core_symptoms": {
            "vomitos": 0.95,
            "diarrea": 0.98,
            "diarrea_hemorragica": 0.85,
            "fiebre": 0.90,
            "letargo": 0.95,
            "deshidratacion": 0.88,
            "dolor_abdominal": 0.70,
        },
        "secondary_symptoms": {
            "hipersalivacion": 0.30,
        },
        "vitals": {
            "temperature_range": (39.5, 41.0),
            "heart_rate_range": (120, 160),
            "respiratory_rate_range": (30, 50),
            "bcs_range": (2, 4),
        },
        "is_chronic": 0.0,
        "is_seasonal": 0.0,
        "prevalence": 0.12
    },
    
    "Dirofilariosis": {
        "species": ["Perro"],
        "age_range": (3.0, 12.0),
        "size_preference": ["mediano", "grande"],
        "breed_susceptibility": {
            "Labrador": 1.3, "Golden Retriever": 1.3, "Pastor Alemán": 1.2,
            "Boxer": 1.2, "Rottweiler": 1.1
        },
        "core_symptoms": {
            "tos": 0.85,
            "disnea": 0.75,
            "letargo": 0.80,
            "taquipnea": 0.70,
        },
        "secondary_symptoms": {
            "soplo_cardiaco": 0.55,
            "deshidratacion": 0.35,
            "diarrea": 0.15,
            "vomitos": 0.20,
        },
        "vitals": {
            "temperature_range": (37.8, 39.0),
            "heart_rate_range": (90, 120),
            "respiratory_rate_range": (25, 40),
            "bcs_range": (4, 6),
        },
        "is_chronic": 0.95,
        "is_seasonal": 0.0,
        "prevalence": 0.08
    },
    
    "Gastroenteritis aguda": {
        "species": ["Perro", "Gato"],
        "age_range": (0.5, 10.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {},
        "core_symptoms": {
            "vomitos": 0.90,
            "diarrea": 0.95,
            "letargo": 0.70,
            "deshidratacion": 0.65,
            "dolor_abdominal": 0.60,
        },
        "secondary_symptoms": {
            "fiebre": 0.40,  # Puede tener fiebre pero NO diarrea hemorrágica
            "hipersalivacion": 0.25,
        },
        "vitals": {
            "temperature_range": (37.5, 39.5),
            "heart_rate_range": (90, 140),
            "respiratory_rate_range": (22, 38),
            "bcs_range": (3, 7),
        },
        "is_chronic": 0.05,
        "is_seasonal": 0.0,
        "prevalence": 0.20
    },
    
    "Complejo respiratorio felino (FVR/FCV)": {
        "species": ["Gato"],
        "age_range": (0.2, 8.0),
        "size_preference": ["pequeño", "mediano"],
        "breed_susceptibility": {
            "Común Europeo": 1.2, "Persa": 1.3, "Siamés": 1.1
        },
        "core_symptoms": {
            "estornudos": 0.95,
            "secrecion_nasal": 0.90,
            "secrecion_ocular": 0.85,
            "fiebre": 0.80,
            "letargo": 0.75,
        },
        "secondary_symptoms": {
            "ulceras_orales": 0.50,
            "tos": 0.30,
            "vomitos": 0.20,
            "deshidratacion": 0.40,
        },
        "vitals": {
            "temperature_range": (39.0, 40.5),
            "heart_rate_range": (160, 220),
            "respiratory_rate_range": (30, 50),
            "bcs_range": (3, 6),
        },
        "is_chronic": 0.10,
        "is_seasonal": 0.20,
        "prevalence": 0.15
    },
    
    "Sarna demodécica": {
        "species": ["Perro"],
        "age_range": (0.2, 3.0),
        "size_preference": ["pequeño", "mediano"],
        "breed_susceptibility": {
            "Pit Bull": 1.6, "Shar Pei": 1.7, "Bulldog": 1.5,
            "Doberman": 1.4, "Boxer": 1.3
        },
        "core_symptoms": {
            "alopecia": 0.98,
            "prurito": 0.70,
        },
        "secondary_symptoms": {
            "letargo": 0.25,
        },
        "vitals": {
            "temperature_range": (37.8, 39.0),
            "heart_rate_range": (80, 120),
            "respiratory_rate_range": (20, 32),
            "bcs_range": (3, 6),
        },
        "is_chronic": 0.40,
        "is_seasonal": 0.0,
        "prevalence": 0.08
    },
    
    "Insuficiencia renal crónica": {
        "species": ["Perro", "Gato"],
        "age_range": (7.0, 18.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {
            "Persa": 1.5, "Abisinio": 1.4, "Siamés": 1.3,  # Gatos
            "Cocker Spaniel": 1.3, "Schnauzer": 1.2  # Perros
        },
        "core_symptoms": {
            "letargo": 0.85,
            "vomitos": 0.70,
            "deshidratacion": 0.85,
        },
        "secondary_symptoms": {
            "diarrea": 0.40,
            "hematuria": 0.45,
            "disuria": 0.50,
        },
        "vitals": {
            "temperature_range": (37.5, 38.5),
            "heart_rate_range": (70, 110),
            "respiratory_rate_range": (18, 28),
            "bcs_range": (2, 5),
        },
        "is_chronic": 0.98,
        "is_seasonal": 0.0,
        "prevalence": 0.15
    },
    
    "Diabetes mellitus": {
        "species": ["Perro", "Gato"],
        "age_range": (5.0, 15.0),
        "size_preference": ["mediano", "grande"],
        "breed_susceptibility": {
            "Burmés": 1.6, "Siamés": 1.3,
            "Schnauzer": 1.4, "Pug": 1.3, "Beagle": 1.2
        },
        "core_symptoms": {
            "letargo": 0.80,
            "deshidratacion": 0.70,
        },
        "secondary_symptoms": {
            "vomitos": 0.30,
            "diarrea": 0.25,
            "hematuria": 0.20,
        },
        "vitals": {
            "temperature_range": (37.5, 39.0),
            "heart_rate_range": (70, 120),
            "respiratory_rate_range": (18, 30),
            "bcs_range": (3, 8),
        },
        "is_chronic": 0.98,
        "is_seasonal": 0.0,
        "prevalence": 0.10
    },
    
    "Artritis": {
        "species": ["Perro", "Gato"],
        "age_range": (7.0, 18.0),
        "size_preference": ["mediano", "grande"],
        "breed_susceptibility": {
            "Labrador": 1.5, "Golden Retriever": 1.5, "Pastor Alemán": 1.4,
            "Rottweiler": 1.3, "Gran Danés": 1.4
        },
        "core_symptoms": {
            "cojera": 0.90,
            "dolor_articular": 0.85,
            "rigidez": 0.80,
            "letargo": 0.70,
        },
        "secondary_symptoms": {},
        "vitals": {
            "temperature_range": (37.8, 39.0),
            "heart_rate_range": (70, 100),
            "respiratory_rate_range": (18, 28),
            "bcs_range": (5, 8),
        },
        "is_chronic": 0.98,
        "is_seasonal": 0.05,
        "prevalence": 0.20
    },
    
    "Otitis externa": {
        "species": ["Perro", "Gato"],
        "age_range": (0.5, 12.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {
            "Cocker Spaniel": 1.8, "Basset Hound": 1.7, "Labrador": 1.4,
            "Golden Retriever": 1.3, "Beagle": 1.3, "Persa": 1.3
        },
        "core_symptoms": {
            "otitis": 1.0,
            "prurito": 0.70,
        },
        "secondary_symptoms": {
            "letargo": 0.20,
            "hipersalivacion": 0.15,
        },
        "vitals": {
            "temperature_range": (38.0, 39.5),
            "heart_rate_range": (80, 130),
            "respiratory_rate_range": (20, 32),
            "bcs_range": (4, 7),
        },
        "is_chronic": 0.30,
        "is_seasonal": 0.10,
        "prevalence": 0.22
    },
    
    "Alergias cutáneas": {
        "species": ["Perro", "Gato"],
        "age_range": (1.0, 10.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {
            "Bulldog": 1.7, "French Bulldog": 1.6, "Boxer": 1.5,
            "Labrador": 1.4, "Golden Retriever": 1.3, "West Highland": 1.6
        },
        "core_symptoms": {
            "prurito": 0.95,
            "alopecia": 0.60,
        },
        "secondary_symptoms": {
            "otitis": 0.40,
            "letargo": 0.20,
        },
        "vitals": {
            "temperature_range": (37.8, 39.0),
            "heart_rate_range": (80, 120),
            "respiratory_rate_range": (20, 30),
            "bcs_range": (4, 7),
        },
        "is_chronic": 0.85,
        "is_seasonal": 0.60,
        "prevalence": 0.18
    },
}

ALL_SYMPTOMS = [
    'vomitos', 'diarrea', 'diarrea_hemorragica', 'fiebre', 'letargo',
    'deshidratacion', 'tos', 'disnea', 'estornudos', 'secrecion_nasal',
    'secrecion_ocular', 'ulceras_orales', 'prurito', 'alopecia', 'otitis',
    'dolor_abdominal', 'ictericia', 'hematuria', 'disuria', 'cojera',
    'rigidez', 'dolor_articular', 'convulsiones', 'signos_neurologicos',
    'hipersalivacion', 'soplo_cardiaco', 'taquipnea'
]


def generate_patient_realistic(disease_name: str, pattern: dict) -> dict:
    """Genera un paciente con ruido y variabilidad realista"""
    
    # Seleccionar especie
    species = random.choice(pattern['species'])
    animal_type = "Perro" if species == "Perro" else "Gato"
    
    # Edad con más variabilidad
    min_age, max_age = pattern['age_range']
    age = round(random.uniform(min_age, max_age), 1)
    
    # Life stage
    if age < 1:
        life_stage = "cachorro" if animal_type == "Perro" else "gatito"
    elif age < 7:
        life_stage = "adulto"
    else:
        life_stage = "senior"
    
    # Tamaño y raza
    size = random.choice(pattern['size_preference'])
    breeds = DOG_BREEDS[size] if animal_type == "Perro" else CAT_BREEDS[size]
    
    # Preferir razas susceptibles si existen
    if pattern['breed_susceptibility'] and random.random() < 0.4:
        susceptible_breeds = [b for b in pattern['breed_susceptibility'].keys() if b in breeds]
        if susceptible_breeds:
            weights = [pattern['breed_susceptibility'][b] for b in susceptible_breeds]
            breed = random.choices(susceptible_breeds, weights=weights)[0]
        else:
            breed = random.choice(breeds)
    else:
        breed = random.choice(breeds)
    
    # Peso según tamaño y especie
    if animal_type == "Perro":
        weight_ranges = {"pequeño": (2, 10), "mediano": (10, 25), "grande": (25, 70)}
    else:
        weight_ranges = {"pequeño": (2, 4), "mediano": (4, 6), "grande": (6, 10)}
    min_w, max_w = weight_ranges[size]
    weight = round(random.uniform(min_w, max_w), 1)
    
    # Signos vitales CON VARIANZA
    vitals = pattern['vitals']
    variance_factor = REALISM_CONFIG['vital_variance']
    
    temp_min, temp_max = vitals['temperature_range']
    temp_range = temp_max - temp_min
    body_temperature = round(random.uniform(
        temp_min - temp_range * variance_factor,
        temp_max + temp_range * variance_factor
    ), 1)
    
    hr_min, hr_max = vitals['heart_rate_range']
    hr_range = hr_max - hr_min
    heart_rate = int(random.uniform(
        hr_min - hr_range * variance_factor,
        hr_max + hr_range * variance_factor
    ))
    
    rr_min, rr_max = vitals['respiratory_rate_range']
    rr_range = rr_max - rr_min
    respiratory_rate = int(random.uniform(
        rr_min - rr_range * variance_factor,
        rr_max + rr_range * variance_factor
    ))
    
    bcs_min, bcs_max = vitals['bcs_range']
    bcs = random.randint(max(1, bcs_min - 1), min(9, bcs_max + 1))
    
    # Indicadores objetivos
    fever_objective = 1 if body_temperature > 39.2 else 0
    
    if animal_type == "Perro":
        tachycardia = 1 if heart_rate > 140 else 0
    else:
        tachycardia = 1 if heart_rate > 200 else 0
    
    # GENERAR SÍNTOMAS CON REALISMO
    symptoms = {}
    
    # 1. Síntomas core (con probabilidad de faltar algunos)
    missing_prob = REALISM_CONFIG['missing_symptom']
    for symptom, probability in pattern['core_symptoms'].items():
        # Reducir probabilidad si es caso ambiguo
        if random.random() < REALISM_CONFIG['ambiguous_cases']:
            probability *= 0.7  # Reducir probabilidad en casos ambiguos
        
        # Aplicar probabilidad de síntoma faltante
        if random.random() < missing_prob:
            symptoms[symptom] = 0
        else:
            symptoms[symptom] = 1 if random.random() < probability else 0
    
    # 2. Síntomas secundarios
    for symptom, probability in pattern['secondary_symptoms'].items():
        symptoms[symptom] = 1 if random.random() < probability else 0
    
    # 3. RUIDO: Añadir síntomas aleatorios (falsos positivos)
    noise_prob = REALISM_CONFIG['symptom_noise']
    for symptom in ALL_SYMPTOMS:
        if symptom not in symptoms:
            # Pequeña probabilidad de síntoma no relacionado
            symptoms[symptom] = 1 if random.random() < noise_prob * 0.5 else 0
    
    # 4. REGLA IMPORTANTE: Si tiene diarrea_hemorragica, debe tener diarrea
    if symptoms.get('diarrea_hemorragica', 0) == 1:
        symptoms['diarrea'] = 1
    
    # 5. Para Gastroenteritis: NUNCA diarrea hemorrágica (diferenciador clave)
    if disease_name == "Gastroenteritis aguda":
        symptoms['diarrea_hemorragica'] = 0
    
    # 6. Para Parvovirosis: Alta probabilidad de diarrea hemorrágica
    if disease_name == "Parvovirosis" and symptoms.get('diarrea', 0) == 1:
        if random.random() < 0.85:  # 85% de casos con diarrea tienen hemorragia
            symptoms['diarrea_hemorragica'] = 1
    
    # Metadata
    is_chronic = 1 if random.random() < pattern['is_chronic'] else 0
    is_seasonal = 1 if random.random() < pattern['is_seasonal'] else 0
    prevalence = round(pattern['prevalence'] + random.uniform(-0.02, 0.02), 2)
    vaccination_updated = random.choice([0, 1])
    
    # Construir paciente
    patient = {
        'animal_type': animal_type,
        'breed': breed,
        'size': size,
        'age': age,
        'life_stage': life_stage,
        'weight': weight,
        'body_temperature': body_temperature,
        'heart_rate': heart_rate,
        'respiratory_rate': respiratory_rate,
        'bcs': bcs,
        'fever_objective': fever_objective,
        'tachycardia': tachycardia,
        'is_chronic': is_chronic,
        'is_seasonal': is_seasonal,
        'prevalence': prevalence,
        'vaccination_updated': vaccination_updated,
        'disease': disease_name
    }
    
    # Añadir síntomas
    patient.update(symptoms)
    
    return patient


def main():
    print("=" * 80)
    print("🐾 GENERADOR DE DATOS REALISTAS CON RUIDO Y VARIABILIDAD")
    print("=" * 80)
    
    print(f"\n📊 Configuración de realismo:")
    print(f"   • Ruido en síntomas: {REALISM_CONFIG['symptom_noise']*100:.0f}%")
    print(f"   • Síntomas faltantes: {REALISM_CONFIG['missing_symptom']*100:.0f}%")
    print(f"   • Varianza en signos vitales: {REALISM_CONFIG['vital_variance']*100:.0f}%")
    print(f"   • Casos ambiguos: {REALISM_CONFIG['ambiguous_cases']*100:.0f}%")
    
    # Generar casos por enfermedad
    samples_per_disease = 500
    all_patients = []
    
    print(f"\n🏥 Generando {samples_per_disease} casos por enfermedad...")
    
    for disease_name, pattern in DISEASE_PATTERNS.items():
        print(f"   • {disease_name}...", end=" ")
        for _ in range(samples_per_disease):
            patient = generate_patient_realistic(disease_name, pattern)
            all_patients.append(patient)
        print("✓")
    
    # Crear DataFrame
    df = pd.DataFrame(all_patients)
    
    print(f"\n✅ Dataset generado:")
    print(f"   • Total de casos: {len(df):,}")
    print(f"   • Enfermedades: {df['disease'].nunique()}")
    print(f"   • Features: {df.shape[1]}")
    
    # Verificar balance
    print(f"\n📊 Distribución de enfermedades:")
    for disease, count in df['disease'].value_counts().sort_index().items():
        print(f"   • {disease}: {count}")
    
    # Verificar diferenciadores clave
    print(f"\n🔍 Verificación de diferenciadores clave:")
    parvo_df = df[df['disease'] == 'Parvovirosis']
    gastro_df = df[df['disease'] == 'Gastroenteritis aguda']
    
    print(f"\n   Parvovirosis:")
    print(f"     - Diarrea hemorrágica: {parvo_df['diarrea_hemorragica'].mean()*100:.1f}%")
    print(f"     - Vómitos: {parvo_df['vomitos'].mean()*100:.1f}%")
    print(f"     - Fiebre: {parvo_df['fiebre'].mean()*100:.1f}%")
    
    print(f"\n   Gastroenteritis:")
    print(f"     - Diarrea hemorrágica: {gastro_df['diarrea_hemorragica'].mean()*100:.1f}%")
    print(f"     - Vómitos: {gastro_df['vomitos'].mean()*100:.1f}%")
    print(f"     - Fiebre: {gastro_df['fiebre'].mean()*100:.1f}%")
    
    # Guardar
    output_path = Path(__file__).parent.parent / 'data' / 'synthetic' / 'realistic_dataset.csv'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    
    print(f"\n💾 Dataset guardado en: {output_path}")
    print(f"   Tamaño del archivo: {output_path.stat().st_size / 1024:.1f} KB")
    
    print(f"\n🎯 Dataset listo para entrenamiento con realismo!")
    print("   Este dataset tiene casos ambiguos, síntomas faltantes y ruido")
    print("   Accuracy esperado: 85-95% (más realista que 100%)")


if __name__ == "__main__":
    main()
