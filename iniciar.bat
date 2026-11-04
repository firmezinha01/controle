@echo off
title FluxoControl - Sistema de Controle de Entradas e Saidas
echo ========================================================
echo       INICIANDO FLUXOCONTROL - ENTRADAS E SAIDAS
echo ========================================================
echo.
echo Login Admin: admin
echo Senha:       123456
echo.
echo Abrindo o servidor e a aplicacao em http://localhost:3001 ...
echo.
start http://localhost:3001
npm start
pause
