@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo ======================================
echo Expense Tracker - First Time Setup
echo ======================================
echo.

call :detect_python
if errorlevel 1 goto :fail

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not installed or not added to PATH.
    echo Please install Node.js first, then run this file again.
    goto :fail
)

echo [1/4] Creating Python virtual environment if needed...
if not exist "expense-tracker-backend\.venv\Scripts\python.exe" (
    %PY_CMD% -m venv "expense-tracker-backend\.venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create Python virtual environment.
        goto :fail
    )
) else (
    echo Backend virtual environment already exists.
)

echo.
echo [2/4] Installing backend Python packages...
call :install_backend
if errorlevel 1 goto :backend_fail

echo.
echo [3/4] Installing frontend Node packages...
call :install_frontend
if errorlevel 1 goto :frontend_fail

echo.
echo [4/4] Setup complete.
echo.
echo IMPORTANT:
echo 1. Make sure MySQL is running.
echo 2. Run the SQL in expense-tracker-backend\setup_database.sql
echo    or create the database manually:
echo    CREATE DATABASE expense_tracker;
echo 3. Then run start_app.bat
pause
exit /b 0

:detect_python
where py >nul 2>nul
if not errorlevel 1 (
    set "PY_CMD=py -3"
    exit /b 0
)
where python >nul 2>nul
if not errorlevel 1 (
    set "PY_CMD=python"
    exit /b 0
)
echo [ERROR] Python is not installed or not added to PATH.
echo Please install Python first, then run this file again.
exit /b 1

:install_backend
set "BACKEND_PY=expense-tracker-backend\.venv\Scripts\python.exe"
"%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install --upgrade pip --index-url https://pypi.org/simple
if errorlevel 1 (
    echo [WARN] Official PyPI upgrade failed, trying Aliyun mirror...
    "%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install --upgrade pip --index-url https://mirrors.aliyun.com/pypi/simple/
)
if errorlevel 1 (
    echo [WARN] Aliyun mirror failed, trying Tsinghua mirror...
    "%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install --upgrade pip --index-url https://pypi.tuna.tsinghua.edu.cn/simple
)
if errorlevel 1 exit /b 1

echo Installing requirements from requirements.txt...
"%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install -r "expense-tracker-backend\requirements.txt" --index-url https://pypi.org/simple
if not errorlevel 1 exit /b 0

echo [WARN] Official PyPI install failed, trying Aliyun mirror...
"%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install -r "expense-tracker-backend\requirements.txt" --index-url https://mirrors.aliyun.com/pypi/simple/
if not errorlevel 1 exit /b 0

echo [WARN] Aliyun mirror failed, trying Tsinghua mirror...
"%BACKEND_PY%" -m pip --isolated --disable-pip-version-check install -r "expense-tracker-backend\requirements.txt" --index-url https://pypi.tuna.tsinghua.edu.cn/simple
if not errorlevel 1 exit /b 0

exit /b 1

:install_frontend
pushd "%~dp0expense-tracker-react"
call npm install --registry=https://registry.npmjs.org/
if not errorlevel 1 (
    popd
    exit /b 0
)

echo [WARN] npm official registry failed, trying npmmirror...
call npm install --registry=https://registry.npmmirror.com/
if not errorlevel 1 (
    popd
    exit /b 0
)

popd
exit /b 1

:backend_fail
echo [ERROR] Backend package installation failed.
echo.
echo This script already ignored your local pip mirror settings and tried:
echo - https://pypi.org/simple
echo - https://mirrors.aliyun.com/pypi/simple/
echo - https://pypi.tuna.tsinghua.edu.cn/simple
echo.
echo If all three fail, the current network cannot reach Python package sources.
goto :fail

:frontend_fail
echo [ERROR] Frontend package installation failed.
echo.
echo This script already tried:
echo - https://registry.npmjs.org/
echo - https://registry.npmmirror.com/
goto :fail

:fail
pause
exit /b 1
