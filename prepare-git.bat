@echo off
echo ==========================================
echo   MediTutor - Pregatire pentru Render
echo ==========================================
echo.

cd /d C:\MediTutor

echo [1/4] Verificare Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo EROARE: Git nu este instalat!
    echo Descarca Git de la: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo Git instalat: OK

echo.
echo [2/4] Initializare repository Git...
if not exist .git (
    git init
    echo Repository Git creat: OK
) else (
    echo Repository Git exista deja: OK
)

echo.
echo [3/4] Adaugare fisiere in Git...
git add .
if errorlevel 1 (
    echo EROARE la adaugare fisiere!
    pause
    exit /b 1
)
echo Fisiere adaugate: OK

echo.
echo [4/4] Commit initial...
git commit -m "Initial commit - MediTutor SaaS platform" >nul 2>&1
if errorlevel 1 (
    echo Commit deja existent sau nicio modificare
) else (
    echo Commit creat: OK
)

echo.
echo ==========================================
echo   URMATORUL PAS:
echo ==========================================
echo.
echo 1. Creaza un repository NOU pe GitHub:
echo    https://github.com/new
echo.
echo 2. Numele repository: meditutor-saas
echo    (sau alt nume la alegere)
echo.
echo 3. NU bifezi: "Initialize with README"
echo.
echo 4. Copiaza URL-ul repository-ului
echo    (ex: https://github.com/USERNAME/meditutor-saas.git)
echo.
echo 5. Ruleaza:
echo    git remote add origin URL-UL-TĂU
echo    git branch -M main
echo    git push -u origin main
echo.
echo 6. Mergi pe render.com si conecteaza repository-ul
echo.
echo ==========================================
pause
