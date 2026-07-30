@echo off
chcp 65001 >nul
title Desplegar VJ.Lab en Firebase
color 0A

echo ============================================
echo    🌿 VJ.Lab - Despliegue Automatico
echo ============================================
echo.

:: Ir a la carpeta del proyecto
cd /d "c:\Users\Propietario\Desktop\diseño de web vj"

echo [1/4] Agregando archivos nuevos...
git add extracted_files/checkout.html extracted_files/checkout.js extracted_files/products.html extracted_files/index.html extracted_files/admin.html extracted_files/admin-precios.html

echo [2/4] Eliminando archivos viejos...
git rm extracted_files/checkout-gel.html extracted_files/checkout-keratex.html extracted_files/checkout-mayoreo.html 2>nul

echo [3/4] Haciendo commit...
git commit -m "Unifica checkout + proteccion admin - despliegue automatico"

echo [4/4] Subiendo a GitHub...
git push origin main

echo.
echo ============================================
echo    ✅ GitHub actualizado correctamente
echo ============================================
echo.

echo [5/5] Desplegando en Firebase Hosting...
firebase deploy --only hosting

echo.
echo ============================================
echo    🚀 DESPLIEGUE COMPLETADO
echo ============================================
echo.
echo Tu sitio esta en:
echo    https://tu-project-id.web.app
echo.
echo Admin:      https://tu-project-id.web.app/admin.html
echo Precios:    https://tu-project-id.web.app/admin-precios.html
echo.
pause