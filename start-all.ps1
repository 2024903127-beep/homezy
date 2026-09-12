# Homezy Platform - Master Start All Script
# Dedicated Ports:
#   Backend API:   4000
#   Admin Panel:   5173 (Next.js 14 Enterprise Console)
#   Consumer App:  8081
#   Partner App:   8082

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "         LAUNCHING HOMEZY PLATFORM               " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

# 1. Backend API (NestJS - Port 4000)
Write-Host "[1/4] Launching Backend API (Port 4000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\homezy-backend'; .\start.ps1"

# 2. Admin Panel (Next.js 14 - Port 5173)
Write-Host "[2/4] Launching Next.js Admin Console (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\homezy-admin-next'; .\start.ps1"

# 3. Consumer App (Expo - Port 8081)
Write-Host "[3/4] Launching Consumer App (Port 8081)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\homezy-consumer'; .\start.ps1"

# 4. Partner App (Expo - Port 8082)
Write-Host "[4/4] Launching Partner App (Port 8082)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\homezy-partner'; .\start.ps1"

Write-Host ""
Write-Host "All 4 services launched on dedicated ports! 🚀" -ForegroundColor Green
Write-Host "  - Backend API:    http://localhost:4000/v1" -ForegroundColor White
Write-Host "  - Swagger Docs:   http://localhost:4000/docs" -ForegroundColor White
Write-Host "  - Admin Panel:    http://localhost:5173 (Next.js 14 Enterprise Console)" -ForegroundColor White
Write-Host "  - Consumer App:   Port 8081 (exp://10.13.183.126:8081)" -ForegroundColor White
Write-Host "  - Partner App:    Port 8082 (exp://10.13.183.126:8082)" -ForegroundColor White
Write-Host ""