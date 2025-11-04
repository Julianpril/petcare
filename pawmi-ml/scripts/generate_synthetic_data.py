"""
Script ejecutable: Generación de datos sintéticos
Uso: python scripts/generate_synthetic_data.py
"""
import sys
from pathlib import Path

# Agregar src al path
root = Path(__file__).parent.parent
sys.path.insert(0, str(root / 'src'))

from generation.pipeline import SyntheticDataPipeline
from utils.logger import setup_logger


def main():
    """
    Ejecuta pipeline de generación de datos sintéticos
    """
    setup_logger("generation")
    
    # Configuración
    data_path = root / "data" / "processed" / "train.csv"
    
    # Verificar que exista el dataset
    if not data_path.exists():
        print(f"❌ Error: No se encontró {data_path}")
        print("   Ejecuta primero: python scripts/prepare_data.py")
        sys.exit(1)
    
    # Pipeline
    pipeline = SyntheticDataPipeline(
        data_path=str(data_path),
        use_ctgan=False  # Usar permutación simple (más rápido)
    )
    
    # Generar 5000 casos sintéticos
    df_synthetic = pipeline.run(
        target_size=5000,
        ctgan_epochs=300,  # No se usa si use_ctgan=False
        balance_strategy="uniform",  # Balanceo uniforme
        validation_strict=False,  # No rechazar por errores menores
        save_rejected=True  # Guardar casos rechazados
    )
    
    print(f"\n✅ Generados {len(df_synthetic)} casos sintéticos validados")
    print(f"   Ubicación: {root / 'data' / 'synthetic' / 'synthetic_validated.csv'}")


if __name__ == "__main__":
    main()
