@echo off
echo Creez baza de date meditator...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE meditator;" 2>nul
if %errorlevel% equ 0 (
    echo Baza de date creata cu succes!
) else (
    "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE meditator;" 2>nul
    if %errorlevel% equ 0 (
        echo Baza de date creata cu succes!
    ) else (
        "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE meditator;" 2>nul
        if %errorlevel% equ 0 (
            echo Baza de date creata cu succes!
        ) else (
            echo Eroare: Nu gasesc PostgreSQL. Verifica calea de instalare.
            pause
            exit /b 1
        )
    )
)
echo.
echo Gata! Baza de date este pregatita.
pause
