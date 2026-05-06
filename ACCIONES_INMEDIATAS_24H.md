# ⚡ ACCIONES INMEDIATAS - Próximas 24 horas

## 🔴 CRÍTICO: Paso 1 (15 minutos)

### Obtener VERCEL_TOKEN

**En tu terminal local**:
```bash
npx vercel login
```

Sigue las instrucciones:
1. Escoge cuenta de Vercel
2. Autoriza GitHub
3. Token se guarda en: `~/.vercel/auth.json`

**Para obtener el token**:
```bash
# Windows PowerShell
type $PROFILE\..\..\.vercel\auth.json
# o Mac/Linux
cat ~/.vercel/auth.json
```

Busca la sección `"token": "..."` - Copia el valor (sin comillas).

---

## 🟠 IMPORTANTE: Paso 2 (5 minutos)

### Agregar Token a GitHub Secrets

1. **Ve a**:
   - https://github.com/[TU_USUARIO]/[TU_REPO]/settings/secrets/actions

2. **Click**: `New repository secret`

3. **Completa**:
   - Name: `VERCEL_TOKEN`
   - Value: [Pega el token que copiaste]

4. **Click**: `Add secret`

**Verificación**:
```
Settings → Secrets and variables → Actions
Deberías ver: VERCEL_TOKEN ✓
```

---

## 🟡 IMPORTANTE: Paso 3 (20 minutos)

### Testear el Workflow

1. **Ve a**: 
   - https://github.com/[TU_USUARIO]/[TU_REPO]/actions

2. **Busca**: `🗺️ Update Sitemaps`

3. **Click en el workflow**

4. **Click**: `Run workflow` (botón verde)

5. **Click**: `Run workflow` (confirmar)

6. **Espera**: 10-15 minutos

**Qué debe pasar**:
```
✅ "Generate sitemaps" - Verde
✅ "Commit and push sitemaps" - Verde
✅ "Deploy to Vercel Production" - Verde ← NUEVO
✅ "Verify SEO Headers & Robots" - Verde ← NUEVO
✅ "Notify Search Engines" - Verde ← NUEVO
```

**Si hay error en Deploy to Vercel**:
- Verifica que VERCEL_TOKEN está en Secrets
- Revisa que el token no está expirado
- Intenta obtener un token nuevo

---

## 🟢 VERIFICACIÓN: Paso 4 (10 minutos)

### Verificar que Funcionó

**En terminal**:

```bash
# Test 1: Sitemaps accesibles
echo "=== TEST 1: Sitemaps ==="
curl -s https://pinturasdiamante.com/sitemap.xml | head -5
# Deberías ver: <?xml version="1.0"...

# Test 2: JSON-LD en HTML
echo "=== TEST 2: JSON-LD ==="
curl -s https://pinturasdiamante.com/ | grep -c 'application/ld+json'
# Deberías ver un número >= 1

# Test 3: NO hay noindex
echo "=== TEST 3: Headers ==="
curl -I https://pinturasdiamante.com/ 2>/dev/null | grep -i 'x-robots' || echo "✓ Sin X-Robots header"
# Deberías VER: "✓ Sin X-Robots header" (BUENO)
# NO deberías ver: "x-robots-tag: noindex"

# Test 4: Robots.txt
echo "=== TEST 4: Robots.txt ==="
curl -s https://pinturasdiamante.com/robots.txt | grep Sitemap
# Deberías ver: Sitemap: https://pinturasdiamante.com/sitemap.xml (y más)
```

---

## 📊 Paso 5 (Opcional - Verificación en Google)

### Verificar en Google Search Console

1. **Ve a**:
   - https://search.google.com/search-console

2. **Busca**: pinturasdiamante.com

3. **Ve a**: Sitemaps (izquierda)

4. **Deberías ver**:
   - `✓ Enviado` (Exitoso)
   - URL del sitemap
   - Fecha de última exploración

**Si no ves el sitemap**:
- Click: `Descubrir nuevos URLs`
- URL: `https://pinturasdiamante.com/sitemap.xml`
- Click: `Cargar`

---

## 🎯 Paso 6 (Setup una sola vez)

### (Opcional) Integrar componente JsonLd

**MÍNIMO - Sin cambios** ✅:
Tu app ya funciona con el hook `useJsonLd` existente. No necesitas cambios.

**RECOMENDADO - Mejorar SSR**:

En `App.tsx`, reemplaza el hook con el componente:

```tsx
import { SEOSchemaProvider } from './components/SEOSchemaProvider';

function App() {
  return (
    <SEOSchemaProvider pageType="home">
      {/* Tu contenido */}
    </SEOSchemaProvider>
  );
}
```

Esto inyectará automáticamente todos los schemas.

---

## ✅ Checklist de Hoy

- [ ] Ejecuté `npx vercel login`
- [ ] Copié el VERCEL_TOKEN
- [ ] Agregué VERCEL_TOKEN a GitHub Secrets
- [ ] Ejecuté el workflow manualmente
- [ ] Workflow completó sin errores
- [ ] Verifiqué sitemaps accesibles (curl)
- [ ] Verifiqué JSON-LD en HTML (grep)
- [ ] Verifiqué NO hay noindex (curl -I)
- [ ] Sitemaps aparecen en Google Search Console

---

## 🚀 Qué Sucede Automáticamente Ahora

**Cada vez que hagas commit/push**:

```
data/products.ts cambió
         ↓
GitHub Action dispara
         ↓
Genera sitemaps nuevos
         ↓
Deploy automático a Vercel (--prod)
         ↓
Google/Bing notificados
         ↓
Tu sitio se indexa automáticamente
```

---

## 📞 Problemas Rápidos

| Problema | Solución |
|----------|----------|
| "VERCEL_TOKEN no encontrado" | Verifica en GitHub Settings → Secrets |
| "Deploy timed out" | Vuelve a ejecutar el workflow |
| "Sitemaps no se generan" | Ejecuta localmente: `npm run sitemap:generate` |
| "Workflow no ejecuta" | Verifica que cambios están en `main` branch |

---

## 🎊 Cuando Todo Funciona

Dentro de 24-48 horas verás:

```
✅ Google Search Console: "Enviados mediante sitemap" aumentando
✅ URL de productos indexadas
✅ Rich Results visibles
✅ Traffic comenzando a aumentar
✅ Rankings mejorando en 2-4 semanas
```

---

**¡Listo para empezar! Ejecuta los pasos 1-4 en orden. El resto es automático.** 🚀

