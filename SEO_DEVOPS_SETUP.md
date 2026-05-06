# Configuración SEO + DevOps - Solución Completa para Indexación

## 🎯 Resumen de Cambios

Se han realizado 3 cambios principales para resolver los problemas de indexación en pinturasdiamante.com:

### 1. ✅ Componente JsonLd (SSR/CSR Compatible)
**Ubicación**: [components/JsonLd.tsx](components/JsonLd.tsx)

Nuevo componente que inyecta structured data de forma segura y compatible con:
- **SSR (Server-Side Rendering)** - Para pre-renderizado
- **CSR (Client-Side Rendering)** - Para React dinámico
- **Hydration** - Sin errores de hidratación en Next.js/Vite

**Ventajas**:
- Previene duplicados de schemas
- Compatible con múltiples schemas simultáneamente
- Optimizado para Chrome y Google Search Console
- Permite markup dinámico basado en datos

### 2. ✅ Workflow Automatizado con Deploy a Vercel
**Ubicación**: [.github/workflows/update-sitemaps.yml](.github/workflows/update-sitemaps.yml)

**Nuevo flujo**:
```
┌─ Detecta cambios en data/products.ts ─┐
│  o data/seo.ts                        │
│  o scripts/generate-sitemap.ts        │
└────────────────────────────────────────┘
         ↓
    Genera sitemaps (sitemap.xml, sitemap-products.xml, etc.)
         ↓
    Commit automático a repositorio
         ↓
    Deploy a Vercel con --prod ✨ (NUEVO)
         ↓
    Verifica NO hay header X-Robots-Tag: noindex
         ↓
    Notifica a Google y Bing (ping automático)
```

**Requiere secret de GitHub**: `VERCEL_TOKEN`

### 3. ✅ Verificación de Headers SEO
El workflow ahora verifica que:
- ❌ NO existe `X-Robots-Tag: noindex` (bloquea indexación)
- ✅ `robots.txt` declara todos los sitemaps
- ✅ Los sitemaps se generaron correctamente

---

## 🔧 Configuración Requerida

### A. Setup del Token de Vercel

1. **Obtener VERCEL_TOKEN**:
   ```bash
   # En tu máquina local, consigue el token
   npx vercel login
   # El token se guardará en ~/.vercel/auth.json
   ```

2. **Añadir a GitHub Secrets**:
   - Ve a: https://github.com/tuusuario/turepositorio/settings/secrets/actions
   - Click en "New repository secret"
   - **Name**: `VERCEL_TOKEN`
   - **Value**: Copia el token de `~/.vercel/auth.json` (la parte después de `"token":`)

3. **Verificar en GitHub Actions**:
   ```
   Settings → Secrets and variables → Actions → VERCEL_TOKEN ✓
   ```

### B. Verificar Configuración de Vercel

**El vercel.json ya está correcto**:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        // ✅ BUENO: No hay X-Robots-Tag: noindex
        // ✅ BUENO: Otros headers de seguridad sí están presentes
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

## 📝 Cómo Usar el Componente JsonLd

### Ejemplo 1: En la página principal (App.tsx)

```tsx
import { JsonLd } from './components/JsonLd';
import { BUSINESS_INFO } from './data/seo';

export default function App() {
  return (
    <>
      {/* Schema de Organization - SE INYECTA EN HEAD */}
      <JsonLd 
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BUSINESS_INFO.name,
          description: BUSINESS_INFO.description,
          url: BUSINESS_INFO.url,
          logo: BUSINESS_INFO.logo,
          email: BUSINESS_INFO.email,
          telephone: BUSINESS_INFO.phone,
          sameAs: BUSINESS_INFO.sameAs,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Avenida ferrocarril 805- D',
            addressLocality: 'Oaxaca',
            postalCode: '68000',
            addressCountry: 'MX'
          }
        }}
        id="org-schema"
      />
      
      {/* REST DEL CONTENIDO */}
    </>
  );
}
```

### Ejemplo 2: En ProductList.tsx (Múltiples productos)

