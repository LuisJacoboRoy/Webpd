#!/bin/bash

# Script para generar certificados SSL autofirmados para desarrollo local
# Uso: bash generate-certs.sh
# O en PowerShell: .\generate-certs.ps1

# Crear directorio certs si no existe
mkdir -p certs

# Generar clave privada y certificado autofirmado
openssl req -x509 \
  -newkey rsa:4096 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=MX/ST=Oaxaca/L=Oaxaca/O=Pinturas Diamante/OU=IT/CN=localhost"

echo "✅ Certificados generados en ./certs/"
echo "📝 Para usar en desarrollo, agregar HTTPS=true a .env.local"
echo "🔒 Nota: Estos certificados son solo para desarrollo local"

# Agregar el certificado a la confianza del sistema (opcional, solo macOS)
# sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certs/cert.pem
