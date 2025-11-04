"""
Auditoría veterinaria: Verificar coherencia clínica de datos sintéticos
"""
import sys
from collections import defaultdict
from pathlib import Path

import pandas as pd

# Agregar src al path
root = Path(__file__).parent.parent
sys.path.insert(0, str(root / 'src'))

from loguru import logger
from utils.logger import setup_logger


def analyze_clinical_coherence(csv_path: str):
    """
    Analiza coherencia clínica de cada diagnóstico
    """
    setup_logger("audit")
    
    df = pd.read_csv(csv_path)
    
    logger.info("="*80)
    logger.info("🩺 AUDITORÍA VETERINARIA: COHERENCIA SÍNTOMAS-DIAGNÓSTICO")
    logger.info("="*80)
    
    # Análisis por diagnóstico
    for diagnosis in sorted(df['Disease_Prediction'].unique()):
        subset = df[df['Disease_Prediction'] == diagnosis]
        
        logger.info(f"\n📋 {diagnosis} (n={len(subset)})")
        logger.info("-"*80)
        
        # Especies
        species = subset['Animal_Type'].value_counts()
        logger.info(f"   Especies: {dict(species)}")
        
        # Síntomas principales
        symptoms = subset['Symptom_1'].value_counts().head(5)
        logger.info(f"   Síntomas principales:")
        for symp, count in symptoms.items():
            logger.info(f"      - {symp}: {count}/{len(subset)} ({count/len(subset)*100:.1f}%)")
        
        # Síntomas booleanos clave
        logger.info(f"   Síntomas booleanos:")
        logger.info(f"      - Vómito:           {subset['Vomiting'].sum()}/{len(subset)} ({subset['Vomiting'].mean()*100:.1f}%)")
        logger.info(f"      - Diarrea:          {subset['Diarrhea'].sum()}/{len(subset)} ({subset['Diarrhea'].mean()*100:.1f}%)")
        logger.info(f"      - Tos:              {subset['Coughing'].sum()}/{len(subset)} ({subset['Coughing'].mean()*100:.1f}%)")
        logger.info(f"      - Pérdida apetito:  {subset['Appetite_Loss'].sum()}/{len(subset)} ({subset['Appetite_Loss'].mean()*100:.1f}%)")
        logger.info(f"      - Secreción nasal:  {subset['Nasal_Discharge'].sum()}/{len(subset)} ({subset['Nasal_Discharge'].mean()*100:.1f}%)")
        
        # Parámetros vitales
        logger.info(f"   Parámetros vitales:")
        logger.info(f"      - Temperatura: {subset['Body_Temperature'].mean():.1f}°C (±{subset['Body_Temperature'].std():.1f})")
        logger.info(f"      - Frecuencia cardíaca: {subset['Heart_Rate'].mean():.0f} bpm (±{subset['Heart_Rate'].std():.0f})")
        logger.info(f"      - Edad promedio: {subset['Age'].mean():.1f} años")
        logger.info(f"      - Peso promedio: {subset['Weight'].mean():.1f} kg")


