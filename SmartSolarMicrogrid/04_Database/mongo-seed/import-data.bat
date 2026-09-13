@echo off
echo ===================================================
echo Smart Solar Microgrid Trading System - DB Import
echo ===================================================
echo Importing seed data into MongoDB (SmartSolarDb)...

mongosh "mongodb://localhost:27017/SmartSolarDb" "%~dp0init-mongo.js"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] MongoDB initialized with all 4 collections!
) else (
    echo [WARNING] Direct mongosh execution failed. Trying legacy mongo CLI...
    mongo "mongodb://localhost:27017/SmartSolarDb" "%~dp0init-mongo.js"
)

echo Done.
pause
