"""
Entrenador de modelos con PyCaret
Optimizado para datasets pequeños
"""
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from loguru import logger


# PyCaret solo se importa cuando se usa para evitar warnings iniciales
def get_pycaret():
    """Importa PyCaret de forma lazy"""
    try:
        import pycaret.classification as pc
        return {
            'setup': pc.setup,
            'compare_models': pc.compare_models,
            'tune_model': pc.tune_model,
            'ensemble_model': pc.ensemble_model,
            'blend_models': pc.blend_models,
            'create_model': pc.create_model,
            'finalize_model': pc.finalize_model,
            'save_model': pc.save_model,
            'predict_model': pc.predict_model,
            'pull': pc.pull
        }
    except ImportError as e:
        logger.error(f"❌ PyCaret no está instalado: {e}")
        logger.error("   Para instalar: pip install pycaret")
        raise ImportError("PyCaret is required but not installed. See requirements.txt")


class PyCaretTrainer:
    """
    Entrenador de modelos usando PyCaret
    Optimizado para datasets pequeños de diagnóstico veterinario
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Inicializa el entrenador
        
        Args:
            config: Configuración del modelo (desde YAML)
        """
        self.config = config
        self.model = None
        self.best_model = None
        self.experiment_name = config.get('training', {}).get('experiment_name', 'vet_diagnosis')
        self.pycaret: Optional[Dict[str, Any]] = None
        
    def setup_pycaret(
        self,
        data: pd.DataFrame,
        target: str = 'Disease_Prediction',
        session_id: int = 42
    ):
        """
        Configura el entorno de PyCaret
        
        Args:
            data: DataFrame de entrenamiento
            target: Nombre de la columna objetivo
            session_id: Semilla aleatoria
        """
        logger.info("🔧 Configurando PyCaret...")
        
        # Importar PyCaret
        self.pycaret = get_pycaret()
        
        # Configuración adaptada para dataset pequeño
        pycaret_config = self.config.get('pycaret', {}).get('setup', {})
        
        # Para datasets pequeños (<100 muestras), ajustamos parámetros
        n_samples = len(data)
        
        if n_samples < 100:
            logger.warning(f"⚠️ Dataset pequeño ({n_samples} muestras)")
            logger.info("   Ajustando parámetros para dataset pequeño...")
            
            # Reducir folds para evitar problemas con clases minoritarias
            fold = min(3, n_samples // 10)
            fold = max(2, fold)  # Mínimo 2 folds
        else:
            fold = pycaret_config.get('fold', 5)
        
        logger.info(f"   Usando {fold} folds para validación cruzada")
        
        # Configuración de PyCaret
        setup_params = {
            'data': data,
            'target': target,
            'session_id': session_id,
            'fold': fold,
            'verbose': False,
            'html': False,
            'silent': True,
            'log_experiment': False,
            'experiment_name': self.experiment_name,
        }
        
        # Parámetros adicionales solo si hay suficientes datos
        if n_samples >= 50:
            setup_params.update({
                'normalize': pycaret_config.get('normalize', True),
                'remove_multicollinearity': pycaret_config.get('remove_multicollinearity', False),
                'multicollinearity_threshold': pycaret_config.get('multicollinearity_threshold', 0.95),
                'fix_imbalance': pycaret_config.get('fix_imbalance', False),  # Desactivado por defecto para datasets pequeños
            })
        
        logger.info("   Parámetros de setup:")
        for key, value in setup_params.items():
            if key != 'data':
                logger.info(f"      {key}: {value}")
        
        # Ejecutar setup
        exp = self.pycaret['setup'](**setup_params)
        
        logger.info("✅ PyCaret configurado correctamente")
        return exp
    
    def train(
        self,
        train_data: pd.DataFrame,
        target: str = 'Disease_Prediction'
    ):
        """
        Entrena y selecciona el mejor modelo
        
        Args:
            train_data: DataFrame de entrenamiento
            target: Columna objetivo
        
        Returns:
            Mejor modelo entrenado
        """
        logger.info("🚀 Iniciando entrenamiento...")
        logger.info(f"   Dataset: {len(train_data)} muestras")
        logger.info(f"   Clases: {train_data[target].nunique()}")
        
        # Setup de PyCaret
        self.setup_pycaret(train_data, target)
        
        # Comparar modelos
        logger.info("\n📊 Comparando modelos...")
        compare_config = self.config.get('pycaret', {}).get('compare', {})
        
        n_select = compare_config.get('n_select', 3)
        sort_metric = compare_config.get('sort', 'F1')
        
        logger.info(f"   Seleccionando top {n_select} modelos por {sort_metric}")
        
        if self.pycaret is None:
            raise ValueError("PyCaret not initialized. Call setup_pycaret first.")
        
        # Para datasets pequeños, probar modelos simples
        if len(train_data) < 100:
            # Incluir solo modelos que funcionan bien con pocos datos
            include = ['lr', 'nb', 'knn', 'dt', 'rf']
            logger.info(f"   Modelos a probar: {include}")
            best_models = self.pycaret['compare_models'](
                include=include,
                n_select=n_select,
                sort=sort_metric,
                verbose=False
            )
        else:
            best_models = self.pycaret['compare_models'](
                n_select=n_select,
                sort=sort_metric,
                verbose=False
            )
        
        # Obtener resultados de comparación
        results = self.pycaret['pull']()
        logger.info("\n📈 Resultados de comparación:")
        logger.info(f"\n{results.to_string()}")
        
        # Seleccionar el mejor modelo
        if isinstance(best_models, list):
            self.best_model = best_models[0]
        else:
            self.best_model = best_models
        
        logger.info(f"\n✅ Mejor modelo: {type(self.best_model).__name__}")
        
        # Afinar hiperparámetros
        logger.info("\n🎯 Afinando hiperparámetros...")
        tune_config = self.config.get('pycaret', {}).get('tune', {})
        
        if self.pycaret is None:
            raise ValueError("PyCaret not initialized")
        
        try:
            self.model = self.pycaret['tune_model'](
                self.best_model,
                optimize=tune_config.get('optimize', 'F1'),
                n_iter=min(10, tune_config.get('n_iter', 50)),  # Reducir iteraciones para datasets pequeños
                verbose=False
            )
            
            tuned_results = self.pycaret['pull']()
            logger.info("\n📊 Resultados después de tuning:")
            logger.info(f"\n{tuned_results.to_string()}")
            
        except Exception as e:
            logger.warning(f"⚠️ Error en tuning: {e}")
            logger.info("   Usando modelo sin tuning")
            self.model = self.best_model
        
        logger.info("\n✅ Entrenamiento completado")
        return self.model
    
    def evaluate(self, test_data: pd.DataFrame) -> Dict[str, float]:
        """
        Evalúa el modelo en el conjunto de prueba
        
        Args:
            test_data: DataFrame de prueba
        
        Returns:
            Diccionario con métricas
        """
        logger.info("📈 Evaluando modelo...")
        
        if self.model is None:
            raise ValueError("Modelo no entrenado. Ejecuta train() primero.")
        
        if self.pycaret is None:
            raise ValueError("PyCaret not initialized")
        
        # Predicciones
        predictions = self.pycaret['predict_model'](self.model, data=test_data)
        
        # Extraer métricas
        from sklearn.metrics import (accuracy_score, classification_report,
                                     f1_score, precision_score, recall_score)
        
        y_true = test_data['Disease_Prediction']
        y_pred = predictions['prediction_label']
        
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision_macro': precision_score(y_true, y_pred, average='macro', zero_division=0),
            'recall_macro': recall_score(y_true, y_pred, average='macro', zero_division=0),
            'f1_macro': f1_score(y_true, y_pred, average='macro', zero_division=0),
        }
        
        logger.info("\n📊 Métricas de evaluación:")
        for metric, value in metrics.items():
            logger.info(f"   {metric}: {value:.4f}")
        
        # Reporte de clasificación detallado
        report = classification_report(y_true, y_pred, zero_division=0)
        logger.info(f"\n📋 Reporte de clasificación:\n{report}")
        
        return metrics
    
    def save_model(
        self,
        model_name: str = 'diagnosis_classifier',
        metrics: Optional[Dict[str, float]] = None
    ):
        """
        Guarda el modelo y sus metadatos
        
        Args:
            model_name: Nombre del modelo
            metrics: Métricas de evaluación
        """
        logger.info(f"💾 Guardando modelo: {model_name}...")
        
        if self.model is None:
            raise ValueError("Modelo no entrenado. Ejecuta train() primero.")
        
        if self.pycaret is None:
            raise ValueError("PyCaret not initialized")
        
        # Directorio de modelos
        models_dir = Path(self.config.get('models', {}).get('save_dir', 'models/saved_models'))
        models_dir.mkdir(parents=True, exist_ok=True)
        
        # Finalizar modelo (entrenar con todos los datos)
        logger.info("   Finalizando modelo con todos los datos...")
        final_model = self.pycaret['finalize_model'](self.model)
        
        # Guardar con PyCaret
        model_path = models_dir / model_name
        self.pycaret['save_model'](final_model, str(model_path))
        
        logger.info(f"   ✅ Modelo guardado: {model_path}.pkl")
        
        # Guardar metadatos
        metadata = {
            'model_name': model_name,
            'model_type': type(final_model).__name__,
            'training_date': pd.Timestamp.now().isoformat(),
            'metrics': metrics or {},
            'config': self.config
        }
        
        metadata_path = models_dir / f"{model_name}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"   ✅ Metadatos guardados: {metadata_path}")
        
        return model_path
