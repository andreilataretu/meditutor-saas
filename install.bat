@echo off
echo ========================================
echo    MediTutor - Instalare Automata
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker nu este instalat!
    echo Te rog instaleaza Docker Desktop de pe: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose nu este instalat!
    pause
    exit /b 1
)

echo [OK] Docker este instalat
echo.

REM Check if .env exists
if not exist .env (
    echo [INFO] Creez fisierul .env...
    copy .env.docker.example .env >nul
    echo.
    echo ========================================
    echo   IMPORTANT: Editeaza fisierul .env
    echo ========================================
    echo.
    echo Te rog deschide fisierul .env si schimba:
    echo   - DB_PASSWORD: Parola pentru PostgreSQL
    echo   - JWT_SECRET: Secret pentru JWT ^(minim 32 caractere^)
    echo.
    notepad .env
    echo.
    echo Ai editat fisierul .env? ^(apasa orice tasta pentru a continua^)
    pause >nul
)

echo [INFO] Pornesc serviciile Docker...
docker-compose up -d

echo.
echo ========================================
echo   Verificare Status
echo ========================================
echo.
timeout /t 3 /nobreak >nul
docker-compose ps

echo.
echo ========================================
echo   MediTutor a fost instalat!
echo ========================================
echo.
echo Aplicatia este disponibila la:
echo   - Frontend:  http://localhost
echo   - Backend:   http://localhost:5000
echo   - Database:  localhost:5432
echo.
echo Pentru a opri aplicatia: docker-compose down
echo Pentru logs: docker-compose logs -f
echo.
echo Consulta QUICKSTART.md pentru primii pasi!
echo.
pause
