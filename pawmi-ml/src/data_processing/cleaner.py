from pathlib import Path
from typing import List, Optional

import pandas as pd
from loguru import logger


class DataCleaner:
    """Limpieza y preprocesamiento de datos veterinarios - PawMI ML"""
    
    def __init__(self, config: dict):
        self.config = config
        self.data_dir = Path(config.get('data', {}).get('raw_dir', 'data/raw'))
        self.processed_dir = Path(config.get('data', {}).get('processed_dir', 'data/processed'))
        self.processed_dir.mkdir(parents=True, exist_ok=True)
    
    def load_raw_data(self, filename: str) -> pd.DataFrame:
        """Carga datos crudos"""
        filepath = self.data_dir / filename
        
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")
        
        logger.info(f"📂 Loading: {filename}")
        df = pd.read_csv(filepath)
        logger.info(f"   Rows: {len(df)}, Columns: {len(df.columns)}")
        
        return df
    
    def filter_species(self, df: pd.DataFrame, species: List[str]) -> pd.DataFrame:
        """Filtra por especies permitidas"""
        logger.info(f"🐾 Filtering species: {species}")
        
        df_filtered = df[df['Animal_Type'].isin(species)].copy()
        
        logger.info(f"   Original: {len(df)} → Filtered: {len(df_filtered)}")
        return df_filtered
    
    def filter_min_samples(
        self, 
        df: pd.DataFrame, 
        target_col: str, 
        min_samples: int
    ) -> pd.DataFrame:
        """Elimina clases con pocas muestras"""
        logger.info(f"📊 Filtering classes with <{min_samples} samples...")
        
        value_counts = df[target_col].value_counts()
        valid_classes = value_counts[value_counts >= min_samples].index
        
        df_filtered = df[df[target_col].isin(valid_classes)].copy()
        
        removed = len(df) - len(df_filtered)
        removed_classes = len(value_counts) - len(valid_classes)
        logger.info(f"   Removed {removed} rows from {removed_classes} classes")
        logger.info(f"   Remaining classes: {len(valid_classes)}")
        
        return df_filtered
    
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Maneja valores faltantes"""
        logger.info("🔧 Handling missing values...")
        
        # Mostrar valores faltantes
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        
        if len(missing) > 0:
            logger.warning(f"   Missing values found:\n{missing}")
            
            # Estrategia: eliminar filas con NaN en columnas críticas
            critical_cols = ['Animal_Type', 'Disease_Prediction', 'Age']
            df_clean = df.dropna(subset=critical_cols)
            
            dropped = len(df) - len(df_clean)
            logger.info(f"   Dropped {dropped} rows with missing critical values")
            return df_clean
        
        logger.info("   ✅ No missing values")
        return df
    
    def standardize_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Estandariza nombres de columnas y valores"""
        logger.info("📝 Standardizing columns...")
        
        df = df.copy()
        
        # Temperatura: convertir a float
        if 'Body_Temperature' in df.columns:
            df['Body_Temperature'] = df['Body_Temperature'].str.replace('°C', '').astype(float)
        
        # Boolean columns: Yes/No → 1/0
        bool_cols = ['Vomiting', 'Diarrhea', 'Fever', 'Coughing', 'Lethargy', 
                     'Appetite_Loss', 'Labored_Breathing', 'Lameness', 'Skin_Lesions',
                     'Nasal_Discharge', 'Eye_Discharge']
        
        for col in bool_cols:
            if col in df.columns:
                df[col] = df[col].map({'Yes': 1, 'No': 0})
        
        logger.info("   ✅ Standardization complete")
        return df
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Elimina duplicados"""
        logger.info("🔍 Removing duplicates...")
        
        initial_len = len(df)
        df_clean = df.drop_duplicates()
        removed = initial_len - len(df_clean)
        
        if removed > 0:
            logger.info(f"   Removed {removed} duplicate rows")
        else:
            logger.info("   ✅ No duplicates found")
        
        return df_clean
    
    def load_and_clean(self) -> pd.DataFrame:
        """Pipeline completo de limpieza"""
        logger.info("🚀 Starting data cleaning pipeline...")
        
        # 1. Cargar datos principales
        main_file = self.config.get('data', {}).get('files', {}).get('main', 'cleaned_animal_disease_prediction.csv')
        df = self.load_raw_data(main_file)
        
        # 2. Filtrar especies
        species = self.config.get('preprocessing', {}).get('species_filter', ['Dog', 'Cat'])
        df = self.filter_species(df, species)
        
        # 3. Eliminar duplicados
        df = self.remove_duplicates(df)
        
        # 4. Filtrar clases con pocas muestras
        target_col = self.config.get('preprocessing', {}).get('target_column', 'Disease_Prediction')
        min_samples = self.config.get('preprocessing', {}).get('min_samples_per_class', 5)
        df = self.filter_min_samples(df, target_col, min_samples)
        
        # 5. Manejar valores faltantes
        df = self.handle_missing_values(df)
        
        # 6. Estandarizar
        df = self.standardize_columns(df)
        
        # 7. Resetear índice
        df = df.reset_index(drop=True)
        
        # 8. Guardar datos limpios
        output_path = self.processed_dir / "cleaned_data.csv"
        df.to_csv(output_path, index=False)
        logger.info(f"💾 Cleaned data saved: {output_path}")
        
        logger.info(f"✅ Cleaning complete! Final shape: {df.shape}")
        
        # Mostrar resumen
        logger.info("\n📊 Final dataset summary:")
        logger.info(f"   Total records: {len(df)}")
        logger.info(f"   Features: {len(df.columns)}")
        logger.info(f"   Species: {df['Animal_Type'].unique().tolist()}")
        logger.info(f"   Diagnoses: {df[target_col].nunique()}")
        
        return df
