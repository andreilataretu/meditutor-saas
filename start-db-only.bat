@echo off
echo Pornesc PostgreSQL in Docker...
docker run -d ^
  --name meditator-postgres ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=meditator ^
  -p 5432:5432 ^
  postgres:16-alpine

echo.
echo PostgreSQL porneste la localhost:5432
echo User: postgres
echo Password: postgres
echo Database: meditator
echo.
echo Asteapta 5 secunde ca PostgreSQL sa porneasca...
timeout /t 5 /nobreak

echo.
echo Gata! Continua cu backend: cd backend ^&^& npm install
