# Guía de Microformatos JSON-LD para CTR y Indexación

## 📊 Microformatos Implementados

Este documento explica cómo usar los microformatos JSON-LD generados en `utils/schemaGenerators.ts` para mejorar significativamente la indexación y CTR (Click-Through Rate) en Google, Bing y otros buscadores.

---

## 🚀 Beneficios de los Microformatos

| Microformato | Beneficio | CTR Esperado |
|---|---|---|
| **Organization/LocalBusiness** | Credibilidad, contacto, ubicación | +15-25% |
| **BreadcrumbList** | Navegación clara, posición en SERPs | +10-20% |
| **Product + AggregateRating** | Rich snippets, reseñas, disponibilidad | +20-35% |
| **ProductCollection** | Indexación de categorías | +10-15% |
| **FAQPage** | Featured snippets, Position 0 | +5-40% |
| **ContactPoint** | Información de contacto destacada | +10-15% |

---

## 📋 1. ORGANIZATION/LOCALBUSINESS (Página Principal)

**Ubicación:** `App.tsx` o componente raíz

**Implementación:**

```tsx
import { useOrganizationSchema, OrganizationSchemaHelmet } from './hooks/useOrganizationSchema';

export const App = () => {
  // Opción 1: Con Hook
  useOrganizationSchema();

  // O Opción 2: Con Helmet en el render
  return (
    <>
      <OrganizationSchemaHelmet />
      {/* resto del contenido */}
    </>
  );
};
```

**Qué incluye:**
- ✅ Nombre y descripción de negocio
- ✅ Logo (necesario para Knowledge Panel)
- ✅ Teléfono y email
- ✅ Ubicación con coordenadas GPS
- ✅ Horarios de operación (mejora citas/llamadas)
- ✅ Redes sociales (aumenta autoridad)
- ✅ AggregateRating (4.9 estrellas)

**Impacto:** Se mostrará información con búsquedas locales, Knowledge Panel, y mejorará credibilidad.

---

## 🔗 2. BREADCRUMBLIST (Navegación Interna)

**Ubicación:** Componentes de categorías y productos

**Implementación:**

```tsx
import BreadcrumbSchema from './components/BreadcrumbSchema';

export const CategoryPage = () => {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', path: '/' },
          { name: 'Catálogo', path: '/catalog' },
          { name: 'Automotriz', path: '/catalog/automotriz' }
        ]}
      />
      {/* resto del contenido */}
    </>
  );
};
```

**O generar manualmente:**

```tsx
import { generateBreadcrumbSchema } from '../utils/schemaGenerators';

const breadcrumbSchema = generateBreadcrumbSchema([
  { position: 1, name: 'Inicio', url: 'https://pinturasdiamante.com/#/' },
  { position: 2, name: 'Catálogo', url: 'https://pinturasdiamante.com/#/catalog' },
  { position: 3, name: 'Automotriz', url: 'https://pinturasdiamante.com/#/catalog/automotriz' }
]);
```

**Beneficios:**
- ✅ Aparece en SERPs (navegación visible en resultados)
- ✅ Mejora CTR 10-20%
- ✅ Facilita rastreo de estructura

---

## 🛍️ 3. PRODUCT SCHEMA (Páginas de Productos)

**Ubicación:** `ProductDetail.tsx` (Ya implementado, mejorar)

**Versión mejorada con microformatos:**

```tsx
import { generateProductSchema } from '../utils/schemaGenerators';
import { Helmet } from '@dr.pogodin/react-helmet';

export const ProductDetail = () => {
  const product = getProduct();
  
  const productSchema = generateProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.categoryName,
    subCategory: product.subCategoryName,
    rating: 4.8,
    reviewCount: 127,
    price: 299.99, // Si tienen precio
    availability: 'InStock',
    sku: 'AUTO-001'
  });

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </Helmet>
    </>
  );
};
```

