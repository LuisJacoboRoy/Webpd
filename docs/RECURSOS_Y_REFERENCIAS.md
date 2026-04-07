# 🔗 RECURSOS Y REFERENCIAS

Referencia rápida de documentos, herramientas y recursos para microformatos JSON-LD

---

## 📚 DOCUMENTACIÓN INTERNA

| Documento | Propósito | Para quién |
|-----------|-----------|-----------|
| [RESUMEN_MICROFORMATOS.md](RESUMEN_MICROFORMATOS.md) | Resumen ejecutivo | Managers/Supervisores |
| [MICROFORMATOS_GUIDE.md](MICROFORMATOS_GUIDE.md) | Guía completa y detallada | Desarrolladores |
| [MICROFORMATOS_EJEMPLOS.tsx](MICROFORMATOS_EJEMPLOS.tsx) | Código listo para copiar | Desarrolladores |
| [IMPLEMENTACION_CHECKLIST.md](IMPLEMENTACION_CHECKLIST.md) | Paso a paso de instalación | Desarrolladores |

---

## 🛠️ GENERADORES EN EL CÓDIGO

Ubicación: `utils/schemaGenerators.ts`

```typescript
// Importar
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateProductSchema,
  generateProductCollectionSchema,
  generateFAQSchema,
  generateContactSchema,
  generateAggregateOfferSchema,
  generateVideoSchema,
  generateReviewSchema,
  generateSpeakableSchema,
  generateGraphSchema
} from '../utils/schemaGenerators';
```

### Generadores disponibles

| Función | Uso | Retorna |
|----------|-----|---------|
| `generateOrganizationSchema()` | Empresa/Local | Schema Object |
| `generateBreadcrumbSchema(items)` | Navegación | Schema Object |
| `generateProductSchema(data)` | Productos | Schema Object |
| `generateProductCollectionSchema(...)` | Categorías | Schema Object |
| `generateFAQSchema(faqs)` | Preguntas | Schema Object |
| `generateContactSchema()` | Contacto | Schema Object |
| `generateAggregateOfferSchema(...)` | Múltiples ofertas | Schema Object |
| `generateVideoSchema(...)` | Videos | Schema Object |
| `generateReviewSchema(...)` | Reseñas | Schema Object |
| `generateSpeakableSchema(...)` | Google Assistant | Schema Object |
| `generateGraphSchema(schemas)` | Graph múltiple | Schema Object |

---

## 🪝 HOOKS PERSONALIZADOS

Ubicación: `hooks/useOrganizationSchema.ts`

```typescript
// Hook
import { useOrganizationSchema } from '../hooks/useOrganizationSchema';
useOrganizationSchema(); // Se ejecuta al montar

// O Componente Helmet
import { OrganizationSchemaHelmet } from '../hooks/useOrganizationSchema';
<OrganizationSchemaHelmet />
```

---

## 🧩 COMPONENTES

Ubicación: `components/BreadcrumbSchema.tsx`

```typescript
import BreadcrumbSchema from '../components/BreadcrumbSchema';

<BreadcrumbSchema
  items={[
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalog' }
  ]}
/>
```

---

## ✅ VALIDADOR

Ubicación: `utils/schemaValidator.ts`

```javascript
// En consola del navegador
validateAllSchemas()           // Valida todos
printSEORecommendations()      // Recomendaciones de CTR
```

---

## 🌐 HERRAMIENTAS ONLINE

### Google Tools

| Herramienta | URL | Para qué |
|-----------|-----|---------|
| **Rich Results Test** | https://search.google.com/test/rich-results | Validar rich snippets |
| **Mobile-Friendly Test** | https://search.google.com/test/mobile-friendly | Mobile compatibility |
| **Search Console** | https://search.google.com/search-console/ | Monitoreo de indexación |
| **PageSpeed Insights** | https://pagespeed.web.dev/ | Rendimiento |

### Schema Validators

