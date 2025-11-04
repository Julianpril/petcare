"""
Validator - Fase 3: Validación de datos sintéticos
Verifica coherencia clínica de casos generados
"""
from typing import Dict, List, Tuple

import pandas as pd
from loguru import logger


class ClinicalValidator:
    """Valida coherencia clínica de datos sintéticos"""
    
    def __init__(self, profiles: Dict):
        """
        Args:
            profiles: Perfiles clínicos por diagnóstico
        """
        self.profiles = profiles
        self.validation_rules = self._define_validation_rules()
    
    def _define_validation_rules(self) -> Dict:
        """
        Define reglas de validación clínica
        
        Returns:
            Dict con reglas por diagnóstico
        """
        rules = {
            'Canine Parvovirus': {
                'required_bool_symptoms': ['Vomiting', 'Diarrhea'],  # AMBOS obligatorios
                'forbidden_bool_symptoms': [],  # No es respiratorio
                'species': ['Dog'],
                'age_range': (0.5, 12),
                'temp_range': (39.0, 41.0),
                'typical_symptoms': ['Lethargy', 'Vomiting', 'Diarrhea']  # Para Symptom_1-4
            },
            'Kennel Cough': {
                'required_bool_symptoms': ['Coughing'],  # Obligatorio
                'forbidden_bool_symptoms': [],
                'species': ['Dog'],
                'temp_range': (38.5, 40.0),
                'typical_symptoms': ['Coughing', 'Nasal Discharge', 'Lethargy']
            },
            'Canine Distemper': {
                'required_bool_symptoms': ['Nasal_Discharge'],
                'forbidden_bool_symptoms': [],
                'species': ['Dog'],
                'temp_range': (39.0, 41.0),
                'typical_symptoms': ['Fever', 'Nasal Discharge', 'Coughing', 'Lethargy']
            },
            'Feline Calicivirus': {
                'required_bool_symptoms_or': ['Coughing', 'Nasal_Discharge'],  # Al menos uno
                'forbidden_bool_symptoms': [],
                'species': ['Cat'],
                'temp_range': (38.5, 40.0),
                'typical_symptoms': ['Coughing', 'Nasal Discharge', 'Eye Discharge', 'Sneezing']
            },
            'Feline Infectious Peritonitis': {
                'required_bool_symptoms': ['Appetite_Loss'],
                'forbidden_bool_symptoms': [],
                'species': ['Cat'],
                'temp_range': (38.5, 40.0),
                'typical_symptoms': ['Lethargy', 'Appetite Loss', 'Vomiting', 'Fever']
            },
            'Feline Herpesvirus': {
                'required_bool_symptoms_or': ['Coughing', 'Nasal_Discharge', 'Eye_Discharge'],
                'forbidden_bool_symptoms': [],
                'species': ['Cat'],
                'temp_range': (38.5, 40.0),
                'typical_symptoms': ['Coughing', 'Nasal Discharge', 'Eye Discharge', 'Sneezing']
            },
            'Feline Leukemia Virus': {
                'required_bool_symptoms': ['Appetite_Loss'],
                'forbidden_bool_symptoms': [],
                'species': ['Cat'],
                'temp_range': (38.0, 40.0),
                'typical_symptoms': ['Lethargy', 'Appetite Loss', 'Weight Loss']
            },
            'Gastroenteritis': {
                'required_bool_symptoms_or': ['Vomiting', 'Diarrhea'],  # Al menos uno
                'forbidden_bool_symptoms': [],
                'temp_range': (38.5, 40.0),
                'typical_symptoms': ['Vomiting', 'Diarrhea', 'Lethargy', 'Appetite Loss']
            },
            'Parvovirus': {
                'required_bool_symptoms': ['Vomiting', 'Diarrhea'],  # AMBOS obligatorios
                'forbidden_bool_symptoms': [],
                'species': ['Dog'],
                'temp_range': (39.0, 41.0),
                'typical_symptoms': ['Vomiting', 'Diarrhea', 'Lethargy', 'Bloody Stool']
            },
            'Canine Leptospirosis': {
                'required_bool_symptoms': ['Appetite_Loss'],
                'forbidden_bool_symptoms': [],
                'species': ['Dog'],
                'temp_range': (39.5, 41.5),
                'typical_symptoms': ['Fever', 'Lethargy', 'Vomiting', 'Muscle Pain']
            }
        }
        
        return rules
    
    def validate_case(self, case: pd.Series) -> Tuple[bool, List[str]]:
        """
        Valida un caso individual
        
        Args:
            case: Serie con datos del caso
        
        Returns:
            Tuple (is_valid, errors)
        """
        errors = []
        diagnosis = case.get('Disease_Prediction', '')
        
        # Validaciones de tipos de datos
        type_errors = self._validate_data_types(case)
        errors.extend(type_errors)
        
        # Validaciones generales
        # 1. Edad razonable
        age = case.get('Age', 0)
        if age < 0 or age > 25:
            errors.append(f"Edad fuera de rango: {age}")
        
        # 2. Peso razonable
        weight = case.get('Weight', 0)
        if weight < 0.5 or weight > 100:
            errors.append(f"Peso fuera de rango: {weight}")
        
        # 3. Temperatura corporal razonable
        temp = case.get('Body_Temperature', 0)
        if temp < 36.0 or temp > 42.0:
            errors.append(f"Temperatura fuera de rango: {temp}°C")
        
        # 4. Frecuencia cardíaca razonable
        hr = case.get('Heart_Rate', 0)
        if hr < 40 or hr > 200:
            errors.append(f"Frecuencia cardíaca fuera de rango: {hr}")
        
        # Validaciones específicas por diagnóstico
        if diagnosis in self.validation_rules:
            rules = self.validation_rules[diagnosis]
            
            # Verificar especies permitidas
            if 'species' in rules:
                species = case.get('Animal_Type', '')
                if species not in rules['species']:
                    errors.append(f"{diagnosis} no ocurre en {species}")
            
            # Verificar síntomas booleanos obligatorios (TODOS)
            if 'required_bool_symptoms' in rules:
                for symptom in rules['required_bool_symptoms']:
                    if not case.get(symptom, False):
                        errors.append(f"{diagnosis} requiere {symptom}")
            
            # Verificar síntomas booleanos obligatorios (AL MENOS UNO)
            if 'required_bool_symptoms_or' in rules:
                has_any = any(
                    case.get(symptom, False)
                    for symptom in rules['required_bool_symptoms_or']
                )
                if not has_any:
                    symptoms_list = ', '.join(rules['required_bool_symptoms_or'])
                    errors.append(f"{diagnosis} requiere al menos uno: {symptoms_list}")
            
            # Verificar síntomas prohibidos
            if 'forbidden_bool_symptoms' in rules:
                for symptom in rules['forbidden_bool_symptoms']:
                    if case.get(symptom, False):
                        errors.append(f"{diagnosis} no debería tener {symptom}")
            
            # Verificar rango de edad específico
            if 'age_range' in rules:
                age_min, age_max = rules['age_range']
                if not (age_min <= age <= age_max):
                    errors.append(f"Edad {age} fuera de rango típico para {diagnosis}")
            
            # Verificar rango de temperatura específico
            if 'temp_range' in rules:
                temp_min, temp_max = rules['temp_range']
                if not (temp_min <= temp <= temp_max):
                    errors.append(f"Temperatura {temp}°C atípica para {diagnosis}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def validate_batch(
        self,
        df: pd.DataFrame,
        strict: bool = False
    ) -> Tuple[pd.DataFrame, pd.DataFrame, Dict]:
        """
        Valida lote completo de datos
        
        Args:
            df: DataFrame a validar
            strict: Si True, rechaza casos con cualquier error
        
        Returns:
            Tuple (valid_df, rejected_df, stats)
        """
        logger.info(f"🔍 Validando {len(df)} casos sintéticos...")
        
        valid_cases = []
        rejected_cases = []
        rejection_reasons = []
        
        for idx, row in df.iterrows():
            is_valid, errors = self.validate_case(row)
            
            if is_valid or (not strict and len(errors) <= 1):
                valid_cases.append(row)
            else:
                rejected_cases.append(row)
                rejection_reasons.append({
                    'index': idx,
                    'diagnosis': row.get('Disease_Prediction', ''),
                    'errors': errors
                })
        
        df_valid = pd.DataFrame(valid_cases)
        df_rejected = pd.DataFrame(rejected_cases)
        
        stats = {
            'total': len(df),
            'valid': len(df_valid),
            'rejected': len(df_rejected),
            'acceptance_rate': len(df_valid) / len(df) if len(df) > 0 else 0,
            'rejection_reasons': rejection_reasons
        }
        
        logger.info(f"✅ Válidos: {stats['valid']} ({stats['acceptance_rate']*100:.1f}%)")
        logger.info(f"❌ Rechazados: {stats['rejected']}")
        
        return df_valid, df_rejected, stats
    
    def _validate_data_types(self, case: pd.Series) -> List[str]:
        """
        Valida que los tipos de datos sean correctos
        
        Args:
            case: Serie con datos del caso
        
        Returns:
            Lista de errores de tipo
        """
        errors = []
        
        # 1. Age debe ser entero positivo
        age = case.get('Age')
        if age is not None:
            if not isinstance(age, (int, float)):
                errors.append(f"Age debe ser numérico, recibido: {type(age)}")
            elif isinstance(age, float) and not age.is_integer():
                errors.append(f"Age debe ser entero, recibido: {age}")
            elif age < 0:
                errors.append(f"Age debe ser positivo, recibido: {age}")
        
        # 2. Weight debe ser numérico positivo
        weight = case.get('Weight')
        if weight is not None:
            if not isinstance(weight, (int, float)):
                errors.append(f"Weight debe ser numérico, recibido: {type(weight)}")
            elif weight < 0:
                errors.append(f"Weight debe ser positivo, recibido: {weight}")
        
        # 3. Body_Temperature debe ser numérico
        temp = case.get('Body_Temperature')
        if temp is not None:
            if not isinstance(temp, (int, float)):
                errors.append(f"Body_Temperature debe ser numérico, recibido: {type(temp)}")
        
        # 4. Heart_Rate debe ser entero positivo
        hr = case.get('Heart_Rate')
        if hr is not None:
            if not isinstance(hr, (int, float)):
                errors.append(f"Heart_Rate debe ser numérico, recibido: {type(hr)}")
            elif isinstance(hr, float) and not hr.is_integer():
                errors.append(f"Heart_Rate debe ser entero, recibido: {hr}")
            elif hr < 0:
                errors.append(f"Heart_Rate debe ser positivo, recibido: {hr}")
        
        # 5. Columnas booleanas
        bool_cols = [
            'Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing',
            'Labored_Breathing', 'Lameness', 'Skin_Lesions',
            'Nasal_Discharge', 'Eye_Discharge'
        ]
        for col in bool_cols:
            val = case.get(col)
            if val is not None and not isinstance(val, (bool, int)):
                errors.append(f"{col} debe ser booleano, recibido: {type(val)}")
        
        # 6. Columnas de texto no vacías
        str_cols = ['Animal_Type', 'Breed', 'Gender', 'Disease_Prediction']
        for col in str_cols:
            val = case.get(col)
            if val is None or (isinstance(val, str) and len(val.strip()) == 0):
                errors.append(f"{col} no puede estar vacío")
        
        return errors
