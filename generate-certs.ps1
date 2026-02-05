# PowerShell Script para generar certificados SSL autofirmados
# Uso: .\generate-certs.ps1

# Crear directorio certs si no existe
if (!(Test-Path "certs")) {
    New-Item -ItemType Directory -Path "certs" -Force | Out-Null
}

# Generar certificado autofirmado
$cert = New-SelfSignedCertificate `
    -CertStoreLocation cert:\CurrentUser\My `
    -DnsName "localhost" `
    -FriendlyName "Pinturas Diamante Dev" `
    -Subject "CN=localhost" `
    -Type SSLServerAuthentication

# Exportar a archivos PEM
$certPath = "certs\cert.pem"
$keyPath = "certs\key.pem"

# Exportar certificado
$cert | Export-Certificate -FilePath $certPath -Force | Out-Null

# Exportar clave privada (requiere conversión)
$key = $cert.PrivateKey
$keyProvider = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)

# Usar openssl si está disponible (recomendado)
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    Write-Host "✅ Generando certificado con OpenSSL..."
    openssl req -x509 `
        -newkey rsa:4096 `
        -keyout certs/key.pem `
        -out certs/cert.pem `
        -days 365 `
        -nodes `
        -subj "/C=MX/ST=Oaxaca/L=Oaxaca/O=Pinturas Diamante/OU=IT/CN=localhost"
    
    Write-Host "✅ Certificados generados en ./certs/"
    Write-Host "📝 Para usar en desarrollo, agregar HTTPS=true a .env.local"
    Write-Host "🔒 Nota: Estos certificados son solo para desarrollo local"
} else {
    Write-Host "⚠️ OpenSSL no encontrado. Instalándolo..."
    Write-Host "Opción 1: Usar Windows Subsystem for Linux (WSL) con OpenSSL"
    Write-Host "Opción 2: Instalar Git Bash que incluye OpenSSL"
    Write-Host "Opción 3: Instalar OpenSSL desde https://slproweb.com/products/Win32OpenSSL.html"
}
