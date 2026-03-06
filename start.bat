@echo off
REM NEAR Demo - Quick Start Script for Windows

echo ========================================
echo   NEAR Demo - Quick Start
echo ========================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo [!] File backend\.env khong ton tai!
    echo [i] Dang tao file .env tu .env.example...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo [!] Vui long edit file backend\.env voi:
    echo     - NEAR_CONTRACT_ID=kvstore.YOUR_ACCOUNT.testnet
    echo     - NEAR_MASTER_ACCOUNT=YOUR_ACCOUNT.testnet
    echo     - NEAR_MASTER_PRIVATE_KEY=ed25519:YOUR_KEY
    echo.
    echo Sau khi edit, chay lai script nay.
    pause
    exit /b 1
)

echo [1/3] Kiem tra Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [!] Docker chua duoc cai dat hoac khong chay!
    echo [i] Vui long cai dat Docker Desktop va chay lai.
    pause
    exit /b 1
)
echo     [OK] Docker da san sang

echo.
echo [2/3] Build Docker images...
docker-compose build

echo.
echo [3/3] Start services...
docker-compose up -d

echo.
echo ========================================
echo   App da san sang!
echo ========================================
echo.
echo   Frontend:  http://localhost:8080
echo   Backend:   http://localhost:3000
echo   API Docs:  http://localhost:3000/api/health
echo.
echo   De xem logs: docker-compose logs -f
echo   De stop:     docker-compose down
echo.
pause
