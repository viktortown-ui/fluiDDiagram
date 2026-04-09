@echo off

REM Run from repository root
cd /d "%~dp0"

echo Pulling latest changes...
git pull
if errorlevel 1 goto :error

echo Installing dependencies...
pnpm install
if errorlevel 1 goto :error

echo Starting FluidDiagram desktop app in development mode...
pnpm dev
exit /b 0

:error
echo.
echo Script stopped because a command failed.
exit /b 1
