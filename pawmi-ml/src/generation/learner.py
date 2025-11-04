"""
Learner - Fase 1: Aprendizaje de patrones
Aprende distribuciones estadísticas y patrones de los datos reales
"""
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
from loguru import logger

try:
    from sdv.metadata import SingleTableMetadata
    from sdv.single_table import CTGANSynthesizer
    HAS_CTGAN = True
except ImportError:
    HAS_CTGAN = False
    logger.warning("⚠️ SDV/CTGAN no disponible. Instalar con: pip install sdv")


class VetDataLearner:
    """
    Aprende patrones estadísticos y clínicos de datos veterinarios reales
    """
    
    def __init__(self, data_path: str):
        """
        Args:
            data_path: Ruta al CSV de datos limpios
        """
        self.data_path = Path(data_path)
        self.df_real: Optional[pd.DataFrame] = None
        self.ctgan = None
        self.profiles: Dict[str, Dict[str, Any]] = {}
        
        # Cargar datos
        self._load_data()
    
    def _load_data(self):
        """Carga datos reales"""
        if not self.data_path.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_path}")
        
        self.df_real = pd.read_csv(self.data_path)
        logger.info(f"📊 Loaded {len(self.df_real)} real cases")
    
    def learn_statistical_patterns(self, epochs: int = 300, batch_size: int = 32):
        """
        CTGAN aprende correlaciones entre síntomas y diagnósticos
        
        Args:
            epochs: Épocas de entrenamiento
            batch_size: Tamaño de batch
        """
        if not HAS_CTGAN:
            logger.warning("⚠️ CTGAN no disponible, saltando aprendizaje estadístico")
            return
        
        logger.info("📊 Aprendiendo patrones estadísticos con CTGAN...")
        
        # Preparar metadata
        metadata = SingleTableMetadata()
        metadata.detect_from_dataframe(self.df_real)
        
        # Configurar tipos de columnas
        metadata.update_column('Disease_Prediction', sdtype='categorical')
        metadata.update_column('Animal_Type', sdtype='categorical')
        metadata.update_column('Breed', sdtype='categorical')
        metadata.update_column('Gender', sdtype='categorical')
        
        # Columnas booleanas
        bool_cols = ['Vomiting', 'Diarrhea', 'Coughing', 'Fever', 'Lethargy', 
                     'Appetite_Loss', 'Labored_Breathing', 'Lameness', 
                     'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
        
        if self.df_real is not None:
            for col in bool_cols:
                if col in self.df_real.columns:
                    metadata.update_column(col, sdtype='boolean')
        
        # Entrenar CTGAN
        self.ctgan = CTGANSynthesizer(
            metadata,
            epochs=epochs,
            batch_size=batch_size,
            verbose=True,
            cuda=False  # True si tienes GPU
        )
        
        logger.info(f"🔥 Entrenando CTGAN ({epochs} epochs)...")
        self.ctgan.fit(self.df_real)
        logger.info("✅ CTGAN entrenado exitosamente")
    
    def extract_disease_profiles(self) -> Dict[str, Dict[str, Any]]:
        """
        Extrae perfiles estadísticos por diagnóstico
        Útil para validación y generación con LLM
        
        Returns:
            Dict con perfiles por diagnóstico
        """
        if self.df_real is None:
            raise ValueError("Data not loaded. Call _load_data first.")
        
        logger.info("📋 Extrayendo perfiles clínicos por diagnóstico...")
        
        profiles: Dict[str, Dict[str, Any]] = {}
        
        for diagnosis in self.df_real['Disease_Prediction'].unique():
            df_dx = self.df_real[self.df_real['Disease_Prediction'] == diagnosis]
            
            # Frecuencias de síntomas
            symptom_cols = ['Vomiting', 'Diarrhea', 'Coughing', 'Fever', 
                           'Lethargy', 'Appetite_Loss', 'Labored_Breathing', 
                           'Lameness', 'Skin_Lesions', 'Nasal_Discharge', 
                           'Eye_Discharge']
            
            symptom_probs = {}
            for col in symptom_cols:
                if col in df_dx.columns:
                    symptom_probs[col] = (df_dx[col] == True).mean()
            
            # Rangos numéricos
            profiles[diagnosis] = {
                "n_samples": len(df_dx),
                "symptom_probabilities": symptom_probs,
                "age_range": (float(df_dx['Age'].min()), float(df_dx['Age'].max())),
                "age_mean": float(df_dx['Age'].mean()),
                "weight_range": (float(df_dx['Weight'].min()), float(df_dx['Weight'].max())),
                "weight_mean": float(df_dx['Weight'].mean()),
                "temp_range": (
                    float(df_dx['Body_Temperature'].min()),
                    float(df_dx['Body_Temperature'].max())
                ),
                "temp_mean": float(df_dx['Body_Temperature'].mean()),
                "heart_rate_range": (
                    int(df_dx['Heart_Rate'].min()),
                    int(df_dx['Heart_Rate'].max())
                ),
                "common_species": df_dx['Animal_Type'].mode()[0] if len(df_dx) > 0 else "Dog",
                "common_breeds": df_dx['Breed'].value_counts().head(3).to_dict(),
                "duration_common": df_dx['Duration'].mode()[0] if len(df_dx) > 0 else "3 days"
            }
        
        self.profiles = profiles
        logger.info(f"✅ Perfiles extraídos para {len(profiles)} diagnósticos")
        
        return profiles
    
    def save_ctgan(self, output_path: str):
        """Guarda modelo CTGAN entrenado"""
        if self.ctgan is None:
            logger.warning("⚠️ CTGAN no ha sido entrenado")
            return
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        self.ctgan.save(str(output_file))
        logger.info(f"💾 CTGAN guardado en: {output_file}")
    
    def load_ctgan(self, model_path: str):
        """Carga modelo CTGAN pre-entrenado"""
        if not HAS_CTGAN:
            logger.warning("⚠️ CTGAN no disponible")
            return
        
        model_file = Path(model_path)
        if not model_file.exists():
            raise FileNotFoundError(f"CTGAN model not found: {model_file}")
        
        self.ctgan = CTGANSynthesizer.load(str(model_path))
        logger.info(f"📂 CTGAN cargado desde: {model_path}")
