@echo off
setlocal

echo 🚀 Iniciando MindPlan...

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker primero.
    exit /b 1
)

REM Verificar si Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor instala Docker Compose primero.
    exit /b 1
)

if "%1"=="dev" (
    echo 🔧 Iniciando en modo desarrollo...
    docker-compose -f docker-compose.dev.yml up --build
) else if "%1"=="prod" (
    echo 🏭 Iniciando en modo producción...
    docker-compose up --build -d
    echo ✅ MindPlan está ejecutándose en:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:5000
    echo    MongoDB: localhost:27017
) else if "%1"=="stop" (
    echo 🛑 Deteniendo contenedores...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
) else if "%1"=="clean" (
    echo 🧹 Limpiando contenedores e imágenes...
    docker-compose down --rmi all --volumes
    docker-compose -f docker-compose.dev.yml down --rmi all --volumes
    docker system prune -f
) else if "%1"=="logs" (
    echo 📋 Mostrando logs...
    docker-compose logs -f
) else (
    echo Uso: %0 [OPCIÓN]
    echo.
    echo Opciones:
    echo   dev       Iniciar en modo desarrollo
    echo   prod      Iniciar en modo producción
    echo   stop      Detener todos los contenedores
    echo   clean     Limpiar contenedores e imágenes
    echo   logs      Mostrar logs de los contenedores
)