| Herramienta | URL | Para qué |
|-----------|-----|---------|
| **Schema.org Validator** | https://validator.schema.org/ | Validar JSON-LD |
| **JSON-LD Playground** | https://json-ld.org/playground/ | Editar y visualizar |
| **Semantic Web Validator** | https://www.w3.org/RDF/Validator/ | W3C validation |
| **Moz Markup Helper** | https://moz.com/tools/seo-toolbar | Chrome extension |

### SEO Tools

| Herramienta | URL | Para qué |
|-----------|-----|---------|
| **Ahrefs** | https://ahrefs.com/ | Auditoría completa |
| **SEMrush** | https://www.semrush.com/ | Análisis competitivo |
| **Screaming Frog** | https://www.screamingfrog.co.uk/ | Rastreo de sitio |
| **Yoast SEO** | https://yoast.com/wordpress/plugins/seo/ | Plugin SEO |

---

## 📖 DOCUMENTACIÓN OFICIAL

### Schema.org

| Recurso | URL | Contenido |
|---------|-----|----------|
| **Schema.org Home** | https://schema.org/ | Documentación oficial |
| **Product Type** | https://schema.org/Product | Product schema docs |
| **LocalBusiness** | https://schema.org/LocalBusiness | LocalBusiness schema |
| **BreadcrumbList** | https://schema.org/BreadcrumbList | BreadcrumbList schema |
| **FAQPage** | https://schema.org/FAQPage | FAQPage schema |
| **Organization** | https://schema.org/Organization | Organization schema |

### Google Developers

| Recurso | URL | Contenido |
|---------|-----|----------|
| **Structured Data Intro** | https://developers.google.com/search/docs/beginner/intro-structured-data | Introducción |
| **Structured Data Docs** | https://developers.google.com/search/docs/advanced/structured-data/ | Documentación completa |
| **Search Gallery** | https://www.google.com/search/howsearchworks/gallery/ | Galería de features |
| **Rich Results Gallery** | https://developers.google.com/search/docs/appearance/rich-results | Rich results |

---

## 📊 ARTÍCULOS Y GUÍAS

### Guías de Implementación

