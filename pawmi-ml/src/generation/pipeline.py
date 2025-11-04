"""
Pipeline completo de generación de datos sintéticos
Integra: Learner → Generator → Validator
"""
from pathlib import Path
from typing import Dict, Optional

import pandas as pd
from generation.generator import CTGANGenerator, SimpleAugmenter
from generation.learner import VetDataLearner
from generation.validator import ClinicalValidator
from loguru import logger


class SyntheticDataPipeline:
    """
    Pipeline completo: Aprender → Generar → Validar
    """
    
    def __init__(
        self,
        data_path: str,
        use_ctgan: bool = True
    ):
        """
        Args:
            data_path: Ruta a datos limpios
            use_ctgan: Si usar CTGAN (requiere GPU/tiempo) o permutación simple
        """
        self.data_path = data_path
        self.use_ctgan = use_ctgan
        
        self.learner = None
        self.generator = None
        self.validator = None
        self.profiles = None
    
    def run(
        self,
        target_size: int = 5000,
        ctgan_epochs: int = 300,
        balance_strategy: str = "uniform",
        validation_strict: bool = False,
        save_rejected: bool = True
    ) -> pd.DataFrame:
        """
        Ejecuta pipeline completo
        
        Args:
            target_size: Número objetivo de muestras sintéticas
            ctgan_epochs: Épocas de entrenamiento CTGAN
            balance_strategy: 'uniform' o 'proportional'
            validation_strict: Si rechazar casos con cualquier error
            save_rejected: Si guardar casos rechazados
        
        Returns:
            DataFrame con datos sintéticos validados
        """
        logger.info("="*70)
        logger.info("🚀 INICIANDO PIPELINE DE GENERACIÓN DE DATOS SINTÉTICOS")
        logger.info("="*70)
        
        # FASE 1: APRENDIZAJE
        logger.info("\n📚 FASE 1: APRENDIZAJE DE PATRONES")
        logger.info("-"*70)
        
        self.learner = VetDataLearner(self.data_path)
        
        if self.use_ctgan:
            try:
                self.learner.learn_statistical_patterns(
                    epochs=ctgan_epochs,
                    batch_size=32
                )
                # Guardar modelo CTGAN
                ctgan_path = Path("models/saved_models/ctgan_trained.pkl")
                self.learner.save_ctgan(str(ctgan_path))
            except Exception as e:
                logger.warning(f"⚠️ Error entrenando CTGAN: {e}")
                logger.info("   Usando generación simple por permutación")
                self.use_ctgan = False
        
        # Extraer perfiles clínicos
        self.profiles = self.learner.extract_disease_profiles()
        
        # Guardar perfiles
        import json
        profiles_path = Path("data/validation/disease_profiles.json")
        profiles_path.parent.mkdir(parents=True, exist_ok=True)
        with open(profiles_path, 'w') as f:
            json.dump(self.profiles, f, indent=2)
        logger.info(f"💾 Perfiles guardados en: {profiles_path}")
        
        # FASE 2: GENERACIÓN
        logger.info("\n🔮 FASE 2: GENERACIÓN DE DATOS SINTÉTICOS")
        logger.info("-"*70)
        
        if self.use_ctgan and self.learner.ctgan is not None:
            self.generator = CTGANGenerator(self.learner)
            df_synthetic = self.generator.generate_balanced_dataset(
                total_samples=target_size,
                balance_strategy=balance_strategy
            )
        else:
            # Fallback a generación simple
            if self.learner.df_real is None:
                raise ValueError("No real data available for generation")
            augmenter = SimpleAugmenter(self.learner.df_real, self.profiles)
            df_synthetic = augmenter.generate_by_permutation(target_size)
        
        logger.info(f"   Generated: {len(df_synthetic)} casos")
        
        # POST-PROCESAMIENTO: Corregir tipos de datos
        logger.info("\n🔧 POST-PROCESAMIENTO: CORRECCIÓN DE TIPOS")
        logger.info("-"*70)
        df_synthetic = self._fix_data_types(df_synthetic)
        logger.info("   ✅ Tipos de datos corregidos")
        
        # FASE 3: VALIDACIÓN
        logger.info("\n✅ FASE 3: VALIDACIÓN CLÍNICA")
        logger.info("-"*70)
        
        self.validator = ClinicalValidator(self.profiles)
        df_valid, df_rejected, stats = self.validator.validate_batch(
            df_synthetic,
            strict=validation_strict
        )
        
        # Guardar resultados
        output_dir = Path("data/synthetic")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Guardar casos válidos
        valid_path = output_dir / "synthetic_validated.csv"
        df_valid.to_csv(valid_path, index=False)
        logger.info(f"💾 Datos válidos guardados: {valid_path}")
        
        # Guardar casos rechazados
        if save_rejected and len(df_rejected) > 0:
            rejected_path = output_dir / "synthetic_rejected.csv"
            df_rejected.to_csv(rejected_path, index=False)
            logger.info(f"💾 Casos rechazados guardados: {rejected_path}")
            
            # Guardar razones de rechazo
            import json
            reasons_path = Path("data/validation/rejection_reasons.json")
            with open(reasons_path, 'w') as f:
                json.dump(stats['rejection_reasons'], f, indent=2)
        
        # Estadísticas finales
        logger.info("\n" + "="*70)
        logger.info("📊 ESTADÍSTICAS FINALES")
        logger.info("="*70)
        logger.info(f"   Total generados: {stats['total']}")
        logger.info(f"   Válidos:         {stats['valid']} ({stats['acceptance_rate']*100:.1f}%)")
        logger.info(f"   Rechazados:      {stats['rejected']}")
        
        # Distribución por diagnóstico
        logger.info("\n📋 Distribución por diagnóstico:")
        for diagnosis, count in df_valid['Disease_Prediction'].value_counts().items():
            logger.info(f"   {diagnosis:40s}: {count:4d} casos")
        
        logger.info("\n" + "="*70)
        logger.info("🎉 PIPELINE COMPLETADO EXITOSAMENTE")
        logger.info("="*70)
        
        return df_valid
    
    def _fix_data_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Corrige tipos de datos después de generación
        
        Args:
            df: DataFrame con datos sintéticos
        
        Returns:
            DataFrame con tipos corregidos
        """
        df_fixed = df.copy()
        
        # 1. Age: debe ser entero (años)
        df_fixed['Age'] = df_fixed['Age'].round(0).astype(int)
        
        # 2. Weight: máximo 1 decimal
        df_fixed['Weight'] = df_fixed['Weight'].round(1)
        
        # 3. Body_Temperature: máximo 1 decimal
        df_fixed['Body_Temperature'] = df_fixed['Body_Temperature'].round(1)
        
        # 4. Heart_Rate: entero
        df_fixed['Heart_Rate'] = df_fixed['Heart_Rate'].round(0).astype(int)
        
        # 5. Booleanos: asegurar tipo bool
        bool_cols = [
            'Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing',
            'Labored_Breathing', 'Lameness', 'Skin_Lesions',
            'Nasal_Discharge', 'Eye_Discharge'
        ]
        for col in bool_cols:
            if col in df_fixed.columns:
                df_fixed[col] = df_fixed[col].astype(bool)
        
        # 6. Strings: strip whitespace
        str_cols = ['Animal_Type', 'Breed', 'Gender', 'Disease_Prediction',
                    'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4', 'Duration']
        for col in str_cols:
            if col in df_fixed.columns:
                df_fixed[col] = df_fixed[col].astype(str).str.strip()
        
        return df_fixed
