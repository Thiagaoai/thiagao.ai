#!/bin/bash

# Script para iniciar o servidor de desenvolvimento
# Uso: ./start-dev.sh

echo "🚀 Iniciando servidor de desenvolvimento..."

# Limpar processos antigos
echo "🧹 Limpando processos antigos..."
lsof -ti:3002 | xargs kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 2

# Verificar se a porta está livre
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Erro: Porta 3002 ainda está em uso!"
    exit 1
fi

# Iniciar o servidor
echo "✅ Iniciando servidor na porta 3002 (localhost)..."
cd "$(dirname "$0")"
npm run dev