- [**Moz: Schema Structured Data**](https://moz.com/learn/seo/schema-structured-data)
- [**Search Engine Journal: JSON-LD**](https://www.searchenginejournal.com/schema-markup/)
- [**Yoast: Schema Markup**](https://yoast.com/schema/structured-data-schema-org/)
- [**Backlinko: Schema Markup Guide**](https://backlinko.com/hub/seo/schema-markup)

### Casos de Uso

- [**Ecommerce Schema Guide**](https://schema.org/docs/e-commerce.html)
- [**Local Business Guide**](https://schema.org/docs/local_business.html)
- [**Healthcare/Medical Schema**](https://schema.org/docs/health-lifesci.html)

---

## 🎓 CURSOS Y TUTORIALES

### YouTube Playlists

- [**Google Search Central Channel**](https://www.youtube.com/c/GoogleSearchCentral)
  - Tutorials on structured data
  - SEO best practices

- [**Moz YouTube Channel**](https://www.youtube.com/c/MozChannel)
  - Schema markup tutorials
  - SEO strategy videos

### Online Courses

- [**Google Search Central Training**](https://support.google.com/webmasters)
- [**Udemy: Structured Data & Schema Markup**](https://www.udemy.com/search/?q=schema+markup)
- [**Coursera: Web Basics**](https://www.coursera.org/search?query=structured%20data)

---

## 🔧 GENERADORES AUTOMÁTICOS

### Online Generators

| Generador | URL | Para qué |
|----------|-----|---------|
| **Google Schema Markup Helper** | (Deprecated) | Históricamente usado |
| **JSON-LD Generator** | https://www.json-ld.org/playground/ | Visualizar JSON-LD |
| **Merkle Schema Generator** | https://www.merkle.com/us/en/services/tools/schema-markup-generator | Generar schemas |
| **TechnicalSEO.com: Rich Snippet Generator** | https://www.technicalseo.com/tools/ | Generar snippets |

---

## 💻 BIBLIOTECAS Y FRAMEWORKS

### JavaScript/TypeScript

```typescript
// Nuestra implementación
import { generateProductSchema } from './utils/schemaGenerators';

// Alternativas populares
// - json-ld/js
// - structured-data package
// - schema.js
```

### React Específico

```typescript
// Con Helmet (nosotros usamos)
import { Helmet } from '@dr.pogodin/react-helmet';

// Con Next.js
import Head from 'next/head';

// Con Vue
<head>
  <script type="application/ld+json">
    {{ schema }}
  </script>
</head>
```

---

## 📋 CHECKLIST DE VALIDACIÓN

### Antes de publicar

- [ ] `validateAllSchemas()` en consola sin errores
- [ ] Google Rich Results Test pasa
- [ ] Schema.org Validator sin errores
- [ ] URLs son absolutas (https://...)
- [ ] Imágenes tienen URLs completas
- [ ] No hay duplicación de schemas
- [ ] Precios sono correctos (si aplica)
- [ ] Información de contacto está completa
- [ ] Horarios son precisos
- [ ] Coordenadas GPS están correctas

### Después de publicar

- [ ] Enviar sitemap a Google Search Console
- [ ] Esperar 24-48 horas
- [ ] Revisar "Enhancements" en GSC
- [ ] Monitorear CTR en Performance
- [ ] Comparar métricas antes/después

---

## 🚨 TROUBLESHOOTING

### Problema: Schema no aparece en consola

**Solución:**
```javascript
// 1. Verificar que el script está en el HTML
document.querySelectorAll('script[type="application/ld+json"]')

// 2. Verificar estructura del JSON
JSON.parse(script.textContent)

// 3. Usar validador
validateAllSchemas()
```

### Problema: URLs relativas en schema

**Mal:**
```json
{
  "image": "/img/product.jpg",
  "url": "/#/product/123"
}
```

**Bien:**
```json
{
  "image": "https://domain.com/img/product.jpg",
  "url": "https://domain.com/#/product/123"
}
```

### Problema: Rich results no aparecen en Google

Causas comunes:
1. URL no está indexada aún
2. Esperar 24-48 horas
3. Schema tiene errores (validar)
4. Datos no coinciden con contenido visible
5. Google aún no ha rastreado cambios

**Soluciones:**
```bash
# 1. Forzar rastreo en GSC
Search Console → URL Inspection → Request Indexing

# 2. Verificar errores
validateAllSchemas()

# 3. Usar Google Rich Results Test
https://search.google.com/test/rich-results
```

---

## 📞 CONTACTO Y SOPORTE

### Comunidades

- [**Stack Overflow: structured-data**](https://stackoverflow.com/questions/tagged/structured-data)
- [**Google Webmaster Community**](https://support.google.com/webmasters/community)
- [**Reddit: r/SEO**](https://reddit.com/r/seo)
- [**Reddit: r/webdev**](https://reddit.com/r/webdev)

### Direct Support

- [**Google Search Central Help**](https://support.google.com/webmasters)
- [**Schema.org GitHub Issues**](https://github.com/schemaorg/schemaorg/issues)
- [**W3C HTML Validator**](https://validator.w3.org/)

---

## 🎯 PROXIMAS LECTURAS RECOMENDADAS

1. **Primero:** RESUMEN_MICROFORMATOS.md
2. **Segundo:** MICROFORMATOS_GUIDE.md
3. **Tercero:** MICROFORMATOS_EJEMPLOS.tsx
4. **Cuarto:** IMPLEMENTACION_CHECKLIST.md
5. **Referencia:** Este archivo (RECURSOS_Y_REFERENCIAS.md)

---

## 📊 PLANTILLAS RÁPIDAS

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Pinturas Diamante",
  "telephone": "+52-951-143-3467",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avenida Ferrocarril 805-D",
    "addressLocality": "Oaxaca",
    "addressRegion": "Oaxaca",
    "postalCode": "68000",
    "addressCountry": "MX"
  }
}
```

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Producto",
  "description": "Descripción",
  "image": "https://domain.com/img.jpg",
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "MXN"
  }
}
```

### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://domain.com/"
    }
  ]
}
```

---

**Última actualización:** 7 de abril de 2026  
**Versión:** 1.0  
**Completitud:** 100%