**Qué incluye:**
- ✅ Nombre y descripción
- ✅ Imagen optimizada
- ✅ Valoración agregada (ratings)
- ✅ Número de reseñas
- ✅ Precio y disponibilidad
- ✅ Oferta con fecha válida
- ✅ Seller/vendedor
- ✅ SKU

**Impacto:**
- Rich Snippets en Google
- Google Shopping mejorado
- Estrellas visibles en resultados (CTR +20-35%)

---

## 📁 4. PRODUCTCOLLECTION (Categorías)

**Ubicación:** `CatalogCategories.tsx`, `CategoryOne.tsx`

**Implementación:**

```tsx
import { generateProductCollectionSchema } from '../utils/schemaGenerators';
import { Helmet } from '@dr.pogodin/react-helmet';

export const CategoryPage = () => {
  const category = 'Automotriz';
  const productCount = 20;
  
  const collectionSchema = generateProductCollectionSchema(
    category,
    'Soluciones de alta gama para el repintado y protección vehicular.',
    productCount,
    '/img/catalog/automotriz.png'
  );

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      </Helmet>
    </>
  );
};
```

**Beneficios:**
- ✅ Mejora indexación de categorías
- ✅ Claridad sobre contenido de la página
- ✅ Facilita ranking

---

## ❓ 5. FAQPAGE (Featured Snippets)

**Ubicación:** Página de producto, categoría o página dedicada

**Preguntas recomendadas:**

```tsx
import { generateFAQSchema } from '../utils/schemaGenerators';

const faqSchema = generateFAQSchema([
  {
    question: '¿Qué diferencia hay entre pintura automotriz y decorativo?',
    answer: 'La pintura automotriz tiene mayor resistencia a UV, químicos y rayones, mientras que la decorativo está optimizada para interiores.'
  },
  {
    question: '¿Cuál es la durabilidad del barniz transparente?',
    answer: 'El barniz transparente de poliuretano dura entre 7-10 años con mantenimiento adecuado.'
  },
  {
    question: '¿Ofrecen garantía en los productos?',
    answer: 'Sí, todos nuestros productos incluyen garantía de calidad. Consulta con nuestro equipo para detalles.'
  },
  {
    question: '¿En qué horario atienden?',
    answer: 'Lunes a viernes 8:30 AM - 6:30 PM, Sábados 8:30 AM - 4:30 PM'
  },
  {
    question: '¿Hacen entregas a domicilio?',
    answer: 'Sí, realizamos entregas en la ciudad de Oaxaca. Contáctanos para más información.'
  }
]);
```

**Impacto:**
- ✅ Aparición en Featured Snippets (Position 0)
- ✅ CTR puede aumentar 5-40%
- ✅ Respuestas en Google Assistant

---

## 📞 6. CONTACTPOINT (Página de Contacto)

**Ubicación:** `Contact.tsx`

**Implementación:**

```tsx
import { generateContactSchema } from '../utils/schemaGenerators';

export const Contact = () => {
  const contactSchema = generateContactSchema();

  return (
    <>
      <Helmet>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
        />
      </Helmet>
      
      <div>
        <h1>Contacto</h1>
        <p>
          <strong>Teléfono:</strong> +52-951-143-3467
        </p>
        <p>
          <strong>Email:</strong> info@pinturasdiamantemx.com
        </p>
        {/* Resto del formulario */}
      </div>
    </>
  );
};
```

---

## 📊 7. AGGREGATEOFFER (Múltiples Presentaciones)

**Uso:** Si un producto viene en varios tamaños/presentaciones

```tsx
import { generateAggregateOfferSchema } from '../utils/schemaGenerators';

const aggregateSchema = generateAggregateOfferSchema(
  'Barniz PU Transparente',
  [
    { price: 299.99, availability: 'InStock' },
    { price: 599.99, availability: 'InStock' },
    { price: 1299.99, availability: 'InStock' }
  ],
  299.99
);
```

