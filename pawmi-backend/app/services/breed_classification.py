import io
import logging
from typing import Any, Dict, List, Optional

import torch
from fastapi import HTTPException, UploadFile
from PIL import Image
from transformers import (AutoImageProcessor, AutoModelForImageClassification,
                          pipeline)

logger = logging.getLogger(__name__)

class BreedClassificationService:
    """
    Servicio para clasificar razas de mascotas usando el modelo ViT de Hugging Face
    """
    
    def __init__(self):
        self.model_name = "ISxOdin/vit-base-oxford-iiit-pets"
        self.processor = None
        self.model = None
        self.pipeline = None
        self.model_loaded = False
        # NO cargar modelo automáticamente, hacerlo bajo demanda
        # self._initialize_model()
    
    def _initialize_model(self):
        """Carga el modelo bajo demanda (lazy loading)"""
        if self.model_loaded:
            return True
            
        try:
            logger.info(f"Cargando modelo de clasificación de razas: {self.model_name}")
            
            # Método 1: Pipeline (más fácil)
            self.pipeline = pipeline(
                "image-classification", 
                model=self.model_name,
                top_k=3  # Cambiado de return_top_k a top_k
            )
            
            # Método 2: Carga directa (para más control)
            self.processor = AutoImageProcessor.from_pretrained(self.model_name)
            self.model = AutoModelForImageClassification.from_pretrained(self.model_name)
            
            self.model_loaded = True
            logger.info("✅ Modelo de clasificación de razas cargado exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error al cargar el modelo: {e}")
            self.model_loaded = False
            return False
    
    async def classify_breed_from_upload(self, file: UploadFile) -> List[Dict[str, Any]]:
        """
        Clasificar la raza desde un archivo subido
        
        Args:
            file: Archivo de imagen subido
            
        Returns:
            List[Dict]: Top 3 predicciones con score y label
        """
        try:
            # Inicializar modelo si no está cargado (lazy loading)
            if not self.model_loaded:
                success = self._initialize_model()
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail="No se pudo inicializar el modelo de clasificación"
                    )
            
            # Validar tipo de archivo
            if not file.content_type or not file.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=400,
                    detail="El archivo debe ser una imagen (JPEG, PNG, etc.)"
                )
            
            # Leer y procesar imagen
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            
            # Convertir a RGB si es necesario
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Clasificar usando pipeline
            if self.pipeline is None:
                raise HTTPException(
                    status_code=500,
                    detail="El modelo de clasificación no está inicializado"
                )
            
            results = self.pipeline(image)
            
            # Formatear resultados
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "breed": self._format_breed_name(result['label']),
                    "confidence": round(result['score'] * 100, 2),
                    "raw_label": result['label']
                })
            
            logger.info(f"✅ Clasificación completada: {len(formatted_results)} predicciones")
            return formatted_results
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Error en clasificación: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error al clasificar la imagen: {str(e)}"
            )
    
    def classify_breed_from_image(self, image: Image.Image) -> List[Dict[str, Any]]:
        """
        Clasificar la raza desde una imagen PIL
        
        Args:
            image: Imagen PIL
            
        Returns:
            List[Dict]: Top 3 predicciones
        """
        try:
            # Inicializar modelo si no está cargado (lazy loading)
            if not self.model_loaded:
                success = self._initialize_model()
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail="No se pudo inicializar el modelo de clasificación"
                    )
            
            # Convertir a RGB si es necesario
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Clasificar
            if self.pipeline is None:
                raise HTTPException(
                    status_code=500,
                    detail="El modelo de clasificación no está inicializado"
                )
            
            results = self.pipeline(image)
            
            # Formatear resultados
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "breed": self._format_breed_name(result['label']),
                    "confidence": round(result['score'] * 100, 2),
                    "raw_label": result['label']
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Error en clasificación: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error al clasificar la imagen: {str(e)}"
            )
    
    def _format_breed_name(self, raw_label: str) -> str:
        """
        Formatear el nombre de la raza para que sea más legible
        
        Args:
            raw_label: Etiqueta raw del modelo
            
        Returns:
            str: Nombre formateado
        """
        # El modelo oxford-iiit-pets suele retornar nombres como "bengal_cat" o "golden_retriever"
        # Vamos a limpiar y formatear estos nombres
        
        # Remover sufijos comunes
        formatted = raw_label.lower()
        
        # Remover "_cat" o "_dog" si están presentes
        formatted = formatted.replace('_cat', '').replace('_dog', '')
        
        # Reemplazar guiones bajos con espacios
        formatted = formatted.replace('_', ' ')
        
        # Capitalizar cada palabra
        formatted = ' '.join(word.capitalize() for word in formatted.split())
        
        # Casos especiales conocidos
        breed_mapping = {
            'Golden Retriever': 'Golden Retriever',
            'Bengal': 'Gato Bengal',
            'Persian': 'Gato Persa',
            'Siamese': 'Gato Siamés',
            'Maine Coon': 'Maine Coon',
            'British Shorthair': 'British Shorthair',
            'Ragdoll': 'Gato Ragdoll',
            'Labrador': 'Labrador Retriever',
            'German Shepherd': 'Pastor Alemán',
            'Bulldog': 'Bulldog',
            'Poodle': 'Poodle',
            'Husky': 'Husky Siberiano'
        }
        
        return breed_mapping.get(formatted, formatted)
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Obtener información del modelo cargado
        
        Returns:
            Dict: Información del modelo
        """
        return {
            "model_name": self.model_name,
            "model_type": "Vision Transformer (ViT)",
            "dataset": "Oxford-IIIT Pet Dataset",
            "supported_classes": "37 razas de perros y gatos",
            "input_format": "RGB images",
            "top_predictions": 3
        }

# Instancia global del servicio
breed_classifier = BreedClassificationService()