```tsx
import { JsonLd } from './components/JsonLd';
import { products } from '../data/products';

export default function ProductList() {
  const productSchemas = products.map(product => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0],
    brand: {
      '@type': 'Brand',
      name: 'Pinturas Diamante'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price: product.price
    }
  }));

  return (
    <>
      {/* Schema de cada producto */}
      {productSchemas.map((schema, idx) => (
        <JsonLd 
          key={idx}
          data={schema}
          id={`product-${idx}`}
        />
      ))}
      
      {/* CONTENIDO VISUAL */}
    </>
  );
}
```

### Ejemplo 3: En ProductDetail.tsx (JSON-LD enriquecido)

```tsx
import { JsonLd } from './components/JsonLd';

export default function ProductDetail({ product }) {
  return (
    <>
      {/* Schema de Producto Detallado */}
      <JsonLd 
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          '@id': `https://pinturasdiamante.com/product/${product.id}`,
          name: product.name,
          description: product.description,
          image: product.images,
          brand: {
            '@type': 'Brand',
            name: 'Pinturas Diamante'
          },
          manufacturer: {
            '@type': 'Organization',
            name: 'Pinturas Diamante'
          },
          offers: {
            '@type': 'Offer',
            url: `https://pinturasdiamante.com/product/${product.id}`,
            priceCurrency: 'MXN',
            price: product.price,
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 4.5,
            reviewCount: product.reviewCount || 0
          }
        }}
        id="product-detail"
      />
      
      {/* CONTENIDO */}
    </>
  );
}
```

---

## 📊 Verificación de Funcionamiento

### 1. Verificar que el componente se renderiza en HTML

```bash
# Después del build, busca en dist/index.html
grep -A 2 'application/ld+json' dist/index.html
# Deberías ver: <script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```

### 2. Probar en Google Rich Results

1. Ve a: https://search.google.com/test/rich-results
2. Pega la URL de tu sitio
3. Verifica que Google ve los schemas correctamente

### 3. Verificar robots.txt en Vercel

```bash
# Verificar que robots.txt es accesible
curl -s https://pinturasdiamante.com/robots.txt | grep Sitemap
# Deberías ver todas tus líneas Sitemap:
# Sitemap: https://pinturasdiamante.com/sitemap.xml
# Sitemap: https://pinturasdiamante.com/sitemap-products.xml
# etc.
```

### 4. Verificar que NO hay header noindex

```bash
# Verifica headers HTTP
curl -I https://pinturasdiamante.com/
# NO deberías ver: X-Robots-Tag: noindex
# SÍ deberías ver: Strict-Transport-Security (u otros)
```

---

## 🚀 Próximas Ejecuciones del Workflow

El workflow se dispara automáticamente cuando:
1. ✅ Cambios en `data/products.ts`
2. ✅ Cambios en `data/seo.ts`
3. ✅ Cambios en `scripts/generate-sitemap.ts`
4. ✅ Cambios en componentes
5. ✅ Manual: Via "Run workflow" en GitHub Actions

### Timeline esperado:
```
Push a main/develop (5-10 min después)
  ↓
Genera sitemaps (2-3 min)
  ↓
Deploy a Vercel (3-5 min)
  ↓
Nuevo contenido live en pinturasdiamante.com ✨
  ↓
Google crawl dentro de 24-48 horas
```

---

## ⚠️ Troubleshooting

### Problema: "Deploy still waiting"
- Verifica que `VERCEL_TOKEN` está en GitHub Secrets
- Revisa logs en GitHub Actions
- Aumenta timeout a `timeout: 600` en workflow

### Problema: "X-Robots-Tag: noindex" aparece
- Busca en vercel.json: `grep -r "noindex" .`
- Elimina cualquier header que tenga `noindex`
- Redeploy

### Problema: Sitemaps no se generan
- Verifica que `npm run sitemap:generate` funciona localmente
- Revisa que `scripts/generate-sitemap.ts` existe
- Verifica permisos de GitHub: Settings → Actions → Permissions

---

## 🔐 Notas de Seguridad

- ✅ VERCEL_TOKEN solo tiene permisos de deploy
- ✅ No se almacena en repositorio
- ✅ Se rota automáticamente por GitHub
- ✅ Usar siempre en secrets, nunca en variables públicas

