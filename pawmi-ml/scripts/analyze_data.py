"""
Script de análisis exploratorio de datos - PawMI ML
Uso: python scripts/analyze_data.py
"""
import sys
from pathlib import Path
from typing import cast

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Añadir src al path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from utils.env import get_env
from utils.logger import setup_logger

log_dir = cast(str, get_env("LOG_DIR", "logs"))
logger = setup_logger("data_analysis", f"{log_dir}/data_analysis.log")

def main():
    logger.info("🔍 Iniciando análisis exploratorio de datos...")
    
    # Cargar datos
    data_path = Path(cast(str, get_env("RAW_DATA_DIR", "data/raw"))) / "cleaned_animal_disease_prediction.csv"
    
    if not data_path.exists():
        logger.error(f"❌ Archivo no encontrado: {data_path}")
        return 1
    
    df = pd.read_csv(data_path)
    logger.info(f"📊 Dataset cargado: {len(df)} registros, {len(df.columns)} columnas")
    
    # Información general
    print("\n" + "="*70)
    print("📋 INFORMACIÓN GENERAL DEL DATASET")
    print("="*70)
    print(f"Total de registros: {len(df)}")
    print(f"Total de columnas: {len(df.columns)}")
    print(f"\nColumnas:\n{list(df.columns)}")
    
    # Tipos de datos
    print("\n📊 Tipos de datos:")
    print(df.dtypes)
    
    # Distribución por especie
    print("\n" + "="*70)
    print("🐾 DISTRIBUCIÓN POR ESPECIE")
    print("="*70)
    species_counts = df['Animal_Type'].value_counts()
    print(species_counts)
    print(f"\nTotal especies: {len(species_counts)}")
    
    # Distribución por diagnóstico
    print("\n" + "="*70)
    print("🩺 DISTRIBUCIÓN POR DIAGNÓSTICO")
    print("="*70)
    diagnosis_counts = df['Disease_Prediction'].value_counts()
    print(diagnosis_counts.head(30))
    print(f"\nTotal diagnósticos únicos: {len(diagnosis_counts)}")
    
    # Diagnósticos con menos de 5 casos
    low_samples = diagnosis_counts[diagnosis_counts < 5]
    if len(low_samples) > 0:
        print(f"\n⚠️ Diagnósticos con <5 casos ({len(low_samples)}):")
        print(low_samples)
    
    # Filtrar solo perros y gatos
    df_dogs_cats = df[df['Animal_Type'].isin(['Dog', 'Cat'])]
    print("\n" + "="*70)
    print("🐶🐱 DATASET FILTRADO (SOLO PERROS Y GATOS)")
    print("="*70)
    print(f"Total registros: {len(df_dogs_cats)}")
    print(f"\nDistribución por especie:")
    print(df_dogs_cats['Animal_Type'].value_counts())
    
    print(f"\nDiagnósticos en perros/gatos:")
    diagnosis_dc = df_dogs_cats['Disease_Prediction'].value_counts()
    print(diagnosis_dc)
    print(f"\nTotal diagnósticos únicos: {len(diagnosis_dc)}")
    
    # Diagnósticos con suficientes muestras (>=5)
    sufficient_samples = diagnosis_dc[diagnosis_dc >= 5]
    print(f"\n✅ Diagnósticos con ≥5 casos ({len(sufficient_samples)}):")
    print(sufficient_samples)
    
    # Valores faltantes
    print("\n" + "="*70)
    print("❓ VALORES FALTANTES")
    print("="*70)
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    if len(missing) > 0:
        print(missing)
    else:
        print("✅ No hay valores faltantes")
    
    # Estadísticas numéricas
    print("\n" + "="*70)
    print("📈 ESTADÍSTICAS NUMÉRICAS")
    print("="*70)
    
    # Edad
    print("\n📅 Edad:")
    print(df['Age'].describe())
    
    # Peso
    print("\n⚖️ Peso:")
    print(df['Weight'].describe())
    
    # Temperatura (limpiar y convertir)
    df['Temp_Numeric'] = df['Body_Temperature'].str.replace('°C', '').astype(float)
    print("\n🌡️ Temperatura:")
    print(df['Temp_Numeric'].describe())
    
    # Heart Rate
    print("\n💓 Frecuencia cardíaca:")
    print(df['Heart_Rate'].describe())
    
    # Distribución de síntomas
    print("\n" + "="*70)
    print("🔬 SÍNTOMAS MÁS COMUNES")
    print("="*70)
    
    symptom_cols = ['Vomiting', 'Diarrhea', 'Coughing', 'Fever', 'Lethargy', 
                    'Appetite_Loss', 'Labored_Breathing', 'Lameness', 'Skin_Lesions',
                    'Nasal_Discharge', 'Eye_Discharge']
    
    symptom_stats = []
    for col in symptom_cols:
        if col in df.columns:
            yes_count = (df[col] == 'Yes').sum()
            pct = yes_count / len(df) * 100
            symptom_stats.append({'Síntoma': col, 'Casos': yes_count, 'Porcentaje': f"{pct:.1f}%"})
    
    symptom_df = pd.DataFrame(symptom_stats).sort_values('Casos', ascending=False)
    print(symptom_df.to_string(index=False))
    
    # Top razas
    print("\n" + "="*70)
    print("🏆 TOP 20 RAZAS MÁS COMUNES")
    print("="*70)
    breed_counts = df['Breed'].value_counts().head(20)
    print(breed_counts)
    
    # Análisis por especie principal
    print("\n" + "="*70)
    print("📊 ANÁLISIS DETALLADO POR ESPECIE")
    print("="*70)
    
    for species in ['Dog', 'Cat']:
        df_species = df[df['Animal_Type'] == species]
        if len(df_species) > 0:
            print(f"\n{'🐶' if species == 'Dog' else '🐱'} {species.upper()}:")
            print(f"   Total: {len(df_species)} casos")
            print(f"   Edad promedio: {df_species['Age'].mean():.1f} años")
            print(f"   Peso promedio: {df_species['Weight'].mean():.1f} kg")
            print(f"   Diagnósticos únicos: {df_species['Disease_Prediction'].nunique()}")
            print(f"   Top 5 diagnósticos:")
            top5 = df_species['Disease_Prediction'].value_counts().head(5)
            for dx, count in top5.items():
                print(f"      - {dx}: {count} casos")
    
    # Guardar resumen
    data_env = cast(str, get_env("DATA_DIR", "data"))
    validation_dir = Path(data_env) / "validation"
    validation_dir.mkdir(parents=True, exist_ok=True)
    
    summary = {
        'total_records': int(len(df)),
        'total_species': int(len(species_counts)),
        'total_diagnoses': int(len(diagnosis_counts)),
        'dogs_cats_records': int(len(df_dogs_cats)),
        'dogs_cats_diagnoses': int(len(diagnosis_dc)),
        'diagnoses_with_5plus': int(len(sufficient_samples)),
        'species_distribution': species_counts.to_dict(),
        'top_10_diagnoses': diagnosis_counts.head(10).to_dict(),
    }
    
    import json
    summary_path = validation_dir / "data_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    logger.info("✅ Análisis completado")
    logger.info(f"📁 Resumen guardado en: {summary_path}")
    
    print("\n" + "="*70)
    print("✅ ANÁLISIS COMPLETADO")
    print("="*70)
    print(f"📄 Resumen guardado en: {summary_path}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
