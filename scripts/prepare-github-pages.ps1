#!/usr/bin/env pwsh

<#
  .SYNOPSIS
  Script de preparación local para GitHub Pages deployment
  Simula lo que hace el GitHub Action para verificar que todo funciona
  
  .DESCRIPTION
  Este script ejecuta los mismos pasos que el action:
  1. npm ci (instalar dependencias)
  2. npm run build (build con Vite)
  3. npm run prerender (generar contenido SSG)
  4. Verificar archivos generados
  
  .EXAMPLE
  .\scripts\prepare-github-pages.ps1
#>

param(
  [switch]$SkipCI = $false
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  GitHub Pages Deployment Preparation Script (Local)        ║" -ForegroundColor Cyan
Write-Host "║  React 19 + Vite + SSG Prerendering                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# 1. Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
if (-not $SkipCI) {
  try {
    npm ci
    Write-Host "✅ Dependencies installed successfully`n" -ForegroundColor Green
  } catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
  }
} else {
  Write-Host "⏭️  Skipping npm ci (using existing node_modules)`n" -ForegroundColor Yellow
}

# 2. Build with Vite
Write-Host "🏗️  Step 2: Building with Vite..." -ForegroundColor Yellow
try {
  $env:NODE_ENV = 'production'
  $env:GITHUB_PAGES = 'true'
  npm run build
  Write-Host "✅ Build completed successfully`n" -ForegroundColor Green
} catch {
  Write-Host "❌ Build failed" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

# 3. Generate SSG content
Write-Host "📄 Step 3: Generating SSG prerendered content..." -ForegroundColor Yellow
try {
  $env:GITHUB_PAGES = 'true'
  npm run prerender
  Write-Host "✅ Prerendering completed successfully`n" -ForegroundColor Green
} catch {
  Write-Host "❌ Prerendering failed" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

# 4. Create .nojekyll file
Write-Host "🚀 Step 4: Creating .nojekyll file..." -ForegroundColor Yellow
try {
  if (-not (Test-Path "./dist")) {
    New-Item -ItemType Directory -Path "./dist" | Out-Null
  }
  New-Item -ItemType File -Path "./dist/.nojekyll" -Force | Out-Null
  Write-Host "✅ .nojekyll file created`n" -ForegroundColor Green
} catch {
  Write-Host "❌ Failed to create .nojekyll" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

# 5. Copy prerendered files
Write-Host "📋 Step 5: Copying prerendered files..." -ForegroundColor Yellow
try {
  if (Test-Path "./prerendered") {
    Copy-Item -Path "./prerendered/*" -Destination "./dist/" -Recurse -Force
    Write-Host "✅ Prerendered files copied" -ForegroundColor Green
  }
  
  if (Test-Path "./public/sitemap.xml") {
    Copy-Item -Path "./public/sitemap.xml" -Destination "./dist/" -Force
    Write-Host "✅ sitemap.xml copied" -ForegroundColor Green
  }
  
  if (Test-Path "./public/robots.txt") {
    Copy-Item -Path "./public/robots.txt" -Destination "./dist/" -Force
    Write-Host "✅ robots.txt copied" -ForegroundColor Green
  }
  
  if (Test-Path "./public/_redirects") {
    Copy-Item -Path "./public/_redirects" -Destination "./dist/" -Force
    Write-Host "✅ _redirects copied" -ForegroundColor Green
  }
  
  Write-Host ""
} catch {
  Write-Host "❌ Failed to copy files" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

# 6. Verify dist folder
Write-Host "🔍 Step 6: Verifying dist folder..." -ForegroundColor Yellow
if (Test-Path "./dist") {
  $files = @(
    "index.html",
    ".nojekyll",
    "sitemap.xml",
    "robots.txt",
    "_redirects"
  )
  
  $allPresent = $true
  foreach ($file in $files) {
    if (Test-Path "./dist/$file") {
      Write-Host "✅ $file present" -ForegroundColor Green
    } else {
      Write-Host "⚠️  $file missing (optional)" -ForegroundColor Yellow
    }
  }
  
  Write-Host "`n📁 Dist folder contents:" -ForegroundColor Cyan
  Get-ChildItem -Path "./dist" -Force | Select-Object -First 20 | Format-Table Name, Length
  Write-Host ""
} else {
  Write-Host "❌ dist folder not found" -ForegroundColor Red
  exit 1
}

# Final summary
$duration = (Get-Date) - $startTime
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Everything is ready for GitHub Pages deployment!       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   • Dependencies: ✅ Installed"
Write-Host "   • Build: ✅ Completed"
Write-Host "   • Prerendering: ✅ Generated"
Write-Host "   • Configuration: ✅ Ready"
Write-Host "   • Duration: $($duration.TotalSeconds) seconds`n"

Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review changes: git status"
Write-Host "   2. Commit changes: git add . && git commit -m 'Ready: GitHub Pages deployment'"
Write-Host "   3. Push to main: git push origin main"
Write-Host "   4. Check GitHub Actions: https://github.com/LuisJacoboRoy/Webpd/actions`n"

Write-Host "✨ Your site will be deployed to: https://luisjacoboroy.github.io/Webpd/" -ForegroundColor Cyan
