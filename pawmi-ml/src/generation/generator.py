"""
Generator - Fase 2: Generación de datos sintéticos
Genera nuevos casos usando CTGAN entrenado
"""
import random
from typing import Any, Dict, List

import pandas as pd
from loguru import logger


class CTGANGenerator:
    """Genera datos sintéticos usando CTGAN"""
    
    def __init__(self, learner):
        """
        Args:
            learner: Instancia de VetDataLearner con CTGAN entrenado
        """
        self.learner = learner
        
        if self.learner.ctgan is None:
            raise ValueError("CTGAN no está entrenado. Ejecuta learner.learn_statistical_patterns() primero")
    
    def generate_balanced_dataset(
        self, 
        total_samples: int = 5000,
        balance_strategy: str = "proportional"
    ) -> pd.DataFrame:
        """
        Genera dataset balanceado
        
        Args:
            total_samples: Total de muestras a generar
            balance_strategy: 
                - 'proportional': mantiene proporción original
                - 'uniform': distribuye uniformemente entre clases
        
        Returns:
            DataFrame con datos sintéticos
        """
        logger.info(f"🔮 Generando {total_samples} casos sintéticos...")
        
        if balance_strategy == "uniform":
            # Distribuir uniformemente
            diagnoses = self.learner.df_real['Disease_Prediction'].unique()
            samples_per_class = total_samples // len(diagnoses)
            
            synthetic_dfs = []
            for diagnosis in diagnoses:
                logger.info(f"   Generando {samples_per_class} casos de: {diagnosis}")
                
                try:
                    # Generar condicionado por diagnóstico
                    synthetic = self.learner.ctgan.sample_remaining_columns(
                        known_columns={'Disease_Prediction': diagnosis},
                        num_rows=samples_per_class
                    )
                    synthetic_dfs.append(synthetic)
                except Exception as e:
                    logger.warning(f"   ⚠️ Error generando {diagnosis}: {e}")
            
            # Combinar todos
            if synthetic_dfs:
                df_synthetic = pd.concat(synthetic_dfs, ignore_index=True)
            else:
                df_synthetic = pd.DataFrame()
        
        else:  # proportional
            # Generar sin restricciones (mantiene proporción original)
            df_synthetic = self.learner.ctgan.sample(num_rows=total_samples)
        
        logger.info(f"✅ Generados {len(df_synthetic)} casos sintéticos")
        
        return df_synthetic
    
    def generate_for_diagnosis(
        self,
        diagnosis: str,
        n_samples: int
    ) -> pd.DataFrame:
        """
        Genera casos para un diagnóstico específico
        
        Args:
            diagnosis: Nombre del diagnóstico
            n_samples: Número de muestras
        
        Returns:
            DataFrame con casos sintéticos
        """
        logger.info(f"🔮 Generando {n_samples} casos de: {diagnosis}")
        
        synthetic = self.learner.ctgan.sample_remaining_columns(
            known_columns={'Disease_Prediction': diagnosis},
            num_rows=n_samples
        )
        
        return synthetic