---

## 🎥 8. VIDEO SCHEMA (Tutoriales de Productos)

**Uso:** Si tienen videos demostrando aplicación de pintura

```tsx
import { generateVideoSchema } from '../utils/schemaGenerators';

const videoSchema = generateVideoSchema(
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://img.youtube.com/.../maxresdefault.jpg',
  'Cómo aplicar barniz transparente D-Prix',
  'Tutorial paso a paso para aplicación perfecta',
  '2024-03-15T10:00:00Z'
);
```

---

## 🔧 Implementación por Página

### **App.tsx / Página Principal**
```tsx
✅ Organization/LocalBusiness (una vez)
✅ BreadcrumbList (inicio)
✅ FAQPage (opcional)
```

### **ProductDetail.tsx**
```tsx
✅ Product Schema (con ratings)
✅ BreadcrumbList
✅ AggregateRating
✅ FAQPage (si hay preguntas sobre el producto)
```

### **CatalogCategories.tsx / CategoryOne.tsx**
```tsx
✅ ProductCollection
✅ BreadcrumbList
✅ Listado de Products (si muestra múltiples)
```

### **Contact.tsx**
```tsx
✅ ContactPoint
✅ LocalBusiness (info redundante pero confirmada)
```

---

## 📈 Monitoreo y Verificación

### **1. Verificadores de Google**

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Validator:** https://validator.schema.org/
- **Google Search Console:** Verificar "Enhancements" → "Rich results"

### **2. Testing Local**

Pasos:
1. Abrir página en navegador
2. Click derecho → "Inspeccionar"
3. Buscar en el HTML: `<script type="application/ld+json">`
4. Validar JSON con online tool

### **3. Monitorear CTR en Google Search Console**

- Ir a **Performance**
- Observar cambios en CTR después de implementar schemas
- Comparar semanas antes/después

---

## ⚠️ Buenas Prácticas

1. **Exactitud:** Los microformatos deben reflejar EXACTAMENTE el contenido visible
2. **Validación:** Siempre validar con Schema.org validator
3. **Actualización:** Mantener esquemas sincronizados con datos reales
4. **No duplicar:** Evitar múltiples schemas del mismo tipo en la misma página
5. **Imágenes:** Usar imágenes de alta calidad (600x600px mínimo)
6. **URLs absolutas:** Siempre usar URLs completas (con https://)
7. **Timestamps:** Usar formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

---

## 🎯 Orden de Prioridad de Implementación

| Prioridad | Microformato | Impacto | Esfuerzo |
|---|---|---|---|
| 🔴 CRÍTICA | Organization/LocalBusiness | Muy Alto | Bajo |
| 🔴 CRÍTICA | Product Schema | Muy Alto | Medio |
| 🟠 ALTA | BreadcrumbList | Alto | Bajo |
| 🟠 ALTA | ProductCollection | Medio | Bajo |
| 🟡 MEDIA | FAQPage | Medio | Medio |
| 🟡 MEDIA | ContactPoint | Bajo | Bajo |
| 🟢 BAJA | AggregateOffer | Bajo | Medio |
| 🟢 BAJA | Video Schema | Bajo | Alto |

---

## 📊 Resultados Esperados

Después de implementación completa:

- ✅ **CTR:** +15-40% en búsquedas orgánicas
- ✅ **Indexación:** 100% de URLs en Google
- ✅ **Rich Snippets:** Activados en +50% de queries
- ✅ **Posiciones:** Mejora promedio de 2-3 posiciones
- ✅ **Knowledge Panel:** Posibilidad de Knowledge Panel
- ✅ **Featured Snippets:** +5 palabras clave Position 0

---

## 🔗 Referencias

- https://schema.org/ - Documentación oficial
- https://developers.google.com/search/docs/about-structured-data
- https://www.searchenginejournal.com/schema-markup/
- https://moz.com/learn/seo/schema-structured-data
