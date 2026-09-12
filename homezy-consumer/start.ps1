# Homezy Consumer App - Start Script
# Runs Metro bundler on Port 8081 with LAN host binding for Expo Go scanning

Write-Host "Starting Homezy Consumer App on Port 8081 (LAN Mode)..." -ForegroundColor Green
Set-Location $PSScriptRoot

# Free port 8081 if occupied
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

npx expo start --port 8081 --host lan
