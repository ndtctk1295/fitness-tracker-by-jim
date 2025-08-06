@echo off
REM Simple batch wrapper for the PowerShell deployment script
REM This allows easy execution without worrying about PowerShell execution policies

echo Starting Fitness Tracker Deployment...
echo.

REM Check if PowerShell script exists
if not exist "deploy.ps1" (
    echo Error: deploy.ps1 not found in current directory
    echo Please ensure you're running this from the project root directory
    pause
    exit /b 1
)

REM Execute the PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "deploy.ps1" %*

REM Check if deployment was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Deployment completed successfully!
    echo Application should be available at: http://localhost:3000
) else (
    echo.
    echo Deployment failed! Please check the error messages above.
)

echo.
echo Press any key to continue...
pause >nul