class SimpleAugmenter:
    """
    Generador simple sin CTGAN (para cuando no está disponible)
    Usa permutaciones controladas de datos reales
    """
    
    def __init__(self, df_real: pd.DataFrame, profiles: Dict):
        self.df_real = df_real
        self.profiles = profiles
        self.rng = random.Random(42)
        self.clinical_rules = self._load_clinical_rules()
    
    def generate_by_permutation(
        self,
        total_samples: int = 5000
    ) -> pd.DataFrame:
        """
        Genera datos por permutación controlada
        
        Args:
            total_samples: Total de muestras a generar
        
        Returns:
            DataFrame con datos sintéticos
        """
        logger.info(f"🔄 Generando {total_samples} casos por permutación...")
        
        synthetic_cases = []
        
        diagnoses = self.df_real['Disease_Prediction'].unique()
        samples_per_class = total_samples // len(diagnoses)
        
        for diagnosis in diagnoses:
            df_dx = self.df_real[self.df_real['Disease_Prediction'] == diagnosis]
            profile = self.profiles.get(diagnosis, {})
            
            for _ in range(samples_per_class):
                # Tomar caso base aleatorio
                base_case = df_dx.sample(1, random_state=self.rng.randint(0, 10000)).iloc[0].to_dict()
                
                # Permutar ligeramente valores numéricos
                if 'Age' in base_case:
                    age_range = profile.get('age_range', (1, 15))
                    base_case['Age'] = self.rng.uniform(age_range[0], age_range[1])
                
                if 'Weight' in base_case:
                    weight_range = profile.get('weight_range', (5, 40))
                    base_case['Weight'] = self.rng.uniform(weight_range[0], weight_range[1])
                
                if 'Body_Temperature' in base_case:
                    temp_range = profile.get('temp_range', (38.0, 40.5))
                    base_case['Body_Temperature'] = self.rng.uniform(temp_range[0], temp_range[1])
                
                if 'Heart_Rate' in base_case:
                    hr_range = profile.get('heart_rate_range', (60, 140))
                    base_case['Heart_Rate'] = self.rng.randint(hr_range[0], hr_range[1])
                
                # Permutar síntomas con probabilidades del perfil
                symptom_probs = profile.get('symptom_probabilities', {})
                for symptom, prob in symptom_probs.items():
                    if symptom in base_case:
                        base_case[symptom] = self.rng.random() < prob
                
                # FORZAR síntomas obligatorios según reglas clínicas
                base_case = self._enforce_clinical_rules(base_case, diagnosis)
                
                synthetic_cases.append(base_case)
        
        df_synthetic = pd.DataFrame(synthetic_cases)
        logger.info(f"✅ Generados {len(df_synthetic)} casos por permutación")
        
        return df_synthetic
    
    def _load_clinical_rules(self) -> Dict:
        """
        Define reglas clínicas obligatorias por diagnóstico
        """
        return {
            'Canine Parvovirus': {
                'required_symptoms': ['Vomiting', 'Diarrhea'],  # AMBOS obligatorios
                'species': 'Dog',
                'forbidden_symptoms': []
            },
            'Parvovirus': {
                'required_symptoms': ['Vomiting', 'Diarrhea'],  # AMBOS obligatorios
                'species': 'Dog',
                'forbidden_symptoms': []
            },
            'Kennel Cough': {
                'required_symptoms': ['Coughing'],  # Obligatorio
                'species': 'Dog',
                'forbidden_symptoms': []
            },
            'Canine Distemper': {
                'required_symptoms': ['Nasal_Discharge'],
                'species': 'Dog',
                'forbidden_symptoms': []
            },
            'Feline Calicivirus': {
                'required_symptoms_or': ['Coughing', 'Nasal_Discharge'],  # Al menos uno
                'species': 'Cat',
                'forbidden_symptoms': []
            },
            'Feline Herpesvirus': {
                'required_symptoms_or': ['Coughing', 'Nasal_Discharge', 'Eye_Discharge'],
                'species': 'Cat',
                'forbidden_symptoms': []
            },
            'Feline Infectious Peritonitis': {
                'required_symptoms': ['Appetite_Loss'],
                'species': 'Cat',
                'forbidden_symptoms': []
            },
            'Feline Leukemia Virus': {
                'required_symptoms': ['Appetite_Loss'],
                'species': 'Cat',
                'forbidden_symptoms': []
            },
            'Gastroenteritis': {
                'required_symptoms_or': ['Vomiting', 'Diarrhea'],  # Al menos uno
                'forbidden_symptoms': []
            },
            'Canine Leptospirosis': {
                'required_symptoms': ['Appetite_Loss'],
                'species': 'Dog',
                'forbidden_symptoms': []
            }
        }
    
    def _enforce_clinical_rules(self, case: Dict, diagnosis: str) -> Dict:
        """
        Fuerza cumplimiento de reglas clínicas
        
        Args:
            case: Caso generado
            diagnosis: Diagnóstico
        
        Returns:
            Caso con reglas aplicadas
        """
        if diagnosis not in self.clinical_rules:
            return case
        
        rules = self.clinical_rules[diagnosis]
        
        # 1. FORZAR especie correcta
        if 'species' in rules:
            case['Animal_Type'] = rules['species']
        
        # 2. FORZAR síntomas obligatorios (TODOS)
        if 'required_symptoms' in rules:
            for symptom in rules['required_symptoms']:
                if symptom in case:
                    case[symptom] = True
        
        # 3. FORZAR síntomas obligatorios (AL MENOS UNO)
        if 'required_symptoms_or' in rules:
            symptoms = rules['required_symptoms_or']
            # Verificar si ya tiene al menos uno
            has_any = any(case.get(s, False) for s in symptoms)
            if not has_any:
                # Activar el primero
                if symptoms[0] in case:
                    case[symptoms[0]] = True
        
        # 4. DESACTIVAR síntomas prohibidos
        if 'forbidden_symptoms' in rules:
            for symptom in rules['forbidden_symptoms']:
                if symptom in case:
                    case[symptom] = False
        
        return case
