# Homezy Partner App - Start Script
# Runs Metro bundler on Port 8082 with LAN host binding for Expo Go scanning

Write-Host "Starting Homezy Partner App on Port 8082 (LAN Mode)..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Free port 8082 if occupied
Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

npx expo start --port 8082 --host lan