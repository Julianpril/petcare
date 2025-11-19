# 🐾 PawMI - Veterinary Diagnosis App with AI

PawMI es una aplicación móvil de diagnóstico veterinario con inteligencia artificial. Permite a dueños de mascotas obtener orientación médica rápida mediante un chat inteligente y diagnóstico automático basado en síntomas.

## 🚀 Tecnologías

- **Frontend**: React Native + Expo
- **Backend**: FastAPI + Python
- **ML**: PyCaret + scikit-learn
- **Base de datos**: PostgreSQL
- **Datos**: Synthetic data generation + Clinical validation

## 📁 Estructura del Proyecto

```
petcare/
├── pawmi-frontend/          # Aplicación móvil (React Native + Expo)
│   ├── app/                 # Screens y navegación
│   ├── components/          # Componentes reutilizables
│   ├── assets/              # Imágenes, fuentes, etc.
│   └── package.json
│
├── pawmi-backend/           # API REST (FastAPI)
│   ├── app/                 # Código de la API
│   ├── alembic/             # Migraciones de BD
│   └── requirements.txt
│
├── pawmi-ml/                # Machine Learning & Data
│   ├── data/                # Datasets (raw, processed, synthetic)
│   ├── models/              # Modelos entrenados
│   ├── scripts/             # Scripts de entrenamiento
│   └── notebooks/           # Jupyter notebooks
```

## 🎯 Quick Start

### Frontend (React Native/Expo)

```bash
cd pawmi-frontend
npm install
npx expo start
```

En la salida encontrarás opciones para abrir la app en:
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

### Backend (FastAPI)

```bash
cd pawmi-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Machine Learning

```bash
cd pawmi-ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Para entrenar modelo
python scripts/train_model.py
```

## 📊 Datasets

El proyecto incluye datasets validados para entrenamiento:
- **synthetic_validated.csv**: 5,000 registros sintéticos validados (PRINCIPAL)
- **cleaned_animal_disease_prediction.csv**: 431 casos reales
- Ver `pawmi-ml/DATASET_EVALUATION_REPORT.md` para más detalles

## 🧪 Características

- ✅ Diagnóstico de 10+ enfermedades veterinarias comunes
- ✅ Chat interactivo con IA
- ✅ Registro de mascotas y historial médico
- ✅ Sistema de recordatorios (vacunas, medicamentos)
- ✅ Integración con clínicas veterinarias

## 📚 Documentación

- Frontend: Ver `pawmi-frontend/README.md`
- Backend: Ver `pawmi-backend/README.md`
- ML: Ver `pawmi-ml/README.md` y `DATASET_EVALUATION_REPORT.md`

## 🛠️ Desarrollo

### Python Environment

El proyecto ML usa **Python 3.11** (requerido para PyCaret):
```bash
# Verificar que estés usando Python 3.11
python --version  # Debe mostrar 3.11.x

# Activar entorno
# Windows
.venv-py311\Scripts\activate
# macOS/Linux
source .venv-py311/bin/activate
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
