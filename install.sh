#!/bin/bash

echo "========================================"
echo "   MediTutor - Instalare Automată"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker nu este instalat!"
    echo "Te rog instalează Docker de pe: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose nu este instalat!"
    exit 1
fi

echo "[OK] Docker este instalat"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "[INFO] Creez fișierul .env..."
    cp .env.docker.example .env
    echo ""
    echo "========================================"
    echo "   IMPORTANT: Editează fișierul .env"
    echo "========================================"
    echo ""
    echo "Te rog deschide fișierul .env și schimbă:"
    echo "  - DB_PASSWORD: Parola pentru PostgreSQL"
    echo "  - JWT_SECRET: Secret pentru JWT (minim 32 caractere)"
    echo ""
    echo "Apasă Enter după ce ai editat .env..."
    read
fi

echo "[INFO] Pornesc serviciile Docker..."
docker-compose up -d

echo ""
echo "========================================"
echo "   Verificare Status"
echo "========================================"
echo ""
sleep 3
docker-compose ps

echo ""
echo "========================================"
echo "   MediTutor a fost instalat!"
echo "========================================"
echo ""
echo "Aplicația este disponibilă la:"
echo "  - Frontend:  http://localhost"
echo "  - Backend:   http://localhost:5000"
echo "  - Database:  localhost:5432"
echo ""
echo "Pentru a opri aplicația: docker-compose down"
echo "Pentru logs: docker-compose logs -f"
echo ""
echo "Consultă QUICKSTART.md pentru primii pași!"
echo ""
