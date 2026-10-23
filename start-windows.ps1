# VideoVault HD - PowerShell Launcher for Windows 11
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "VideoVault HD — Локальная Видеотека Windows"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "        VideoVault HD — Локальная Видеотека Windows" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ОШИБКА] Node.js не найден в системе!" -ForegroundColor Red
    Write-Host "Установите Node.js с официального сайта: https://nodejs.org"
    Read-Host "Нажмите Enter для выхода..."
    exit 1
}

$nodeVersion = node -v
Write-Host "[✓] Node.js обнаружен: $nodeVersion" -ForegroundColor Green

# 2. Check Target Folder
$targetFolder = "D:\QIZLAR BAZMI HD"
if (Test-Path $targetFolder) {
    Write-Host "[✓] Исходная папка найдена: $targetFolder" -ForegroundColor Green
} else {
    Write-Host "[!] Внимание: Папка '$targetFolder' не обнаружена." -ForegroundColor Yellow
    Write-Host "[!] Вы можете изменить путь к папке в файле .env (параметр VIDEO_DIR)." -ForegroundColor Yellow
}

# 3. Check Dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Установка базовых зависимостей..." -ForegroundColor Cyan
    npm install
}
if (-not (Test-Path "server\node_modules")) {
    Write-Host "[*] Установка зависимостей сервера..." -ForegroundColor Cyan
    npm --prefix server install
}
if (-not (Test-Path "client\node_modules")) {
    Write-Host "[*] Установка зависимостей интерфейса..." -ForegroundColor Cyan
    npm --prefix client install
}

Write-Host ""
Write-Host "[*] Запуск VideoVault HD..." -ForegroundColor Cyan
Write-Host "[*] Открытие браузера: http://127.0.0.1:5173" -ForegroundColor Green
Write-Host ""

# Open browser
Start-Process "http://127.0.0.1:5173"

# Run development server
npm run dev
