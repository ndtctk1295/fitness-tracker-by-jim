@echo off
echo Stopping and restarting the Next.js server to apply environment changes...
echo.

:: Kill any running Next.js server
taskkill /f /im node.exe /fi "WINDOWTITLE eq next*" 2>nul
echo Current Next.js processes terminated.
echo.

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Start the Next.js development server
echo Starting Next.js server with new environment variables...
echo.
echo Open your browser to http://localhost:3000/test/env-config to verify the configuration.
echo.
echo ---------------------------------------
cd /d "%~dp0.."
npm run dev
