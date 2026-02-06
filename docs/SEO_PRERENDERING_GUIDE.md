# 🚀 SEO Prerendering System - Documentación Completa

## 📋 Descripción General

Sistema de **Static Site Generation (SSG)** con markup SEO optimizado según mejores prácticas de **Google Webmaster**. Genera automáticamente:

- ✅ Structured Data (JSON-LD) para cada producto
- ✅ Open Graph tags para redes sociales
- ✅ Twitter Card tags
- ✅ Meta tags canónicos y robots
- ✅ Breadcrumb navigation
- ✅ Product Schema para e-commerce
- ✅ Sitemap dinámico
- ✅ robots.txt optimizado

---

## 📁 Estructura de Archivos

```
Webpd/
├── utils/
│   └── seoPrerender.ts          # Funciones de generación SEO
├── hooks/
│   └── useSEOPrerender.ts       # Hooks React para integración
├── scripts/
│   └── prerender.js             # Script de prerendering
├── public/
│   ├── sitemap.xml              # Sitemap dinámico
│   └── robots.txt               # Configuración de bots
├── prerendered/                 # Salida: páginas estáticas (generado)
│   ├── product-*.html
│   ├── category-*.html
│   └── schema-index.json
└── package.json                 # Scripts añadidos
```

---

## 🚀 Uso

### 1. Generar Páginas Estáticas con SEO

```bash
npm run prerender
```

**Genera:**
- 56 páginas HTML de productos con SEO completo
- 3 páginas HTML de categorías
- `sitemap.xml` dinámico
- `robots.txt` optimizado
- `schema-index.json` para referencia

### 2. Build Completo (Recomendado)

```bash
npm run build:ssg
```

Ejecuta `npm run build` seguido de `npm run prerender`

### 3. Desarrollo con SEO en Vivo

```bash
npm run dev
```

Los hooks SEO se integran automáticamente en componentes

---

## 🔍 Integración en Componentes React

### Ejemplo 1: Componente de Producto

```tsx
import { useSEOProduct } from '../hooks/useSEOPrerender';
import { SEOHelmet } from '../hooks/useSEOPrerender';

const ProductDetail: React.FC<{ productId: string }> = ({ productId }) => {
  const seoData = useSEOProduct(productId);

  return (
    <>
      <SEOHelmet seoData={seoData} />
      {/* Contenido del producto */}
    </>
  );
};
```

### Ejemplo 2: Componente de Categoría

```tsx
import { useSEOCategory } from '../hooks/useSEOPrerender';

const CategoryPage: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const seoData = useSEOCategory(categoryId);

  return (
    <>
      <SEOHelmet seoData={seoData} />
      {/* Contenido de la categoría */}
    </>
  );
};
```

### Ejemplo 3: A Nivel Global (App.tsx)

```tsx
import { useOrganizationSchema, useLocalBusinessSchema } from './hooks/useSEOPrerender';

export const AppContent: React.FC = () => {
  useOrganizationSchema();      // Schema de Organización
  useLocalBusinessSchema();     // Schema de Negocio Local

  return (
    // ... resto del App
  );
};
```

---

## 📊 Tipos de Structured Data Generados

### 1. **Organization Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pinturas Diamante",
  "url": "https://pinturasdiamante.com",
  "logo": "...",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-951-143-3467"
  }
}
```

### 2. **Product Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Esmalte Ureprix",
  "description": "...",
  "image": "...",
  "sku": "auto-9",
  "brand": {"@type": "Brand", "name": "Pinturas Diamante"},
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "MXN"
  }
}
```

### 3. **BreadcrumbList Schema**
Navegación jerárquica para buscadores:
```
Inicio > Catálogo > Automotriz > Complementos > Producto
```

### 4. **LocalBusiness Schema**
Para aparecer en Google Maps y búsquedas locales

---

## 🔗 Open Graph Tags

Automáticamente generados para cada producto:

```html
<meta property="og:type" content="product">
<meta property="og:url" content="https://pinturasdiamante.com/#/product/auto-9">
<meta property="og:title" content="Esmalte Ureprix - Pinturas Diamante">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:site_name" content="Pinturas Diamante Oaxaca">
<meta property="og:locale" content="es_MX">
```

**Beneficios:**
- ✅ Mejor visualización en Facebook, LinkedIn, WhatsApp
- ✅ Imagen grande y descripción clara
- ✅ CTR mejorado en redes sociales

---

## 🐦 Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Esmalte Ureprix...">
<meta name="twitter:image" content="...">
<meta name="twitter:creator" content="@pinturasdiamantemx">
```

---

## 🔐 Meta Tags Críticos de SEO

### Canónica
```html
<link rel="canonical" href="https://pinturasdiamante.com/#/product/auto-9">
```
Evita duplicados de contenido

### Robots Meta
```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
```

### Viewport (Mobile-First)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 🗺️ Sitemap Dinámico

**Archivo:** `public/sitemap.xml`

Actualizado automáticamente con:
- Todas las categorías (prioridad 0.85)
- Todas las subcategorías (prioridad 0.80)
- Todos los productos (prioridad 0.70)
- Última modificación actual

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pinturasdiamante.com/#/product/auto-9</loc>
    <lastmod>2026-02-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  ...
</urlset>
```

