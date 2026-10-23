@echo off
chcp 65001 >nul
title VideoVault HD — Сервер Видеотеки Windows

echo.
echo ============================================================
echo         VideoVault HD — Локальная Видеотека Windows
echo ============================================================
echo.

:: 1. Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден в системе!
    echo Установите Node.js с официального сайта: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js обнаружен:
node -v
echo.

:: 2. Проверка исходной папки
if exist "D:\QIZLAR BAZMI HD" (
    echo [✓] Исходная папка найдена: D:\QIZLAR BAZMI HD
) else (
    echo [!] Внимание: Папка "D:\QIZLAR BAZMI HD" не обнаружена.
    echo [!] Вы можете изменить путь к папке в файле .env (параметр VIDEO_DIR).
)
echo.

:: 3. Проверка зависимостей
if not exist "node_modules" (
    echo [*] Установка базовых зависимостей...
    call npm install
)
if not exist "server\node_modules" (
    echo [*] Установка зависимостей сервера...
    call npm --prefix server install
)
if not exist "client\node_modules" (
    echo [*] Установка зависимостей интерфейса...
    call npm --prefix client install
)

echo.
echo [*] Запуск VideoVault HD...
echo [*] Открытие браузера: http://127.0.0.1:5173
echo.

:: Открытие браузера через 2 секунды
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5173"

:: Запуск dev-сервера
call npm run dev

pause
