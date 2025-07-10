@echo off
echo Fitness Tracker Update Script
echo ==============================

:: Install missing TypeScript type definitions
echo Installing @types/bcrypt package...
call yarn add --dev @types/bcrypt

:: Fix any Typescript errors
echo Running type checking...
call yarn tsc --noEmit

echo Update completed!
