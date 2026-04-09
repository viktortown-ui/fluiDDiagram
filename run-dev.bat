@echo off

REM Run from repository root
cd /d "%~dp0"

echo Starting FluidDiagram desktop app in development mode...
pnpm dev
