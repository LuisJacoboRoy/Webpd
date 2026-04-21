# 📋 Estructura de Sitemaps: Guía de Indexación por Esquemas

## Resumen Ejecutivo

Tu sitio ahora genera **3 sitemaps dinámicos** que puedes agregar a Google Search Console para rastrear el alcance de **todos los esquemas** (productos, categorías, contacto, etc.):

```
/sitemap.xml                  ← Todas las URLs (index principal)
/sitemap-products.xml         ← Solo Productos (Product schema)
/sitemap-categories.xml       ← Categorías (Category schema)
```

---

## 📊 Desglose de Contenido por Sitemap

### 1. `sitemap.xml` - ÍNDICE PRINCIPAL (Todas las URLs)

**Contiene:**
- ✅ 1 URL: Página inicio (Organization schema)
- ✅ 1 URL: Catálogo (CollectionPage)
- ✅ 1 URL: Contacto (LocalBusiness schema)
- ✅ 18 URLs: Categorías (Category schema)
- ✅ 60+ URLs: Productos (Product schema)
- **TOTAL: ~82 URLs**

**Ejemplo:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pinturasdiamante.com/</loc>
    <lastmod>2026-04-20</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pinturasdiamante.com/#/product/auto-1</loc>
    <lastmod>2026-03-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>
  <!-- ... más URLs ... -->
</urlset>
```

**Cuándo usar en Search Console:**
- ✅ **Opción 1**: Agrega solo este (Google descubre el resto)
- ✅ **Opción 2**: Agrega los 3 para control granular

---

### 2. `sitemap-products.xml` - SCHEMA PRODUCT

**Contiene:**
- 📦 Solo URLs con schema `Product`
- 📦 ~60 productos (auto-, mad-, dec-)
- 📦 Prioridad: 0.70 (productos modificados mensualmente)

**Ejemplo de URL en este sitemap:**
```
https://pinturasdiamante.com/#/product/auto-1
https://pinturasdiamante.com/#/product/auto-2
...
https://pinturasdiamante.com/#/product/dec-20
```

**Por qué es importante:**
- Google rastrea **específicamente** qué productos están indexados
- En Search Console → **Rich Results** → **Product**, ves métricas SOLO de estos
- Permite rastrear: impresiones, clicks, CTR **por producto**
- Detecta errores de schema específicos en productos

**Columnas que verás en Search Console:**
```
Producto            | Válidos | Con Advertencias | Errores
Acondicionador... | 1       | 0                | 0
Blender Clear...  | 1       | 0                | 0
...
Total             | 60      | 0                | 0
```

---

### 3. `sitemap-categories.xml` - SCHEMA CATEGORY

**Contiene:**
- 🏷️ Solo URLs con schema `Category`
- 🏷️ 18 subcategorías (complementos-auto, poliuretano-auto, etc.)
- 🏷️ 3 categorías principales (automotriz, maderas, decorativo)
- 🏷️ Prioridad: 0.80 (categorías son navegación, se actualizan semanalmente)

**Ejemplo:**
```
https://pinturasdiamante.com/#/catalog/automotriz
https://pinturasdiamante.com/#/catalog/automotriz/complementos-auto
https://pinturasdiamante.com/#/catalog/maderas
...
```

**Beneficio:**
- Rastrea URLs de navegación por separado
- En Rich Results → **Category**, ves indexación de categorías
- Útil para navegación facetada (usuarios filtran por categoría)

---

### 4. `sitemap-metadata.json` - RESUMEN PARA ANÁLISIS

**Archivo adicional** (no es XML, es JSON) que contiene metadatos:

```json
{
  "generatedAt": "2026-04-20T15:30:00Z",
  "baseUrl": "https://pinturasdiamante.com",
  "sitemaps": {
    "general": "sitemap.xml",
    "products": "sitemap-products.xml",
    "categories": "sitemap-categories.xml"
  },
  "statistics": {
    "totalURLs": 82,
    "bySchema": {
      "Organization": 1,
      "LocalBusiness": 1,
      "Category": 21,
      "Product": 60,
      "CollectionPage": 1
    }
  }
}
```

**Úsalo para:**
- Verificar cuántas URLs se generaron
- Ver desglose por tipo de esquema
- Compartir con equipo/reportes

---

## 🔄 Cómo se Generan (Automático)

### Proceso de Build

```bash
npm run build
  ↓
Ejecuta: npm run sitemap:generate
  ↓
Lee: /data/products.ts
  ↓
Genera:
  - sitemap.xml (todas)
  - sitemap-products.xml (60 productos)
  - sitemap-categories.xml (18 categorías)
  - sitemap-metadata.json (stats)
  ↓
Guarda en: /public/
```

### Manual (Para Testing)

```bash
npm run sitemap:generate
```

---

## 🚀 Cómo Agregar a Google Search Console

### Opción A: Una sola vez (Recomendado para empezar)
1. Ve a: https://search.google.com/search-console
2. Selecciona propiedad: `pinturasdiamante.com`
3. Menú izquierdo → **Sitemaps**
4. Pega: `https://pinturasdiamante.com/sitemap.xml`
5. Click: "Enviar"
6. ✅ Google descubre automáticamente los otros 2

