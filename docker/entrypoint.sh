#!/bin/sh
set -e

echo "[MedClinic-API][docker] Preparando banco de dados..."
node dist/scripts/prepare-database.js

echo "[MedClinic-API][docker] Iniciando API..."
exec node dist/server.js
