# Guía Rápida de Integración - JsonLd + DevOps

## ⚡ 5 Pasos para Activar Todo

### Paso 1: Wrapper en App.tsx
```tsx
import { SEOSchemaProvider } from './components/SEOSchemaProvider';

function App() {
  return (
    <SEOSchemaProvider pageType="home">
      <BrowserRouter>
        {/* Tu contenido */}
      </BrowserRouter>
    </SEOSchemaProvider>
  );
}
```

### Paso 2: En diferentes páginas

**Catalog Page:**
```tsx
<SEOSchemaProvider pageType="catalog">
  {/* Content */}
</SEOSchemaProvider>
```

**Product Detail:**
```tsx
<SEOSchemaProvider 
  pageType="product"
  customSchema={{
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    // ... más campos
  }}
>
  {/* Content */}
</SEOSchemaProvider>
```

### Paso 3: Agregar VERCEL_TOKEN a GitHub

1. En GitHub: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: (Tu token de Vercel)

**Cómo obtener el token**:
```bash
# En terminal
vercel login
cat ~/.vercel/auth.json
# Copia el valor de "token"
```

### Paso 4: Trigger el workflow manualmente (Test)

1. Ve a: **GitHub → Actions → 🗺️ Update Sitemaps**
2. Click **Run workflow → Run workflow**
3. Espera 10-15 minutos
4. Verifica que:
   - ✅ Sitemaps generados
   - ✅ Deploy a Vercel completado
   - ✅ Google/Bing notificados

### Paso 5: Verificar que funciona

```bash
# Test 1: Ver sitemaps publicados
curl https://pinturasdiamante.com/sitemap.xml | head -20
curl https://pinturasdiamante.com/sitemap-products.xml | head -20

# Test 2: Ver JSON-LD en HTML
curl https://pinturasdiamante.com/ | grep -A 5 'application/ld+json'

# Test 3: Ver que NO hay noindex
curl -I https://pinturasdiamante.com/ | grep -i robots

# Test 4: Probar en Google Rich Results
# https://search.google.com/test/rich-results?url=https://pinturasdiamante.com
```

---

## 📋 Checklist Final

- [ ] Componente `JsonLd.tsx` creado
- [ ] `SEOSchemaProvider.tsx` creado
- [ ] Workflow `update-sitemaps.yml` actualizado con deploy
- [ ] `VERCEL_TOKEN` agregado a GitHub Secrets
- [ ] Workflow testado manualmente
- [ ] Sitemaps generados y accesibles
- [ ] JSON-LD visible en HTML
- [ ] Headers verifican NO hay noindex
- [ ] Google Search Console notificado
- [ ] App.tsx wrapeado con `<SEOSchemaProvider>`

---

## 🐛 Si algo falla

### Error: "VERCEL_TOKEN no encontrado"
```bash
# Verifica que el secret existe
# GitHub → Settings → Secrets → VERCEL_TOKEN debe estar listado
```

### Error: "Deploy timed out"
```bash
# En .github/workflows/update-sitemaps.yml, aumenta timeout:
timeout-minutes: 20  # (agregar en job)
```

### Error: "Sitemaps no se generan"
```bash
# Verifica localmente
npm run sitemap:generate

# Si falla, revisar:
# - ¿Existe scripts/generate-sitemap.ts?
# - ¿data/products.ts tiene datos?
# - ¿Hay errores de compilación?
```

### Sitemaps generados pero no se indexan
```bash
# Verifica robots.txt
curl https://pinturasdiamante.com/robots.txt | grep Sitemap

# Verifica Google Search Console
# https://search.google.com/search-console

# Envía manualmente:
# Google: https://search.google.com/search-console/sitemaps
# Bing: https://www.bing.com/webmasters/
```

---

## 🎯 Resultado Esperado

Después de 24-48 horas deberías ver:

✅ Google indexando: `site:pinturasdiamante.com` muestra resultados
✅ Google Search Console: Mostrando páginas indexadas  
✅ Rich Results: Productos con "Oferta", "Disponibilidad", etc.
✅ Velocidad: Sitemaps se sirven desde Vercel CDN
✅ Monitoreo: GitHub Actions ejecutándose automáticamente

---

## 📞 Soporte Rápido

Si necesitas acceso manual:

```bash
# Deploy manual a Vercel
npx vercel --prod --token YOUR_TOKEN

# Generar sitemaps localmente
npm run sitemap:generate

# Verificar estructura
ls -la public/sitemap*

# Ver logs del workflow
# GitHub → Actions → Update Sitemaps → [Tu ejecución]
```

¡Listo! Tu sitio debería estar indexándose normalmente en 24-48 horas. 🚀

