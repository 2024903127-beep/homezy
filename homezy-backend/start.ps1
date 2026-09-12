# Homezy Backend API — Start Script
# Runs NestJS API strictly on Port 4000

Write-Host "Starting Homezy NestJS Backend API on Port 4000..." -ForegroundColor Magenta
Set-Location $PSScriptRoot

# Free port 4000 if occupied by dead node process
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

$env:PGPASSWORD = "postgres"
npm run start:dev
