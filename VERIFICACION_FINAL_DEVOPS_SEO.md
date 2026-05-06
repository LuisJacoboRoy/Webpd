# ✅ Checklist de Verificación SEO + DevOps

## 📋 Verificación de Robots.txt

Tu `public/robots.txt` actual está **CORRECTAMENTE CONFIGURADO** ✅

```
✅ User-agent: * (Todos los bots permitidos)
✅ Allow: / (Acceso general permitido)
✅ Sitemap: https://pinturasdiamante.com/sitemap.xml
✅ Sitemap: https://pinturasdiamante.com/sitemap-products.xml
✅ Sitemap: https://pinturasdiamante.com/sitemap-categories.xml
✅ Disallow: /certs/, /dist/, /node_modules/ (Rutas sensibles bloqueadas)
✅ Crawl-delay: 1 (Razonable para no sobrecargar)
✅ Googlebot: Crawl-delay: 0 (Sin restricciones para Google)
```

### ¿Qué verá Google?
```
1. Googlebot accede a: pinturasdiamante.com/robots.txt
2. Lee: "Sitemap: https://pinturasdiamante.com/sitemap.xml"
3. Descarga sitemap.xml
4. Indexa todas las URLs listadas
5. Repite cada 7 días (o cuando detecta cambios)
```

### Verificación manual
```bash
# Ver el robots.txt en vivo
curl https://pinturasdiamante.com/robots.txt | head -30

# Validar sintaxis en Google Search Console
# https://search.google.com/search-console/robots-txt
```

---

## 🔐 Verificación de Headers de Vercel

### ✅ Headers CORRECTOS en vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        // ✅ BUENO: No hay X-Robots-Tag: noindex
        // ✅ BUENO: No hay X-Robots-Tag: nofollow
      ]
    }
  ]
}
```

### ✅ Headers a VERIFICAR en Vercel

```bash
# Ejecutar para verificar headers reales
curl -I https://pinturasdiamante.com/

# Salida esperada:
# HTTP/2 200
# content-type: text/html; charset=utf-8
# strict-transport-security: max-age=31536000; includeSubDomains; preload
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
# x-xss-protection: 1; mode=block
# referrer-policy: strict-origin-when-cross-origin
# 
# ❌ NO debería contener:
# x-robots-tag: noindex
# x-robots-tag: nofollow

# Si ve noindex:
echo "⚠️  PROBLEMA DETECTADO: Hay header noindex bloqueando indexación"
```

---

## 🚀 Verificación del Workflow Actualizado

### Cambios realizados en `.github/workflows/update-sitemaps.yml`

**Agregados (NEW STEPS)**:
```yaml
# PASO 1: Deploy a Vercel Production
- name: 🔐 Deploy to Vercel Production
  if: steps.verify_changed.outputs.changed == 'true'
  run: |
    echo "🚀 Iniciando despliegue en Vercel..."
    npx vercel --token=${{ secrets.VERCEL_TOKEN }} --prod --yes

# PASO 2: Verificar NO hay headers noindex
- name: ✅ Verify SEO Headers & Robots
  if: steps.verify_changed.outputs.changed == 'true'
  run: |
    echo "✅ Verificando que NO hay headers noindex..."
    if grep -r "X-Robots-Tag.*noindex" . --include="*.yml" --include="*.json" --include="*.ts" 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
      echo "⚠️  ADVERTENCIA: Se detectó header X-Robots-Tag noindex"
      exit 1
    fi

# PASO 3: Notificar a motores de búsqueda
- name: 🔔 Notify Search Engines
  if: steps.verify_changed.outputs.changed == 'true'
  run: |
    echo "📢 Notificando a motores de búsqueda..."
    curl -s "https://www.google.com/ping?sitemap=https://pinturasdiamante.com/sitemap.xml" | head -n 5
    curl -s "https://www.bing.com/ping?sitemap=https://pinturasdiamante.com/sitemap.xml" | head -n 5
