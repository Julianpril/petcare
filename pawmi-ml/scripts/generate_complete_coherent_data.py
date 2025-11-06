"""
Generador de datos sintéticos COMPLETOS con coherencia clínica total
Considera: especie, raza, edad, síntomas y patrones de enfermedad realistas
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

# Patrones de enfermedades con coherencia clínica completa
DISEASE_PATTERNS = {
    "Parvovirosis": {
        "species": ["Perro"],
        "age_range": (0.1, 2.0),  # Principalmente cachorros
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
            "bcs_range": (2, 4),  # Bajo peso
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
        "prevalence": 0.06
    },
    
    "Complejo respiratorio felino (FVR/FCV)": {
        "species": ["Gato"],
        "age_range": (0.1, 5.0),
        "size_preference": ["pequeño", "mediano"],
        "breed_susceptibility": {
            "Persa": 1.4, "British Shorthair": 1.2, "Común Europeo": 1.1,
            "Exótico": 1.3, "Siamés": 1.0
        },
        "core_symptoms": {
            "estornudos": 0.95,
            "secrecion_nasal": 0.90,
            "secrecion_ocular": 0.85,
            "fiebre": 0.80,
            "ulceras_orales": 0.60,
        },
        "secondary_symptoms": {
            "letargo": 0.55,
            "tos": 0.40,
            "deshidratacion": 0.30,
        },
        "vitals": {
            "temperature_range": (39.5, 40.5),
            "heart_rate_range": (160, 220),
            "respiratory_rate_range": (30, 50),
            "bcs_range": (4, 6),
        },
        "is_chronic": 0.0,
        "is_seasonal": 0.15,
        "prevalence": 0.18
    },
    
    "Gastroenteritis aguda": {
        "species": ["Perro", "Gato"],
        "age_range": (0.5, 10.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {},  # Todas las razas igual
        "core_symptoms": {
            "vomitos": 0.90,
            "diarrea": 0.85,
            "dolor_abdominal": 0.70,
            "letargo": 0.65,
        },
        "secondary_symptoms": {
            "fiebre": 0.40,
            "deshidratacion": 0.50,
            "diarrea_hemorragica": 0.10,  # Rara vez con sangre
        },
        "vitals": {
            "temperature_range": (38.0, 39.5),
            "heart_rate_range": (80, 140),
            "respiratory_rate_range": (20, 35),
            "bcs_range": (4, 7),
        },
        "is_chronic": 0.05,
        "is_seasonal": 0.0,
        "prevalence": 0.25
    },
    
    "Sarna demodécica": {
        "species": ["Perro"],
        "age_range": (0.2, 3.0),
        "size_preference": ["pequeño", "mediano"],
        "breed_susceptibility": {
            "Pit Bull": 1.6, "Bulldog": 1.5, "Boxer": 1.4,
            "Doberman": 1.3, "Rottweiler": 1.2, "Shih Tzu": 1.3
        },
        "core_symptoms": {
            "alopecia": 0.95,
            "prurito": 0.65,
        },
        "secondary_symptoms": {
            "letargo": 0.25,
        },
        "vitals": {
            "temperature_range": (38.0, 39.0),
            "heart_rate_range": (80, 120),
            "respiratory_rate_range": (20, 30),
            "bcs_range": (4, 6),
        },
        "is_chronic": 0.70,
        "is_seasonal": 0.0,
        "prevalence": 0.08
    },
    
    "Insuficiencia renal crónica": {
        "species": ["Perro", "Gato"],
        "age_range": (7.0, 18.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {
            "Persa": 1.5, "Siamés": 1.4, "Abisinio": 1.3,  # Gatos
            "Cocker Spaniel": 1.3, "Schnauzer": 1.2  # Perros
        },
        "core_symptoms": {
            "letargo": 0.90,
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
            "bcs_range": (2, 5),  # Bajo peso
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
            "Burmés": 1.6, "Siamés": 1.3,  # Gatos
            "Schnauzer": 1.4, "Pug": 1.3, "Beagle": 1.2  # Perros
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
            "bcs_range": (3, 8),  # Variable
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
            "bcs_range": (5, 8),  # Sobrepeso frecuente
        },
        "is_chronic": 0.98,
        "is_seasonal": 0.05,  # Empeora con frío
        "prevalence": 0.20
    },
    
    "Otitis externa": {
        "species": ["Perro", "Gato"],
        "age_range": (0.5, 12.0),
        "size_preference": ["pequeño", "mediano", "grande"],
        "breed_susceptibility": {
            "Cocker Spaniel": 1.8, "Basset Hound": 1.7, "Labrador": 1.4,
            "Golden Retriever": 1.3, "Beagle": 1.3, "Persa": 1.3  # Gatos
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
        "is_seasonal": 0.60,  # Alergias estacionales comunes
        "prevalence": 0.18
    },
}

# Todos los síntomas posibles (features completas)
ALL_SYMPTOMS = [
    'vomitos', 'diarrea', 'diarrea_hemorragica', 'fiebre', 'letargo',
    'deshidratacion', 'tos', 'disnea', 'estornudos', 'secrecion_nasal',
    'secrecion_ocular', 'ulceras_orales', 'prurito', 'alopecia', 'otitis',
    'dolor_abdominal', 'ictericia', 'hematuria', 'disuria', 'cojera',
    'rigidez', 'dolor_articular', 'convulsiones', 'signos_neurologicos',
    'hipersalivacion', 'soplo_cardiaco', 'taquipnea'
]


def generate_patient(disease_name: str, pattern: dict) -> dict:
    """Genera un paciente coherente con la enfermedad"""
    
    # Seleccionar especie
    species = random.choice(pattern['species'])
    animal_type = "Perro" if species == "Perro" else "Gato"
    
    # Edad coherente con la enfermedad
    min_age, max_age = pattern['age_range']
    age = round(random.uniform(min_age, max_age), 1)
    
    # Life stage basado en edad
    if age < 1:
        life_stage = "cachorro/gatito"
    elif age < 3:
        life_stage = "adulto"
    elif age < 10:
        life_stage = "maduro"
    else:
        life_stage = "senior"
    
    # Tamaño
    size = random.choice(pattern['size_preference'])
    
    # Peso coherente con especie y tamaño
    if animal_type == "Gato":
        weight_ranges = {"pequeño": (2.5, 4.5), "mediano": (4.0, 6.5), "grande": (6.0, 10.0)}
    else:
        weight_ranges = {"pequeño": (3.0, 12.0), "mediano": (12.0, 30.0), "grande": (28.0, 70.0)}
    
    min_w, max_w = weight_ranges[size]
    weight = round(random.uniform(min_w, max_w), 1)
    
    # Raza con susceptibilidad
    breeds = DOG_BREEDS[size] if animal_type == "Perro" else CAT_BREEDS[size]
    breed_susceptibility = pattern.get('breed_susceptibility', {})
    
    # Elegir raza (más probable si tiene susceptibilidad)
    if breed_susceptibility and random.random() < 0.7:
        susceptible_breeds = [b for b in breeds if b in breed_susceptibility]
        if susceptible_breeds:
            weights = [breed_susceptibility.get(b, 1.0) for b in susceptible_breeds]
            breed = random.choices(susceptible_breeds, weights=weights)[0]
        else:
            breed = random.choice(breeds)
    else:
        breed = random.choice(breeds)
    
    # Vitals
    vitals = pattern['vitals']
    temp_min, temp_max = vitals['temperature_range']
    hr_min, hr_max = vitals['heart_rate_range']
    rr_min, rr_max = vitals['respiratory_rate_range']
    bcs_min, bcs_max = vitals['bcs_range']
    
    body_temperature = round(random.uniform(temp_min, temp_max), 1)
    heart_rate = random.randint(hr_min, hr_max)
    respiratory_rate = random.randint(rr_min, rr_max)
    bcs = random.randint(bcs_min, bcs_max)
    
    # Síntomas - CORE symptoms (alta probabilidad)
    symptoms = {}
    for symptom_name in ALL_SYMPTOMS:
        if symptom_name in pattern['core_symptoms']:
            prob = pattern['core_symptoms'][symptom_name]
            symptoms[symptom_name] = 1 if random.random() < prob else 0
        elif symptom_name in pattern['secondary_symptoms']:
            prob = pattern['secondary_symptoms'][symptom_name]
            symptoms[symptom_name] = 1 if random.random() < prob else 0
        else:
            # Ruido: 2-5% de síntomas aleatorios
            symptoms[symptom_name] = 1 if random.random() < 0.03 else 0
    
    # Fiebre objetiva si temperatura alta
    fever_objective = 1 if body_temperature > 39.2 else 0
    
    # Taquicardia si heart rate alto
    max_hr_normal = 140 if animal_type == "Perro" else 200
    tachycardia = 1 if heart_rate > max_hr_normal else 0
    
    # Is_chronic e Is_seasonal
    is_chronic = 1 if random.random() < pattern['is_chronic'] else 0
    is_seasonal = 1 if random.random() < pattern['is_seasonal'] else 0
    
    # Vaccination (aleatorio pero más común en enfermedades prevenibles)
    if disease_name in ["Parvovirosis", "Complejo respiratorio felino (FVR/FCV)"]:
        vaccination_updated = 1 if random.random() < 0.3 else 0  # Más común en no vacunados
    else:
        vaccination_updated = 1 if random.random() < 0.7 else 0
    
    patient = {
        'animal_type': animal_type,
        'breed': breed,
        'size': size,
        'age': age,
        'life_stage': life_stage,
        'weight': weight,
        'bcs': bcs,
        'body_temperature': body_temperature,
        'heart_rate': heart_rate,
        'respiratory_rate': respiratory_rate,
        **symptoms,
        'fever_objective': fever_objective,
        'tachycardia': tachycardia,
        'is_chronic': is_chronic,
        'is_seasonal': is_seasonal,
        'prevalence': pattern['prevalence'],
        'vaccination_updated': vaccination_updated,
        'disease': disease_name
    }
    
    return patient


def generate_coherent_dataset(n_samples_per_disease: int = 500) -> pd.DataFrame:
    """Genera dataset completo con coherencia clínica"""
    
    all_patients = []
    
    for disease_name, pattern in DISEASE_PATTERNS.items():
        print(f"Generando {n_samples_per_disease} casos de {disease_name}...")
        
        for _ in range(n_samples_per_disease):
            patient = generate_patient(disease_name, pattern)
            all_patients.append(patient)
    
    df = pd.DataFrame(all_patients)
    
    # Ordenar columnas para el modelo
    feature_order = [
        'animal_type', 'breed', 'size', 'age', 'life_stage', 'weight', 'bcs',
        'body_temperature', 'heart_rate', 'respiratory_rate',
        'vomitos', 'diarrea', 'diarrea_hemorragica', 'fiebre', 'letargo',
        'deshidratacion', 'tos', 'disnea', 'estornudos', 'secrecion_nasal',
        'secrecion_ocular', 'ulceras_orales', 'prurito', 'alopecia', 'otitis',
        'dolor_abdominal', 'ictericia', 'hematuria', 'disuria', 'cojera',
        'rigidez', 'dolor_articular', 'convulsiones', 'signos_neurologicos',
        'hipersalivacion', 'soplo_cardiaco', 'taquipnea',
        'fever_objective', 'tachycardia', 'is_chronic', 'is_seasonal',
        'prevalence', 'vaccination_updated', 'disease'
    ]
    
    df = df[feature_order]
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df


if __name__ == "__main__":
    print("🏥 Generando dataset coherente completo...")
    print("=" * 70)
    
    # Generar 500 casos por enfermedad = 5000 total
    df = generate_coherent_dataset(n_samples_per_disease=500)
    
    print(f"\n✅ Dataset generado: {len(df)} casos")
    print(f"📊 Enfermedades: {df['disease'].nunique()}")
    print(f"🔢 Features: {len(df.columns) - 1}")  # -1 por la columna disease
    
    # Distribución por enfermedad
    print("\n📈 Distribución por enfermedad:")
    print(df['disease'].value_counts().sort_index())
    
    # Distribución por especie
    print("\n🐾 Distribución por especie:")
    print(df['animal_type'].value_counts())
    
    # Preview
    print("\n🔍 Preview del dataset:")
    print(df.head())
    
    # Verificar coherencia de algunos casos
    print("\n✅ Verificación de coherencia:")
    parvo_cases = df[df['disease'] == 'Parvovirosis'].head(1)
    if not parvo_cases.empty:
        case = parvo_cases.iloc[0]
        print(f"\nEjemplo Parvovirosis:")
        print(f"  - Especie: {case['animal_type']}, Raza: {case['breed']}")
        print(f"  - Edad: {case['age']} años ({case['life_stage']})")
        print(f"  - Vómitos: {case['vomitos']}, Diarrea hemorrágica: {case['diarrea_hemorragica']}")
        print(f"  - Fiebre: {case['fiebre']}, Letargo: {case['letargo']}")
        print(f"  - Temperatura: {case['body_temperature']}°C")
    
    # Guardar
    output_dir = Path(__file__).parent.parent / "data" / "synthetic"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "coherent_complete_dataset.csv"
    
    df.to_csv(output_file, index=False)
    print(f"\n💾 Dataset guardado en: {output_file}")
    print(f"📏 Tamaño del archivo: {output_file.stat().st_size / 1024:.1f} KB")
