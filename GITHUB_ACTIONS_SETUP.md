# GitHub Actions Setup para Deploy con HTTPS

## 📋 Requisitos

Los siguientes workflows están configurados:

1. **deploy.yml** - Deploy a GitHub Pages
2. **deploy-vercel.yml** - Deploy a Vercel (recomendado)

---

## 🔑 Secrets Requeridos en GitHub

Para que el deploy funcione, debes configurar estos secrets en:
**Settings → Secrets and variables → Actions**

### Para Deploy a Vercel (deploy-vercel.yml)

```
VERCEL_TOKEN
VERCEL_ORG_ID  
VERCEL_PROJECT_ID
```

#### Cómo obtener estos valores:

1. **VERCEL_TOKEN:**
   - Ir a https://vercel.com/account/tokens
   - Crear un nuevo token
   - Copiar el token generado

2. **VERCEL_ORG_ID:**
   - Ir a https://vercel.com/account/settings
   - Buscar "Team ID" o "Organization ID"

3. **VERCEL_PROJECT_ID:**
   - En tu proyecto en Vercel, ir a Settings
   - Copiar el Project ID

---

## ✅ Variables de Entorno (ya configuradas)

```env
NODE_VERSION: '18'
VITE_API_URL: 'https://api.pinturasdiamante.com'
VITE_ENVIRONMENT: 'production'
HTTPS: 'true'
```

---

## 🔐 Validaciones Automáticas en el Pipeline

El workflow verifica automáticamente:

1. ✅ **HTTPS Configuration**
   - Vite config tiene HTTPS activado
   - CSP includes `upgrade-insecure-requests`
   - HSTS headers presentes

2. ✅ **Domain Validation**
   - Busca instancias de `pinturasdiamanteapp.com` (incorrecto)
   - Valida `pinturasdiamante.com` (correcto)
   - Falla el deploy si encuentra dominio incorrecto

3. ✅ **Build Verification**
   - npm ci (install seguro)
   - npm run build
   - Verifica artefactos generados

---

## 🚀 Flujo de Deploy

### Opción 1: GitHub Pages (deploy.yml)
```
Push a main → Validate → Build → Upload Artifact → Deploy a GitHub Pages
```

### Opción 2: Vercel (deploy-vercel.yml) 
```
Push a main → Validate → Build → Deploy a Vercel (Production)
```

---

## 📝 Cómo Activar los Workflows

1. Hacer push a la rama `main`:
   ```bash
   git add .
   git commit -m "Activar GitHub Actions con HTTPS"
   git push origin main
   ```

2. Ver progreso en: **GitHub Repo → Actions**

3. Los workflows se ejecutarán automáticamente

---

## 🔄 Ramas Configuradas

Los workflows se ejecutan en push a:
- `main` - Deploy a producción
- `master` - Deploy a producción (fallback)
- `production` - Deploy a producción

Pull requests a `main` generan preview deploys.

---

## 🔒 Seguridad HTTPS en Deploy

El workflow asegura:

1. **CSP Headers:** 
   - `upgrade-insecure-requests` activo
   - Solo permite recursos HTTPS

2. **HSTS Headers:**
   - `Strict-Transport-Security: max-age=31536000`
   - Fuerza HTTPS por 1 año

3. **Validación de Dominio:**
   - Bloquea deploy si hay dominio incorrecto
   - Garantiza que todo apunte a `pinturasdiamante.com`

---

## 📊 Monitoreo

Después del deploy, verificar:

```bash
# Verificar HTTPS
curl -I https://pinturasdiamante.com

# Verificar headers HSTS
curl -I https://pinturasdiamante.com | grep "Strict-Transport"

# Verificar CSP
curl -I https://pinturasdiamante.com | grep "Content-Security-Policy"
```

---

## ⚠️ Troubleshooting

### El deploy falla con "dominio incorrecto"
Revisa que no haya `pinturasdiamanteapp.com` en:
- `config/seoConfig.ts`
- `public/sitemap.xml`
- `public/robots.txt`
- `utils/seoPrerender.ts`

### El deploy falla con "HTTPS no configurado"
Verifica que `index.html` contenga:
```html
<meta http-equiv="Upgrade-Insecure-Requests" content="1">
```

### Secrets no reconocidos
1. Ir a Settings → Secrets and variables → Actions
2. Crear cada secret con el nombre exacto
3. Pegar el valor
4. Guardar

---

## 🎯 Próximos Pasos

1. ✅ Configurar los 3 secrets en GitHub
2. ✅ Hacer un push a main
3. ✅ Ver el workflow ejecutarse en Actions
4. ✅ Verificar que el sitio esté en vivo con HTTPS

¡Listo para deploy automático y seguro!
