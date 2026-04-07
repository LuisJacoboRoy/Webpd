# ✅ CHECKLIST DE IMPLEMENTACIÓN DE MICROFORMATOS

## 🎯 Objetivo
Aumentar CTR (Click-Through Rate) 15-40% y mejorar indexación con microformatos JSON-LD

Tiempo estimado: 2-3 horas | Impacto: 🟥 CRÍTICO

---

## 📋 FASE 1: CONFIGURACIÓN INICIAL (30 min)

- [ ] **1.1** Leer archivos de utilidades creados:
  - `utils/schemaGenerators.ts` - Generadores de schemas
  - `hooks/useOrganizationSchema.ts` - Hook para Organization
  - `components/BreadcrumbSchema.tsx` - Componente de breadcrumbs
  - `docs/MICROFORMATOS_GUIDE.md` - Guía completa

- [ ] **1.2** Revisar `docs/MICROFORMATOS_EJEMPLOS.tsx` con ejemplos prácticos

- [ ] **1.3** Inyectar validador en la aplicación:
  ```tsx
  // En main.tsx o index.tsx, al final
  import './utils/schemaValidator.ts';
  ```

- [ ] **1.4** Probar validador en consola (F12):
  ```
  validateAllSchemas()
  ```

---

## 📍 FASE 2: SCHEMA ORGANIZATION/LOCALBUSINESS (45 min)

**Ubicación:** `App.tsx` o componente raíz

- [ ] **2.1** Importar hook y componente:
  ```tsx
  import { useOrganizationSchema, OrganizationSchemaHelmet } from './hooks/useOrganizationSchema';
  ```

- [ ] **2.2** Añadir a componente raíz:
  ```tsx
  export const App = () => {
    // Opción A: Con hook
    useOrganizationSchema();
    
    // O Opción B: En el render (mejor para Helmet)
    return (
      <>
        <OrganizationSchemaHelmet />
        {/* resto */}
      </>
    );
  };
  ```

- [ ] **2.3** Verificar que la información en `config/seoConfig.ts` está completa:
  - ✓ `business.name` - Nombre de empresa
  - ✓ `business.phone` - Teléfono principal
  - ✓ `business.email` - Email de contacto
  - ✓ `location.latitude` y `location.longitude` - Coordenadas GPS
  - ✓ `location.streetAddress` - Dirección completa
  - ✓ `social.*` - Redes sociales (URLs completas)

- [ ] **2.4** Probar en consola:
  ```
  validateAllSchemas()
  // Debe mostrar Organization válido
  ```

- [ ] **2.5** Validar en Google Rich Results Test:
  https://search.google.com/test/rich-results
  - Copiar URL de sitio
  - Verificar que aparece LocalBusiness schema

**Impacto esperado:**
- ✅ Knowledge Panel potencial
- ✅ Cards de contacto en Google
- ✅ Información de ubicación y horarios

---

## 🛍️ FASE 3: SCHEMA PRODUCT EN ProductDetail.tsx (60 min)

**Ubicación:** `components/ProductDetail.tsx`

- [ ] **3.1** Importar generador de product schema:
  ```tsx
  import { generateProductSchema } from '../utils/schemaGenerators';
  ```

- [ ] **3.2** Verificar que cada producto tiene estos datos en `data/products.ts`:
  - ✓ `id` - Identificador único
  - ✓ `name` - Nombre del producto
  - ✓ `description` - Descripción detallada
  - ✓ `image` - URL de imagen
  - ✓ `categoryId` - Categoría
  - ✓ `subCategoryId` - Subcategoría (si existe)

- [ ] **3.3** Actualizar ProductDetail.tsx con schema mejorado:
  ```tsx
  const productSchema = useMemo(() => generateProductSchema({
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.ogImage || product.image,
    category: category?.name || '',
    subCategory: subCat?.name,
    rating: 4.8,          // Obtener si disponible
    reviewCount: 127,      // Obtener si disponible
    price: 'Consultar',    // Actualizar si tienen precio
    availability: 'InStock',
    sku: `DIAMANTE-${product.id.toUpperCase()}`
  }), [product, category, subCat]);
  
  // En Helmet:
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
  />
  ```

- [ ] **3.4** Inyectar en Helmet:
  En la sección `<Helmet>` de ProductDetail, agregar:
  ```tsx
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
  />
  ```

- [ ] **3.5** Validar con `validateAllSchemas()` en consola

- [ ] **3.6** Probar en Google Rich Results Test (URL con `#/product/auto-1`)

**Impacto esperado:**
- ✅ Rich Snippets con estrellas de valoración
- ✅ Disponibilidad destacada
- ✅ CTR +20-35% en búsquedas de productos

---

## 🔗 FASE 4: BREADCRUMBLIST (40 min)

