@echo off
setlocal EnableDelayedExpansion

echo ===================================================
echo     KIEM TRA MOI TRUONG HE THONG
echo ===================================================

:: Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Khong tim thay Node.js. He thong dang tu dong cai dat...
    winget install -e --id OpenJS.NodeJS --accept-package-agreements --accept-source-agreements
    echo.
    echo [*] Da cai dat xong Node.js.
    echo [!] Vui long TAT CUA SO NAY VA CHAY LAI file run_all.bat de cap nhat moi truong!
    pause
    exit /b
) else (
    for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
    echo [OK] Node.js da duoc cai dat (Phien ban: !NODE_VER!)
)

:: Kiem tra npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Khong tim thay npm. Vui long cai lai Node.js hoac kiem tra lai PATH.
    pause
    exit /b
) else (
    for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
    echo [OK] npm da duoc cai dat (Phien ban: !NPM_VER!)
)

echo.
echo ===================================================
echo     KHOI DONG HE THONG WEB TRAC NGHIEM
echo ===================================================

echo.
echo [1/3] Cai dat thu vien Backend...
cd backend
call npm install
cd ..

echo.
echo [2/3] Cai dat thu vien Frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Khoi dong Backend (Port 5051) va Frontend (Port 3000)...
echo Vui long cho trong giay lat...
echo.

:: Mở Backend ở một cửa sổ mới
start cmd /k "title Backend Server && cd backend && npm run dev"

:: Mở Frontend ở cửa sổ hiện tại
title Frontend Server
cd frontend
npm run dev
