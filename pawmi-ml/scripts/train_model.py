"""
Script principal de entrenamiento de modelos
Uso: python scripts/train_model.py
"""
import sys
from pathlib import Path

import pandas as pd

# Añadir src al path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from model_training.trainer import PyCaretTrainer
from utils.config import load_config
from utils.logger import setup_logger


def main():
    # Configurar logger
    logger = setup_logger("training", "logs/training.log")
    
    logger.info("="*70)
    logger.info("🚀 PAWMI ML - ENTRENAMIENTO DE MODELO")
    logger.info("="*70)
    
    try:
        # Cargar configuración
        logger.info("\n📋 Cargando configuración...")
        config = load_config("configs/model_config.yaml")
        
        # Cargar datos
        logger.info("\n📂 Cargando datos preprocesados...")
        data_dir = Path("data/processed")
        
        train_df = pd.read_csv(data_dir / "train.csv")
        val_df = pd.read_csv(data_dir / "val.csv")
        test_df = pd.read_csv(data_dir / "test.csv")
        
        logger.info(f"   Train: {len(train_df)} registros")
        logger.info(f"   Val:   {len(val_df)} registros")
        logger.info(f"   Test:  {len(test_df)} registros")
        
        # Combinar train + val para entrenamiento final
        train_val_df = pd.concat([train_df, val_df], ignore_index=True)
        logger.info(f"\n   Combinando train+val: {len(train_val_df)} registros")
        
        # Mostrar distribución de clases
        logger.info("\n📊 Distribución de clases:")
        class_dist = train_val_df['Disease_Prediction'].value_counts()
        for disease, count in class_dist.items():
            logger.info(f"   {disease}: {count}")
        
        # Entrenar
        logger.info("\n" + "="*70)
        logger.info("FASE 1: ENTRENAMIENTO")
        logger.info("="*70)
        
        trainer = PyCaretTrainer(config)
        model = trainer.train(train_val_df)
        
        # Evaluar
        logger.info("\n" + "="*70)
        logger.info("FASE 2: EVALUACIÓN")
        logger.info("="*70)
        
        metrics = trainer.evaluate(test_df)
        
        # Guardar
        logger.info("\n" + "="*70)
        logger.info("FASE 3: GUARDAR MODELO")
        logger.info("="*70)
        
        model_path = trainer.save_model("diagnosis_classifier_v1", metrics)
        
        # Resumen
        logger.info("\n" + "="*70)
        logger.info("✅ ENTRENAMIENTO COMPLETADO")
        logger.info("="*70)
        
        logger.info(f"\n📦 Modelo guardado: {model_path}.pkl")
        logger.info(f"\n📊 Métricas finales:")
        for metric, value in metrics.items():
            logger.info(f"   {metric}: {value:.4f}")
        
        return 0
        
    except Exception as e:
        logger.error(f"\n❌ Error: {e}")
        logger.exception("Detalles:")
        return 1

if __name__ == "__main__":
    sys.exit(main())

