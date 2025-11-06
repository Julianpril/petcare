import random
from pathlib import Path

import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

N = 1000

animal_types = ['Dog', 'Cat']
diseases_dog = ['Dermatitis', 'Otitis', 'Gastroenteritis', 'Parvovirus', 'Kennel Cough', 'Arthritis', 'Heartworm']
diseases_cat = ['Dermatitis', 'Upper Respiratory Infection', 'Gastroenteritis', 'Feline Leukemia', 'Feline Panleukopenia', 'Arthritis']

rows = []

for i in range(N):
    animal = random.choices(animal_types, weights=[0.6, 0.4])[0]
    if animal == 'Dog':
        age = round(np.random.uniform(0.1, 15), 1)  # years
        weight = round(np.random.uniform(2.0, 45.0), 1)
        heart_rate = int(np.random.normal(90, 20))
        disease = random.choice(diseases_dog)
        temp = np.random.normal(38.5, 0.7)
    else:
        age = round(np.random.uniform(0.1, 20), 1)
        weight = round(np.random.uniform(2.0, 8.0), 1)
        heart_rate = int(np.random.normal(160, 25))
        disease = random.choice(diseases_cat)
        temp = np.random.normal(38.7, 0.5)

    # Occasionally introduce the bad encoding marker to mimic source data
    temp_str = f"{temp:.1f}°C"
    if random.random() < 0.05:
        temp_str = temp_str.replace('°C', 'Â°C')

    gender = random.choice(['Male', 'Female'])

    # Symptoms (probabilities depend on disease broadly)
    appetite_loss = random.random() < 0.25
    vomiting = random.random() < 0.12
    diarrhea = random.random() < 0.10
    coughing = (disease in ['Kennel Cough', 'Upper Respiratory Infection']) and (random.random() < 0.6)
    labored_breathing = random.random() < 0.05
    lameness = random.random() < 0.08
    skin_lesions = (disease in ['Dermatitis']) and (random.random() < 0.6)
    nasal_discharge = (disease in ['Upper Respiratory Infection', 'Kennel Cough']) and (random.random() < 0.5)
    eye_discharge = random.random() < 0.07

    row = {
        'Animal_Type': animal,
        'Age': age,
        'Gender': gender,
        'Weight': weight,
        'Appetite_Loss': 'Yes' if appetite_loss else 'No',
        'Vomiting': 'Yes' if vomiting else 'No',
        'Diarrhea': 'Yes' if diarrhea else 'No',
        'Coughing': 'Yes' if coughing else 'No',
        'Labored_Breathing': 'Yes' if labored_breathing else 'No',
        'Lameness': 'Yes' if lameness else 'No',
        'Skin_Lesions': 'Yes' if skin_lesions else 'No',
        'Nasal_Discharge': 'Yes' if nasal_discharge else 'No',
        'Eye_Discharge': 'Yes' if eye_discharge else 'No',
        'Body_Temperature': temp_str,
        'Heart_Rate': heart_rate,
        'Disease_Prediction': disease
    }
    rows.append(row)


df = pd.DataFrame(rows)

out_dir = Path(__file__).resolve().parents[1] / 'data' / 'raw'
out_dir.mkdir(parents=True, exist_ok=True)

out_path = out_dir / 'vet_realistic_dataset.csv'
df.to_csv(out_path, index=False)

print(f'Created dataset: {out_path} (rows={len(df)})')
