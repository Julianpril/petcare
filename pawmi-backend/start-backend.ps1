# Script para iniciar el backend de PawMI
Write-Host "🚀 Iniciando PawMI Backend..." -ForegroundColor Green

# Navegar al directorio del backend
Set-Location $PSScriptRoot

# Ruta al entorno virtual
$pythonPath = "C:/Users/julia/Dropbox/My PC (LAPTOP-LKGFJOOJ)/Downloads/petcare/.venv-py311/Scripts/python.exe"

Write-Host "📂 Directorio actual: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🐍 Python: $pythonPath" -ForegroundColor Cyan
Write-Host "🌐 Servidor: http://0.0.0.0:8000" -ForegroundColor Cyan
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Ejecutar uvicorn
& $pythonPath -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Write-Host "Backend detenido" -ForegroundColor Yellow
