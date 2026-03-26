@echo off
set PORT=8080
if not "%~1"=="" set PORT=%~1

cd /d "%~dp0"

echo Starting Sky Runner 3D on http://localhost:%PORT%/
echo Press Ctrl+C to stop.
start "" "http://localhost:%PORT%/"

python -m http.server %PORT%
if errorlevel 1 py -m http.server %PORT%
