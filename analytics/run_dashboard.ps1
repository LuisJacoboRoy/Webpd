# Script para ejecutar el Dashboard de Pinturas Diamante
Write-Host "Instalando dependencias necesarias..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "Procesando datos..." -ForegroundColor Cyan
python process_data.py

Write-Host "Iniciando Dashboard..." -ForegroundColor Cyan
streamlit run dashboard.py
