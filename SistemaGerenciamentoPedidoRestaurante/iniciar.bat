@echo off
REM Script de inicializacao da aplicacao GastroFlow para Windows
echo ===================================================
echo       Iniciando GastroFlow - Gestao Restaurante
echo ===================================================

if not exist ".env" (
    echo Criando arquivo .env a partir de .env.example...
    copy .env.example .env
)

if not exist "venv" (
    echo Criando ambiente virtual venv...
    python -m venv venv
)

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat
set PYTHONPATH=%CD%

echo Instalando / Atualizando dependencias...
pip install -r requirements.txt

echo Iniciando o servidor Streamlit...
streamlit run src\app.py

pause
