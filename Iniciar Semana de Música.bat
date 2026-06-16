@echo off
title Iniciar Semana de Música Cristã - Jijoca
cd /d "%~dp0"

:: Resolve o caminho curto (8.3) do diretório atual para evitar problemas de espaço inquebrável no Windows/Node
for %%I in ("%CD%") do set "SHORT_PATH=%%~sI"
cd /d "%SHORT_PATH%"

echo Iniciando o Servidor de Desenvolvimento no caminho: %SHORT_PATH%
start cmd /k npm run dev

echo Aguardando inicialização...
timeout /t 3 >nul

echo Abrindo o navegador...
start http://localhost:8085
