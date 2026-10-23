@echo off
title Desplegar VJ.Lab en Firebase
color 0A

echo ============================================
echo    VJ.Lab - Despliegue Automatico
echo ============================================
echo.

:: Ir a la carpeta del proyecto
cd /d "%~dp0"

echo [1/4] Agregando archivos...
git add extracted_files firestore.rules firebase.json DESPLEGAR.bat

echo [2/4] Haciendo commit...
git commit -m "Actualizacion web - despliegue automatico"

echo [3/4] Subiendo a GitHub...
git push origin main

echo.
echo [4/4] Desplegando en Firebase (sitio + reglas)...
call firebase deploy --only hosting,firestore:rules

echo.
echo ============================================
echo    LISTO - Revisa arriba si hubo errores
echo ============================================
echo.
echo Tu sitio esta en:
echo    https://web-viejito-john-20260720-01.web.app
echo.
echo Admin:      https://web-viejito-john-20260720-01.web.app/admin.html
echo Precios:    https://web-viejito-john-20260720-01.web.app/admin-precios.html
echo.
pause