def validate_diagnosis_rules(csv_path: str):
    """
    Valida reglas veterinarias específicas
    """
    df = pd.read_csv(csv_path)
    
    logger.info("\n" + "="*80)
    logger.info("🔍 VALIDACIÓN DE REGLAS VETERINARIAS ESPECÍFICAS")
    logger.info("="*80)
    
    issues = []
    
    # REGLA 1: Canine Parvovirus → debe tener vómito Y diarrea (crítico)
    parvo = df[df['Disease_Prediction'] == 'Canine Parvovirus']
    parvo_no_vomit = parvo[~parvo['Vomiting']]
    parvo_no_diarrhea = parvo[~parvo['Diarrhea']]
    
    if len(parvo_no_vomit) > 0:
        issues.append(f"❌ Canine Parvovirus sin vómito: {len(parvo_no_vomit)}/{len(parvo)} casos")
    else:
        logger.info("✅ Canine Parvovirus: 100% tiene vómito")
    
    if len(parvo_no_diarrhea) > 0:
        issues.append(f"❌ Canine Parvovirus sin diarrea: {len(parvo_no_diarrhea)}/{len(parvo)} casos")
    else:
        logger.info("✅ Canine Parvovirus: 100% tiene diarrea")
    
    # REGLA 2: Kennel Cough → debe tener tos (crítico)
    kennel = df[df['Disease_Prediction'] == 'Kennel Cough']
    kennel_no_cough = kennel[~kennel['Coughing']]
    
    if len(kennel_no_cough) > 0:
        issues.append(f"❌ Kennel Cough sin tos: {len(kennel_no_cough)}/{len(kennel)} casos")
    else:
        logger.info("✅ Kennel Cough: 100% tiene tos")
    
    # REGLA 3: Kennel Cough → solo perros
    kennel_cats = kennel[kennel['Animal_Type'] == 'Cat']
    if len(kennel_cats) > 0:
        issues.append(f"❌ Kennel Cough en gatos: {len(kennel_cats)}/{len(kennel)} casos")
    else:
        logger.info("✅ Kennel Cough: 100% perros")
    
    # REGLA 4: Feline Calicivirus → solo gatos
    calici = df[df['Disease_Prediction'] == 'Feline Calicivirus']
    calici_dogs = calici[calici['Animal_Type'] == 'Dog']
    if len(calici_dogs) > 0:
        issues.append(f"❌ Feline Calicivirus en perros: {len(calici_dogs)}/{len(calici)} casos")
    else:
        logger.info("✅ Feline Calicivirus: 100% gatos")
    
    # REGLA 5: Feline Calicivirus → debe tener tos O secreción nasal
    calici_no_resp = calici[~calici['Coughing'] & ~calici['Nasal_Discharge']]
    if len(calici_no_resp) > 0:
        issues.append(f"❌ Feline Calicivirus sin síntomas respiratorios: {len(calici_no_resp)}/{len(calici)} casos")
    else:
        logger.info("✅ Feline Calicivirus: 100% tiene síntomas respiratorios")
    
    # REGLA 6: Feline Herpesvirus → solo gatos
    herpes = df[df['Disease_Prediction'] == 'Feline Herpesvirus']
    herpes_dogs = herpes[herpes['Animal_Type'] == 'Dog']
    if len(herpes_dogs) > 0:
        issues.append(f"❌ Feline Herpesvirus en perros: {len(herpes_dogs)}/{len(herpes)} casos")
    else:
        logger.info("✅ Feline Herpesvirus: 100% gatos")
    
    # REGLA 7: Gastroenteritis → debe tener vómito O diarrea
    gastro = df[df['Disease_Prediction'] == 'Gastroenteritis']
    gastro_no_gi = gastro[~gastro['Vomiting'] & ~gastro['Diarrhea']]
    if len(gastro_no_gi) > 0:
        issues.append(f"❌ Gastroenteritis sin síntomas GI: {len(gastro_no_gi)}/{len(gastro)} casos")
    else:
        logger.info("✅ Gastroenteritis: 100% tiene síntomas GI")
    
    # REGLA 8: Canine Distemper → solo perros
    distemper = df[df['Disease_Prediction'] == 'Canine Distemper']
    distemper_cats = distemper[distemper['Animal_Type'] == 'Cat']
    if len(distemper_cats) > 0:
        issues.append(f"❌ Canine Distemper en gatos: {len(distemper_cats)}/{len(distemper)} casos")
    else:
        logger.info("✅ Canine Distemper: 100% perros")
    
    # REGLA 9: Parvovirus → debe tener vómito Y diarrea
    parvo2 = df[df['Disease_Prediction'] == 'Parvovirus']
    parvo2_no_vomit = parvo2[~parvo2['Vomiting']]
    parvo2_no_diarrhea = parvo2[~parvo2['Diarrhea']]
    
    if len(parvo2_no_vomit) > 0:
        issues.append(f"❌ Parvovirus sin vómito: {len(parvo2_no_vomit)}/{len(parvo2)} casos")
    else:
        logger.info("✅ Parvovirus: 100% tiene vómito")
    
    if len(parvo2_no_diarrhea) > 0:
        issues.append(f"❌ Parvovirus sin diarrea: {len(parvo2_no_diarrhea)}/{len(parvo2)} casos")
    else:
        logger.info("✅ Parvovirus: 100% tiene diarrea")
    
    # Resumen
    logger.info("\n" + "="*80)
    if len(issues) == 0:
        logger.info("🎉 TODOS LOS CASOS SON CLÍNICAMENTE COHERENTES")
    else:
        logger.warning(f"⚠️  ENCONTRADOS {len(issues)} PROBLEMAS DE COHERENCIA:")
        for issue in issues:
            logger.warning(f"   {issue}")
    logger.info("="*80)


if __name__ == "__main__":
    csv_path = root / "data" / "synthetic" / "synthetic_validated.csv"
    
    if not csv_path.exists():
        print(f"❌ No se encontró: {csv_path}")
        sys.exit(1)
    
    # Análisis general
    analyze_clinical_coherence(str(csv_path))
    
    # Validación de reglas específicas
    validate_diagnosis_rules(str(csv_path))
