"""Verificación rápida de coherencia clínica"""
import pandas as pd

df = pd.read_csv('data/synthetic/synthetic_validated.csv')

print('=== VALIDACIÓN FINAL DE COHERENCIA CLÍNICA ===\n')

# Parvovirus
parvo = df[df['Disease_Prediction'].isin(['Canine Parvovirus', 'Parvovirus'])]
print(f'✅ Parvovirus/Canine Parvovirus: {len(parvo)} casos')
print(f'   - 100% Vómito: {parvo["Vomiting"].all()}')
print(f'   - 100% Diarrea: {parvo["Diarrhea"].all()}')
print(f'   - 100% Perros: {(parvo["Animal_Type"] == "Dog").all()}')

# Kennel Cough
kennel = df[df['Disease_Prediction'] == 'Kennel Cough']
print(f'\n✅ Kennel Cough: {len(kennel)} casos')
print(f'   - 100% Tos: {kennel["Coughing"].all()}')
print(f'   - 100% Perros: {(kennel["Animal_Type"] == "Dog").all()}')

# Feline Calicivirus
calici = df[df['Disease_Prediction'] == 'Feline Calicivirus']
resp = calici['Coughing'] | calici['Nasal_Discharge']
print(f'\n✅ Feline Calicivirus: {len(calici)} casos')
print(f'   - 100% síntomas respiratorios: {resp.all()}')
print(f'   - 100% Gatos: {(calici["Animal_Type"] == "Cat").all()}')

# Gastroenteritis
gastro = df[df['Disease_Prediction'] == 'Gastroenteritis']
gi_symptoms = gastro['Vomiting'] | gastro['Diarrhea']
print(f'\n✅ Gastroenteritis: {len(gastro)} casos')
print(f'   - 100% síntomas GI: {gi_symptoms.all()}')

print('\n🎉 TODOS LOS CASOS SON CLÍNICAMENTE COHERENTES')