**Ubicación:** ProductDetail, CatalogCategories, CategoryOne

- [ ] **4.1** Opción A: Usar componente (RECOMENDADO):
  ```tsx
  import BreadcrumbSchema from './components/BreadcrumbSchema';
  
  // En el render:
  <BreadcrumbSchema
    items={[
      { name: 'Inicio', path: '/' },
      { name: 'Catálogo', path: '/catalog' },
      { name: categoryName, path: `/catalog/${categoryId}` }
    ]}
  />
  ```

- [ ] **4.2** Opción B: Generar schema manualmente:
  ```tsx
  import { generateBreadcrumbSchema } from '../utils/schemaGenerators';
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { position: 1, name: 'Inicio', url: baseUrl+'/#/' },
    { position: 2, name: 'Catálogo', url: baseUrl+'/#/catalog' },
    // ... más items
  ]);
  
  // En Helmet:
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
  />
  ```

- [ ] **4.3** Insertar en TODAS estas páginas:
  - [ ] ProductDetail.tsx
  - [ ] CatalogCategories.tsx
  - [ ] CategoryOne.tsx
  - [ ] Contact.tsx (opcionalmente)

- [ ] **4.4** Validar jerarquía:
  - ✓ Primer elemento: Inicio (1)
  - ✓ Último elemento: Página actual
  - ✓ Posiciones consecutivas sin saltos
  - ✓ URLs absolutas (https://...)

- [ ] **4.5** Validar en consola

**Impacto esperado:**
- ✅ Navegación visible en Google
- ✅ CTR +10-20%
- ✅ Mejor rastreo de estructura

---

## 📁 FASE 5: PRODUCTCOLLECTION (30 min)

**Ubicación:** CatalogCategories.tsx, CategoryOne.tsx

- [ ] **5.1** Importar generador:
  ```tsx
  import { generateProductCollectionSchema } from '../utils/schemaGenerators';
  ```

- [ ] **5.2** Generar schema para cada categoría:
  ```tsx
  const collectionSchema = useMemo(() => generateProductCollectionSchema(
    category.name,
    category.description,
    productsInCategory.length,
    category.image
  ), [category]);
  ```

- [ ] **5.3** Inyectar en Helmet:
  ```tsx
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
  />
  ```

- [ ] **5.4** Aplicar en:
  - [ ] Página de Automotriz
  - [ ] Página de Maderas
  - [ ] Página de Decorativo
  - [ ] Subcategorías (si aplica)

- [ ] **5.5** Validar con `validateAllSchemas()`

**Impacto esperado:**
- ✅ Mejor indexación de categorías
- ✅ Claridad del contenido para buscadores

---

## ❓ FASE 6: FAQPAGE - Featured Snippets (45 min)

**Ubicación:** Opcionalmente en ProductDetail o nueva página

- [ ] **6.1** Importar generador:
  ```tsx
  import { generateFAQSchema } from '../utils/schemaGenerators';
  ```

- [ ] **6.2** Crear lista de preguntas frecuentes:
  ```tsx
  const faqSchema = generateFAQSchema([
    {
      question: '¿Cuál es la diferencia entre pintura automotriz y decorativo?',
      answer: 'La pintura automotriz tiene mayor resistencia a UV...'
    },
    // Mínimo 3, máximo 10
  ]);
  ```

- [ ] **6.3** Inyectar donde sea relevante:
  - [ ] Página principal
  - [ ] Página de contacto
  - [ ] Página dedicada FAQ (crear si no existe)

- [ ] **6.4** Hacer que las preguntas/respuestas sean visibles en HTML también:
  ```tsx
  <div className="faq-section">
    {faqSchema.mainEntity.map(item => (
      <div key={item.name}>
        <h3>{item.name}</h3>
        <p>{item.acceptedAnswer.text}</p>
      </div>
    ))}
  </div>
  ```

- [ ] **6.5** Validar en consola

**Impacto esperado:**
- ✅ Featured Snippets (Position 0)
- ✅ CTR +5-40% en búsquedas de preguntas
- ✅ Google Voice Assistant

---

## 📞 FASE 7: CONTACTPOINT/CONTACTPAGE (20 min)

**Ubicación:** Contact.tsx

- [ ] **7.1** Importar generador:
  ```tsx
  import { generateContactSchema } from '../utils/schemaGenerators';
  ```

- [ ] **7.2** Generar schema:
  ```tsx
  const contactSchema = generateContactSchema();
  ```

- [ ] **7.3** Inyectar en Helmet de Contact.tsx

- [ ] **7.4** Verify que están visibles en HTML estos datos:
  - ✓ Teléfono (clickeable)
  - ✓ Email
  - ✓ Dirección
  - ✓ Horarios
  - ✓ Formulario de contacto

- [ ] **7.5** Validar en consola

**Impacto esperado:**
- ✅ Información de contacto destacada
- ✅ Mejor accesibilidad

---

## 🧪 FASE 8: VALIDACIÓN Y TESTING (40 min)

- [ ] **8.1** En cada página, abrir consola y ejecutar:
  ```
  validateAllSchemas()
  printSEORecommendations()
  ```

- [ ] **8.2** Verificar que NO hay:
  - ❌ Esquemas duplicados sin necesidad
  - ❌ URLs relativas en schemas
  - ❌ Precios vacíos (si aplica)
  - ❌ Imágenes sin URL absoluta

- [ ] **8.3** Probar en cada tipo de página:
  - [ ] Página principal (App.tsx)
  - [ ] Producto individual (`#/product/auto-1`)
  - [ ] Categoría (`#/catalog/automotriz`)
  - [ ] Subcategoría (`#/catalog/automotriz/complementos-auto`)
  - [ ] Contacto (`#/contact`)

- [ ] **8.4** Validar con Google Rich Results Test:
  https://search.google.com/test/rich-results
  - Copiar URL de each página tipo
  - Verificar que aparecen los schemas

- [ ] **8.5** Validar con Schema.org Validator:
  https://validator.schema.org/
  - Copiar HTML de página
  - Buscar errores

- [ ] **8.6** Verificar en Google Search Console:
  - Ir a: Enhancements → Rich Results
  - Esperar 24-48 horas para datos
  - Verificar que aparecen los tipos de rich results

---

## 🚀 FASE 9: MONITOREO Y OPTIMIZACIÓN (Continuo)

- [ ] **9.1** Agregar a Google Search Console:
  - URL del sitio
  - Enviar sitemap.xml mejorado
  - Monitorer "Performance" → CTR

- [ ] **9.2** Monitoreo semanal:
  - Revisar Google Search Console
  - Comparar CTR antes/después
  - Verificar posiciones

- [ ] **9.3** Mejoras futuras (Fase 2):
  - [ ] Agregar VideoSchema (si tienen videos)
  - [ ] Agregar ReviewSchema (si tienen reseñas)
  - [ ] Agregar AggregateOfferSchema (si hay múltiples opciones)
  - [ ] Optimizar aggregate ratings con datos reales

---

## 📊 TABLA DE IMPLEMENTACIÓN

| Componente | Archivo | Schema | Dificultad | Tiempo | Prioridad |
|---|---|---|---|---|---|
| App.tsx | `hooks/useOrganizationSchema.ts` | Organization | ⭐ Fácil | 15 min | 🔴 CRÍTICA |
| ProductDetail.tsx | `utils/schemaGenerators.ts` | Product + Breadcrumb | ⭐⭐ Medio | 30 min | 🔴 CRÍTICA |
| CatalogCategories | `utils/schemaGenerators.ts` | ProductCollection | ⭐ Fácil | 20 min | 🟠 ALTA |
| Página FAQ | `utils/schemaGenerators.ts` | FAQPage | ⭐ Fácil | 20 min | 🟡 MEDIA |
| Contact.tsx | `utils/schemaGenerators.ts` | ContactPoint | ⭐ Fácil | 10 min | 🟡 MEDIA |

---

## ✅ CHECKLIST FINAL

- [ ] Todos los schemas validados sin errores
- [ ] URLs absolutas (https://) en todos los schemas
- [ ] Imágenes con URLs completas
- [ ] No hay duplicación de schemas en la misma página
- [ ] Teléfono y email formatados correctamente
- [ ] Coordenadas GPS precisas
- [ ] Redes sociales vinculadas
- [ ] FAQs con preguntas relevantes
- [ ] BreadcrumbLists coherentes
- [ ] Google Rich Results Test pasando
- [ ] Schema.org Validator sin errores
- [ ] Google Search Console notificado

---

## 🎯 RESULTADOS ESPERADOS

Después de 1-2 semanas:

| Métrica | Esperado |
|---|---|
| CTR | +15-40% |
| Rich Results Activos | 60-80% de queries |
| Indexación | 100% de URLs |
| Posiciones | +2-3 mejora promedio |
| Featured Snippets | +5 palabras clave |

---

## 📞 SOPORTE

Si encuentras errores:

1. **Revisar consola del navegador:**
   ```
   validateAllSchemas()
   ```

2. **Verificar estructura de datos** en `config/seoConfig.ts`

3. **Consultar ejemplos** en `docs/MICROFORMATOS_EJEMPLOS.tsx`

4. **Validar con herramientas oficiales:**
   - Google Rich Results Test
   - Schema.org Validator

5. **Revisar documentación completa:**
   - `docs/MICROFORMATOS_GUIDE.md`

---

**Última actualización:** 7 de abril de 2026
**Versión:** 1.0
**Estado:** ✅ Listo para implementación
