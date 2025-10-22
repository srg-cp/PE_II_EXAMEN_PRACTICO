#!/bin/bash

# Script para iniciar MindPlan con Docker

echo "🚀 Iniciando MindPlan..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  dev       Iniciar en modo desarrollo"
    echo "  prod      Iniciar en modo producción"
    echo "  stop      Detener todos los contenedores"
    echo "  clean     Limpiar contenedores e imágenes"
    echo "  logs      Mostrar logs de los contenedores"
    echo "  help      Mostrar esta ayuda"
    echo ""
}

# Procesar argumentos
case "$1" in
    "dev")
        echo "🔧 Iniciando en modo desarrollo..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "prod")
        echo "🏭 Iniciando en modo producción..."
        docker-compose up --build -d
        echo "✅ MindPlan está ejecutándose en:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:5000"
        echo "   MongoDB: localhost:27017"
        ;;
    "stop")
        echo "🛑 Deteniendo contenedores..."
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
        ;;
    "clean")
        echo "🧹 Limpiando contenedores e imágenes..."
        docker-compose down --rmi all --volumes
        docker-compose -f docker-compose.dev.yml down --rmi all --volumes
        docker system prune -f
        ;;
    "logs")
        echo "📋 Mostrando logs..."
        docker-compose logs -f
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Opción no válida: $1"
        show_help
        exit 1
        ;;
esac