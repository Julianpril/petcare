from pathlib import Path

import pandas as pd
from loguru import logger
from sklearn.model_selection import train_test_split


class DataSplitter:
    """División estratificada de datos en train/val/test"""
    
    def __init__(self, config: dict):
        self.config = config
        self.test_size = config.get('preprocessing', {}).get('test_size', 0.2)
        self.val_size = config.get('preprocessing', {}).get('val_size', 0.1)
        self.random_state = config.get('preprocessing', {}).get('random_state', 42)
        self.target_col = config.get('preprocessing', {}).get('target_column', 'Disease_Prediction')
        self.processed_dir = Path(config.get('data', {}).get('processed_dir', 'data/processed'))
    
    def split(self, df: pd.DataFrame):
        """
        Divide datos en train/val/test con estratificación
        
        Args:
            df: DataFrame completo
        
        Returns:
            train_df, val_df, test_df
        """
        logger.info("✂️ Dividiendo datos en train/val/test...")
        
        # Verificar que el target existe
        if self.target_col not in df.columns:
            raise ValueError(f"Target column '{self.target_col}' not found in dataframe")
        
        # Check if dataset is too small for stratified split
        n_samples = len(df)
        n_classes = df[self.target_col].nunique()
        
        # Calculate actual split sizes
        test_samples = int(n_samples * self.test_size)
        val_samples = int(n_samples * self.val_size)
        
        # Para estratificación, necesitamos al menos tantas muestras como clases en cada split
        can_stratify = (test_samples >= n_classes and val_samples >= n_classes)
        
        if not can_stratify:
            logger.warning(f"⚠️ Dataset muy pequeño ({n_samples} muestras, {n_classes} clases)")
            logger.warning(f"   Test: {test_samples} muestras, Val: {val_samples} muestras")
            logger.warning(f"   Se necesitan al menos {n_classes} muestras en cada split para estratificación")
            logger.warning("   Usando división simple sin estratificación")
            
            # Simple split without stratification for very small datasets
            train_val, test = train_test_split(
                df,
                test_size=self.test_size,
                random_state=self.random_state,
                shuffle=True
            )
            
            val_size_adjusted = self.val_size / (1 - self.test_size)
            train, val = train_test_split(
                train_val,
                test_size=val_size_adjusted,
                random_state=self.random_state,
                shuffle=True
            )
        else:
            # Primero separar test con estratificación
            train_val, test = train_test_split(
                df,
                test_size=self.test_size,
                stratify=df[self.target_col],
                random_state=self.random_state
            )
            
            # Luego separar train y val con estratificación
            # Ajustar val_size relativo al conjunto train_val
            val_size_adjusted = self.val_size / (1 - self.test_size)
            
            train, val = train_test_split(
                train_val,
                test_size=val_size_adjusted,
                stratify=train_val[self.target_col],
                random_state=self.random_state
            )
        
        # Log distribution
        logger.info(f"   Train: {len(train)} ({len(train)/len(df)*100:.1f}%)")
        logger.info(f"   Val:   {len(val)} ({len(val)/len(df)*100:.1f}%)")
        logger.info(f"   Test:  {len(test)} ({len(test)/len(df)*100:.1f}%)")
        
        # Verificar distribución de clases
        logger.info("\n📊 Class distribution:")
        logger.info(f"   Train: {train[self.target_col].value_counts().to_dict()}")
        logger.info(f"   Val:   {val[self.target_col].value_counts().to_dict()}")
        logger.info(f"   Test:  {test[self.target_col].value_counts().to_dict()}")
        
        return train, val, test
    
    def save_splits(self, train: pd.DataFrame, val: pd.DataFrame, test: pd.DataFrame):
        """Guarda los splits en archivos CSV"""
        logger.info("💾 Saving splits to CSV...")
        
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        train_path = self.processed_dir / "train.csv"
        val_path = self.processed_dir / "val.csv"
        test_path = self.processed_dir / "test.csv"
        
        train.to_csv(train_path, index=False)
        val.to_csv(val_path, index=False)
        test.to_csv(test_path, index=False)
        
        logger.info(f"   ✅ Train saved: {train_path}")
        logger.info(f"   ✅ Val saved:   {val_path}")
        logger.info(f"   ✅ Test saved:  {test_path}")
        
        return train_path, val_path, test_path
