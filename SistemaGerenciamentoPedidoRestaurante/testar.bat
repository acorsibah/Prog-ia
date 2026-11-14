@echo off
REM Script de execucao dos testes automatizados com pytest
echo ===================================================
echo       Executando Testes Automatizados - pytest
echo ===================================================

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
set PYTHONPATH=%CD%

pytest -v tests\

pause
