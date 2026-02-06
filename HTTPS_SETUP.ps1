# Configuración HTTPS para desarrollo
# Crear el directorio certs si no existe
if (!(Test-Path "certs")) {
    New-Item -ItemType Directory -Path "certs" -Force | Out-Null
    Write-Host "✓ Directorio certs creado"
}

# Para Windows: usar mkcert (más fácil) o descargar certificados pre-generados
Write-Host "Para habilitar HTTPS local, ejecuta:"
Write-Host ""
Write-Host "Opción 1 - Usar mkcert (RECOMENDADO):"
Write-Host "  npm install -g mkcert"
Write-Host "  mkcert -install"
Write-Host "  mkcert localhost 127.0.0.1"
Write-Host "  mv localhost+1.pem certs/cert.pem"
Write-Host "  mv localhost+1-key.pem certs/key.pem"
Write-Host ""
Write-Host "Opción 2 - Usar OpenSSL:"
Write-Host "  openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj '/C=MX/ST=Oaxaca/L=Oaxaca/O=Pinturas Diamante/CN=localhost'"
Write-Host ""
Write-Host "Luego ejecutar: npm run dev"
