"""
Script de limpieza y preparación de datos - PawMI ML
Uso: python scripts/prepare_data.py
"""
import sys
from pathlib import Path
from typing import cast

sys.path.append(str(Path(__file__).parent.parent / "src"))

from data_processing.cleaner import DataCleaner
from data_processing.splitter import DataSplitter
from utils.config import load_config
from utils.env import get_env
from utils.logger import setup_logger

log_dir = cast(str, get_env("LOG_DIR", "logs"))
logger = setup_logger("data_prep", f"{log_dir}/data_prep.log")

def main():
    logger.info("🚀 Iniciando preparación de datos...")
    
    # Cargar configuración
    config_path = Path("configs/data_config.yaml")
    if not config_path.exists():
        logger.error(f"❌ Config file not found: {config_path}")
        return 1
    
    config = load_config(str(config_path))
    
    try:
        # 1. Limpiar datos
        logger.info("\n" + "="*70)
        logger.info("PASO 1: LIMPIEZA DE DATOS")
        logger.info("="*70)
        
        cleaner = DataCleaner(config)
        df_clean = cleaner.load_and_clean()
        
        logger.info(f"\n✅ Datos limpios: {len(df_clean)} registros")
        
        # 2. Dividir en train/val/test
        logger.info("\n" + "="*70)
        logger.info("PASO 2: DIVISIÓN DE DATOS")
        logger.info("="*70)
        
        splitter = DataSplitter(config)
        train_df, val_df, test_df = splitter.split(df_clean)
        
        logger.info(f"\n📊 División completada:")
        logger.info(f"   Train: {len(train_df)} registros")
        logger.info(f"   Val:   {len(val_df)} registros")
        logger.info(f"   Test:  {len(test_df)} registros")
        
        # 3. Guardar splits
        train_path, val_path, test_path = splitter.save_splits(train_df, val_df, test_df)
        
        logger.info("\n" + "="*70)
        logger.info("✅ PREPARACIÓN COMPLETADA")
        logger.info("="*70)
        logger.info("Archivos generados:")
        logger.info(f"   📄 Train: {train_path}")
        logger.info(f"   📄 Val:   {val_path}")
        logger.info(f"   📄 Test:  {test_path}")
        
        print("\n🎉 ¡Datos preparados exitosamente!")
        print(f"\n📊 Resumen:")
        print(f"   Train: {len(train_df)} registros")
        print(f"   Val:   {len(val_df)} registros")
        print(f"   Test:  {len(test_df)} registros")
        print(f"\n🚀 Próximo paso: python scripts/train_model.py")
        
        return 0
        
    except Exception as e:
        logger.error(f"❌ Error durante la preparación: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return 1

if __name__ == "__main__":
    sys.exit(main())