**Tiempo**: Puede tardar 1-3 días

---

### Opción B: Control Granular (Avanzado)
Si quieres rastrear métricas separadamente:

1. Agrega estos 3:
   ```
   https://pinturasdiamante.com/sitemap.xml
   https://pinturasdiamante.com/sitemap-products.xml
   https://pinturasdiamante.com/sitemap-categories.xml
   ```

2. Luego ve a:
   - **Mejoras** → **Datos estructurados** → Ver "Product" y "Category" separadamente
   - **Rendimiento** → Filtra por "Product" o "Category"

---

## 📈 Métricas que Podrás Rastrear

### Por Tipo de Esquema

| Métrica | En Search Console | Dónde | Beneficio |
|---------|------------------|-------|-----------|
| URLs Indexadas | ✅ Sí | Cobertura | Ver si Google indexó todos tus productos |
| Impresiones | ✅ Sí | Rich Results | Cuántas veces aparecen en búsquedas |
| Clicks | ✅ Sí | Rendimiento | Cuántos usuarios hacen click |
| CTR | ✅ Sí (calculado) | Rendimiento | Click-through rate = clicks/impresiones |
| Posición promedio | ✅ Sí | Rendimiento | En qué posición sale (1-100) |

### Dashboard de Ejemplo

**Productos (auto-1, auto-2, etc.):**
```
Esquema: Product
Indexadas: 60
Impresiones: 2,150 (últimos 28 días)
Clicks: 180
CTR: 8.4%
Posición promedio: 3.2
```

**Categorías (complementos-auto, etc.):**
```
Esquema: Category
Indexadas: 21
Impresiones: 450
Clicks: 75
CTR: 16.7%
Posición promedio: 4.1
```

**Contacto:**
```
Esquema: LocalBusiness
Indexadas: 1
Impresiones: 25
Clicks: 5
CTR: 20%
Posición promedio: 1.5
```

---

## 🔍 Validación Manualmente

### Por Tipo de Esquema

**1. Validar Product Schema:**
```bash
# En: https://search.google.com/test/rich-results
# Pega: https://pinturasdiamante.com/#/product/auto-1
# Esperado: ✅ "Valid Product schema"
```

**2. Validar Category Schema:**
```bash
# Pega: https://pinturasdiamante.com/#/catalog/automotriz
# Esperado: ✅ "Valid Category schema"
```

**3. Validar LocalBusiness Schema:**
```bash
# Pega: https://pinturasdiamante.com/#/contact
# Esperado: ✅ "Valid LocalBusiness schema"
```

---

## 🛠️ Troubleshooting

### "El sitemap tararda en procesar"
**Normal.** Google procesa sitemaps en background:
- ✅ Primer procesamiento: 1-3 días
- ✅ Actualizaciones futuras: 24-48 horas
- ✅ Cambios de prioridad: 7 días

### "No veo datos en Rich Results"
**Causas comunes:**
1. Google aún no procesó (espera 3+ días)
2. Schema tiene errores (valida en test tool)
3. Las URLs no están indexadas (ve a Cobertura)

**Solución:**
1. En Search Console → Inspeccionador de URL
2. Ingresa: `https://pinturasdiamante.com/#/product/auto-1`
3. Click: "Solicitar indexación"
4. Repite para 5-10 URLs

### "Sitemaps no se actualizan"
**Causa:** Necesitas ejecutar `npm run build`

**Solución:**
```bash
# Local
npm run sitemap:generate

# Después de deploy
# El build automático generará nuevos sitemaps
```

---

## 📋 Checklist de Implementación

- [ ] Ejecutar: `npm run sitemap:generate`
- [ ] Verificar que existan 3 archivos:
  - [ ] `/public/sitemap.xml` (~5 KB)
  - [ ] `/public/sitemap-products.xml` (~20 KB)
  - [ ] `/public/sitemap-categories.xml` (~10 KB)
  - [ ] `/public/sitemap-metadata.json` (~2 KB)
- [ ] Actualizar `/public/robots.txt` con referencias (✅ hecho)
- [ ] En Search Console:
  - [ ] Agregar `sitemap.xml`
  - [ ] Esperar 1-3 días procesamiento
  - [ ] Verificar en Cobertura que todas las URLs aparezcan
- [ ] Validar schemas manualmente en Google Rich Results Test
- [ ] Crear Google Sheet de monitoreo mensual
- [ ] Agregar a alertas: si cobertura baja < 60 productos

---

## 📞 Referencias

- [Google Sitemap Protocol](https://www.sitemaps.org/)
- [Schema.org Product](https://schema.org/Product)
- [Schema.org Category](https://schema.org/Category)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Search Console Help](https://support.google.com/webmasters)

---

**Última actualización:** 2026-04-20  
**Script de generación:** `/scripts/generate-sitemap.ts`  
**Status:** ✅ Listo para producción
