@echo off
setlocal
cd /d "%~dp0"
title Traqueur Spider-Man

echo.
echo ==============================================
echo         TRAQUEUR SPIDER-MAN - LANCEMENT
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe sur ce PC.
  echo Installe Node.js depuis nodejs.org puis relance ce fichier.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Premiere ouverture : installation des dependances...
  echo Cela peut prendre une ou deux minutes.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERREUR] L'installation a echoue.
    pause
    exit /b 1
  )
)

echo.
echo Lancement du site...
echo Une page va s'ouvrir automatiquement dans ton navigateur.
echo Garde cette fenetre ouverte tant que tu utilises le site.
echo.
call npm run dev

endlocal