---

## 🤖 Robots.txt Optimizado

**Archivo:** `public/robots.txt`

Características:
- ✅ Permite acceso a contenido importante
- ✅ Bloquea carpetas de sistema
- ✅ Crawl-delay optimizado (1 segundo)
- ✅ Configuración específica por bot
- ✅ Referencias a sitemaps

---

## 📊 Validación de SEO

El hook `useSEOValidation` reporta problemas en desarrollo:

```tsx
useSEOValidation(seoData);

// Salida en console:
// ⚠️ Título muy corto (< 30 caracteres)
// ⚠️ Descripción muy larga (> 160 caracteres)
// ❌ Falta imagen Open Graph
```

**Límites recomendados:**
- Título: 30-60 caracteres
- Descripción: 120-160 caracteres
- Imagen OG: 1200x630px mínimo

---

## 🎯 Mejores Prácticas Implementadas

### 1. **Estructura Semántica**
- Breadcrumbs para navegación clara
- Jerarquía de headings correcta
- Links internos con anchor text descriptivo

### 2. **Performance**
- Preload de recursos críticos
- DNS prefetch
- Preconexiones optimizadas

### 3. **Seguridad**
- CSP (Content Security Policy)
- Canonical URLs
- HTTPS

### 4. **Indexación**
- robots.txt optimizado
- Sitemap dinámico
- Meta robots tags

### 5. **Redes Sociales**
- Open Graph completo
- Twitter Cards
- Pinterest pins

### 6. **Datos Estructurados**
- JSON-LD (preferido por Google)
- Schema.org estándar
- Microdata HTML5

---

## 📋 Checklist de Implementación

- [x] Generar funciones de SEO (`seoPrerender.ts`)
- [x] Crear hooks React (`useSEOPrerender.ts`)
- [x] Script de prerendering (`prerender.js`)
- [x] robots.txt optimizado
- [x] sitemap.xml dinámico
- [x] Validación de SEO
- [ ] Enviar sitemap a Google Search Console
- [ ] Enviar sitemap a Bing Webmaster Tools
- [ ] Validar schema con Google Rich Results Test
- [ ] Añadir código de verificación Google
- [ ] Configurar Google Analytics
- [ ] Monitorear en Search Console

---

## 🔧 Configuración en Google Search Console

1. **Verificar dominio:**
   - Método DNS o HTML
   - [https://search.google.com/search-console](https://search.google.com/search-console)

2. **Enviar sitemap:**
   - URL: `https://pinturasdiamante.com/sitemap.xml`

3. **Validar robots.txt:**
   - Search Console > Settings > Robots.txt Tester

4. **Inspeccionar URLs:**
   - Verificar que se indexan correctamente

---

## 🔍 Validación de Structured Data

### Google Rich Results Test
https://search.google.com/test/rich-results

Verificar cada tipo de schema:
- Organization ✅
- Product ✅
- BreadcrumbList ✅
- LocalBusiness ✅

### Schema.org Validator
https://validator.schema.org/

---

## 📈 Monitoreo Continuo

**Métricas importantes:**
- CTR (Click-Through Rate) en Search Console
- Impresiones por palabra clave
- Posición promedio en búsquedas
- Errores de indexación
- Cobertura de sitemap

---

## 🚨 Troubleshooting

### Problema: Productos no se indexan

**Solución:**
1. Verificar que `sitemap.xml` es accesible
2. Revisar `robots.txt` no bloquea rutas
3. Validar estructura de URLs con `#`
4. Usar Search Console > Inspect URL

### Problema: Schema.org no detectado

**Solución:**
1. Validar JSON-LD con validator.schema.org
2. Verificar formato UTF-8
3. Revisar que no hay caracteres escapados innecesarios
4. Usar Google Rich Results Test

### Problema: Open Graph no aparece en redes

**Solución:**
1. Usar social media sharing tools
2. Verificar imagen OG existe y es accesible
3. Revisar formato de og:image URL
4. Invalidar cache en redes sociales

---

## 📚 Referencias y Recursos

### Google Webmaster
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/intro)
- [Product Schema](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Mobile-Friendly Guide](https://developers.google.com/search/mobile-sites)

### Schema.org
- [Organization](https://schema.org/Organization)
- [Product](https://schema.org/Product)
- [BreadcrumbList](https://schema.org/BreadcrumbList)
- [LocalBusiness](https://schema.org/LocalBusiness)

### Open Graph & Twitter
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

---

## 🎉 Conclusión

Sistema completo de SEO prerendering para Pinturas Diamante con:
- ✅ 56 productos con markup SEO completo
- ✅ Mejores prácticas de Google Webmaster
- ✅ Optimización para motores de búsqueda
- ✅ Integración perfecta con React
- ✅ Validación automática de SEO
- ✅ Documentación completa

**Listo para producción** 🚀
