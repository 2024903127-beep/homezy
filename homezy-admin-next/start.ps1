# Homezy Admin Web Console (Next.js 14) — Start Script
# Runs strictly on Port 5173

Write-Host "Starting Homezy Next.js Admin Panel on Port 5173..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

# Free port 5173 if occupied
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

npx next dev -p 5173