```

### Flow del workflow actualizado
```
┌─────────────────────────────────────┐
│ Push cambios a main/develop         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Genera sitemaps (npm run sitemap:) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Commit a repositorio                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐  ← NUEVO
│ Deploy a Vercel --prod              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐  ← NUEVO
│ Verifica NO hay noindex headers    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐  ← NUEVO
│ Notifica Google & Bing (ping)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ✨ Sitio actualizado en producción  │
└─────────────────────────────────────┘
```

---

## 📝 Componentes JSON-LD Creados

### 1. `components/JsonLd.tsx` - Componente Base
**Características**:
- ✅ Compatible con SSR (renderizado servidor)
- ✅ Compatible con CSR (renderizado cliente)
- ✅ Previene duplicados con IDs únicos
- ✅ Soporta múltiples schemas
- ✅ Sin errores de hidratación

**Ubicación en DOM**: `<head>`
**Renderizado**: Server-side (SSR) o Client-side (CSR)

### 2. `components/SEOSchemaProvider.tsx` - Provider Global
**Schemas que inyecta automáticamente**:
- ✅ Organization (Organización principal)
- ✅ LocalBusiness (Cada sucursal)
- ✅ WebSite (Para búsquedas)
- ✅ BreadcrumbList (Navegación)
- ✅ FAQPage (Preguntas frecuentes)
- ✅ Custom schema (Dinámico)

**Uso**:
```tsx
<SEOSchemaProvider pageType="home">
  <App />
</SEOSchemaProvider>
```

---

## 🔍 Verificación en Google Search Console

### 1. Subir Sitemaps manualmente
```
https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Apinturasdiamante.com
```

- Click "Agregar sitemap"
- URL: `https://pinturasdiamante.com/sitemap.xml`
- Repetir para: `sitemap-products.xml`, `sitemap-categories.xml`

### 2. Ver cobertura
```
https://search.google.com/search-console/coverage
```

Deberías ver:
- ✅ "Enviados mediante sitemap" aumentando
- ✅ "Indexado" >= 70%
- ❌ "Excluido" bajando (ideal < 10%)

### 3. Verificar Rich Results
```
https://search.google.com/test/rich-results?url=https://pinturasdiamante.com
```

Esperas ver:
- ✅ Organization schema válido
- ✅ Product schemas válidos
- ✅ LocalBusiness válido (para cada sucursal)

---

## ⚙️ Configuración de Bing Webmaster Tools

También deberías registrar tu sitio en Bing:

1. Ve a: https://www.bing.com/webmasters/
2. Agrega: `https://pinturasdiamante.com`
3. Verifica propiedad (DNS o archivo)
4. Sube sitemaps:
   - `https://pinturasdiamante.com/sitemap.xml`
   - `https://pinturasdiamante.com/sitemap-products.xml`

---

## 🎯 Cronograma de Indexación Esperado

| Tiempo | Evento |
|--------|--------|
| T+0 min | Commit pushed a GitHub |
| T+5 min | Workflow inicia |
| T+10 min | Sitemaps generados |
| T+13 min | Deploy a Vercel enviado |
| T+18 min | Deploy completado |
| T+20 min | Google/Bing notificados |
| T+2 horas | Google comienza a indexar (en casos rápidos) |
| T+24 horas | La mayoría indexada |
| T+48 horas | Todos los URLs deberían estar indexados |

---

## 🔧 Test Manual del Deploy

Si quieres testear sin cambiar datos:

```bash
# En terminal local
cd /path/to/repo

# 1. Generar sitemaps
npm run sitemap:generate

# 2. Ver cambios
git diff public/sitemap*.xml

# 3. Deploy manual (requiere VERCEL_TOKEN)
npx vercel --prod --token YOUR_VERCEL_TOKEN

# 4. Verificar en vivo
curl https://pinturasdiamante.com/sitemap.xml | head -20
```

---

## 📊 Monitoreo Continuo

### En GitHub Actions
- Ve a: **GitHub → Actions → 🗺️ Update Sitemaps**
- Verifica que se ejecute cada vez que cambies:
  - `data/products.ts`
  - `data/seo.ts`
  - `scripts/generate-sitemap.ts`
  - Componentes

### En Vercel
- Ve a: **vercel.com → pinturasdiamante.com → Deployments**
- Debería haber un nuevo deployment cada vez que se ejecute el workflow

### En Google Search Console
- Monitorea: **Coverage → Indexed**
- Espera ver aumentar la cantidad de URLs indexadas

---

## ✨ Si todo funciona correctamente:

```
✅ Workflow ejecutado sin errores
✅ Sitemaps generados (sitemap.xml, sitemap-products.xml, etc.)
✅ Deploy a Vercel completado
✅ Headers verifican NO hay noindex
✅ Google y Bing notificados
✅ URLs comenzando a indexarse en 24-48 horas
✅ Rich Results visibles en Google Search Console
✅ Rankings mejorando gradualmente en 2-4 semanas
```

---

## 🆘 Contacto & Soporte

Si algo no funciona:

1. Revisar logs en: **GitHub → Actions → [Workflow name]**
2. Buscar errores específicos en los logs
3. Verificar que `VERCEL_TOKEN` está en GitHub Secrets
4. Ejecutar `npm run sitemap:generate` localmente para descartar errores de script

