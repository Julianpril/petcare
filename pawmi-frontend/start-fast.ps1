# Script para iniciar Expo más rápido sin validaciones
Write-Host "🚀 Iniciando Expo en modo rápido..." -ForegroundColor Cyan

# Desactivar validaciones que causan lentitud
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_DOTENV = "0"
$env:CI = "1"

# Iniciar Expo
npx expo start

Write-Host "✅ Expo iniciado" -ForegroundColor Green
