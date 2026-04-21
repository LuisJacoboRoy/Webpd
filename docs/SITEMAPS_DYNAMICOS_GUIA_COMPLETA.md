# 🗺️ Sistema de Sitemaps Dinámicos - Guía Completa

## 📋 Descripción General

Tu proyecto ahora tiene un sistema **completamente automatizado** de generación de sitemaps dinámicos que:

1. ✅ Se genera automáticamente en cada **build** (`npm run build`)
2. ✅ Se ejecuta en **GitHub Actions** con cada push a main/develop
3. ✅ Incluye **múltiples sitemaps** organizados por tipo de esquema
4. ✅ Proporciona **metadatos JSON** con guía de medición

---

## 📁 Archivos Generados

### Ubicación: `public/`

```
sitemap.xml                 # Índice principal (73 URLs)
sitemap-products.xml        # Productos (46 URLs)
sitemap-categories.xml      # Categorías/subcategorías (22 URLs)
sitemap-metadata.json       # Estadísticas y guía de medición
robots.txt                  # Actualizado automáticamente
```

---

## 🔧 Cómo Funciona la Automatización

### 1. **En Local (tu computadora)**

#### Ejecutar manualmente:
```bash
npm run sitemap:generate
```

#### Ejecutar con build:
```bash
npm run build
# Esto automáticamente:
# 1. Ejecuta npm run sitemap:generate
# 2. Compila React con Vite
# 3. Genera los sitemaps en public/
```

### 2. **En GitHub (CI/CD)**

El archivo `.github/workflows/update-sitemaps.yml` ejecuta:

```
on: push a main/develop
  ↓
Detecta cambios en:
  - data/products.ts (cambios de productos)
  - data/seo.ts (cambios de info de negocio)
  - scripts/generate-sitemap.ts (cambios del script)
  - src/components/**/*.tsx (cambios de componentes)
  ↓
Ejecuta:
  1. npm install
  2. npm run sitemap:generate
  3. Commit automático si hay cambios
  4. Push al repositorio
  5. Comentario automático en PR
```

---

## 📊 Estadísticas Actuales

Generadas: **21 de abril 2026, 14:58:39**

```
Total URLs: 73

Desglose por Tipo de Esquema:
┌─────────────────┬──────────┐
│ Tipo            │ Cantidad │
├─────────────────┼──────────┤
│ Product         │ 46       │ → Resultados de Productos
│ Category        │ 21       │ → Migas de pan + Categorías
│ LocalBusiness   │ 3        │ → Ubicaciones/Sucursales
│ Organization    │ 2        │ → Información de empresa
│ CollectionPage  │ 1        │ → Página de catálogo
└─────────────────┴──────────┘

Desglose por Componente:
┌──────────────────────┬──────────┐
│ Componente           │ Cantidad │
├──────────────────────┼──────────┤
│ Productos            │ 46       │
│ Categorías           │ 3        │
│ Subcategorías        │ 18       │
│ Sucursales/Ubicaciones│ 2        │
│ Páginas estáticas    │ 4        │
└──────────────────────┴──────────┘
```

---

## 🚀 Cómo Medir el Alcance en Google Search Console

### Paso 1: Agregar Sitemaps

1. Ve a https://search.google.com/search-console
2. Selecciona: **pinturasdiamante.com**
3. Menú izquierdo → **Sitemaps**
4. Agrega estos 3 sitemaps:
   ```
   https://pinturasdiamante.com/sitemap.xml
   https://pinturasdiamante.com/sitemap-products.xml
   https://pinturasdiamante.com/sitemap-categories.xml
   ```
5. Haz clic en "Enviar" para cada uno

**Google comenzará a indexar automáticamente en 24-48 horas.**

### Paso 2: Monitorear Indexación por Esquema

**Ubicación**: Menú → **Apariencia en búsqueda** → **Resultados enriquecidos**

Aquí verás para cada tipo de esquema:
- ✅ **Válidos**: Correctamente formateados y indexados
- ⚠️ **Advertencias**: Problemas menores
- ❌ **Errores**: Problemas graves que Google no puede procesar
- ⊘ **Excluidos**: URLs no indexadas

**Esperados:**
```
Product (46)       → Muestra cada producto indexado
BreadcrumbList     → Navegación de categorías
LocalBusiness (3)  → Ubicaciones de sucursales
Organization (2)   → Datos de empresa
```

### Paso 3: Ver Tráfico por Página

**Ubicación**: Menú → **Rendimiento**

Aquí puedes:
- Ver **clics** e **impresiones** por página
- Filtrar por tipo de página (producto/categoría)
- Ver posición promedio en búsqueda
- Analizar CTR (Click-Through Rate)

**Para filtrar por tipo:**
- Ve a "Filtros avanzados"
- Filtra por "Página" que contenga:
  - `/product/` → Ver todos los productos
  - `/catalog/` → Ver todas las categorías
  - `/catalog/automotriz/` → Ver una categoría específica

---

## 🔄 Actualizar Sitemaps Automáticamente

### Cuándo se actualizan:

1. **Cada vez que haces build local**:
   ```bash
   npm run build
   ```

2. **Automáticamente en GitHub** cuando haces push y cambias:
   - Productos (`data/products.ts`)
   - Información de negocio (`data/seo.ts`)
   - Componentes de esquema (`src/components/**/*.tsx`)

3. **Manualmente**:
   ```bash
   npm run sitemap:generate
   ```

### Qué hace el script:

```
1. Lee data/products.ts → Obtiene 46 productos
2. Lee data/seo.ts → Obtiene 3 categorías, 2 sucursales
3. Lee data/seo.ts → Obtiene 18 subcategorías
4. Genera sitemap.xml (todas las URLs)
5. Genera sitemap-products.xml (solo productos)
6. Genera sitemap-categories.xml (solo categorías)
7. Genera sitemap-metadata.json (esta guía + estadísticas)
8. Actualiza robots.txt
```

**Tiempo de ejecución**: ~2-3 segundos

---

## 🔍 Estructura de URLs en los Sitemaps

### Productos
```xml
<url>
  <loc>https://pinturasdiamante.com/#/product/auto-1</loc>
  <schema>Product</schema>
  <lastmod>2026-03-15</lastmod>
</url>
```

### Categorías
```xml
<url>
  <loc>https://pinturasdiamante.com/#/catalog/automotriz</loc>
  <schema>Category</schema>
  <lastmod>2026-04-21</lastmod>
</url>
```

### Subcategorías
```xml
<url>
  <loc>https://pinturasdiamante.com/#/catalog/automotriz/complementos-auto</loc>
  <schema>Category</schema>
  <lastmod>2026-04-21</lastmod>
</url>
```

### Sucursales
```xml
<url>
  <loc>https://pinturasdiamante.com/#/location/ferrocarril</loc>
  <schema>LocalBusiness</schema>
  <lastmod>2026-04-21</lastmod>
</url>
```

---

## 📈 Análisis de Rendimiento por Esquema

### Product Schema
- **Objetivo**: Hacer visible cada producto en búsqueda
- **Métricas clave**:
  - % de productos válidos (meta: 100%)
  - Avg clics por producto
  - Avg posición en búsqueda
- **Dónde ver**: Resultados enriquecidos → Product

### Category Schema (BreadcrumbList)
- **Objetivo**: Mejorar navegación en resultados
- **Métricas clave**:
  - Clics en migas de pan
  - Visibilidad de categorías
- **Dónde ver**: Resultados enriquecidos → BreadcrumbList

### LocalBusiness Schema
- **Objetivo**: Aparecer en búsquedas locales
- **Métricas clave**:
  - Clics en ubicaciones
  - Direcciones mostradas en búsqueda
- **Dónde ver**: Resultados enriquecidos → LocalBusiness

### Organization Schema
- **Objetivo**: Datos de confianza de empresa
- **Métricas clave**:
  - Logo mostrado en búsqueda
  - Información de contacto visible
- **Dónde ver**: Resultados enriquecidos → Organization

---

## 🛠️ Archivos Técnicos

### 1. Script Generador
**Ubicación**: `scripts/generate-sitemap.ts`

- Función: `generateSitemaps()`
- Entrada: `data/products.ts`, `data/seo.ts`
- Salida: 4 archivos XML + 1 JSON
- Ejecución: Automática en build + manual con `npm run sitemap:generate`

### 2. Plugin de Vite
**Ubicación**: `vite.config.ts`

```typescript
const sitemapPlugin = {
  name: 'sitemap-generator',
  async buildStart() {
    execSync('npm run sitemap:generate');
  }
};
```

**Qué hace**: Ejecuta el script antes de compilar con Vite

### 3. GitHub Action
**Ubicación**: `.github/workflows/update-sitemaps.yml`

- **Evento**: Push a main/develop
- **Detecta cambios** en products, components, seo
- **Ejecuta**: npm run sitemap:generate
- **Commit automático** si hay cambios
- **Comentario** en PR con resumen

---

## ⚡ Mejoras Futuras (Opcionales)

Si quieres mejorar más tarde:

1. **Sitemaps dinámicos en tiempo real** (Vercel serverless)
2. **Reporte automático en Slack/Email** con nuevos indexados
3. **Validación de esquemas JSON-LD** antes de desplegar
4. **Dashboard** para ver métricas de Search Console
5. **Generación de sitemaps por language** (es, en, etc.)

---

## 📞 Troubleshooting

### "Los sitemaps no se generan"
```bash
# Verifica que el script existe
ls scripts/generate-sitemap.ts

# Prueba manual
npm run sitemap:generate
```

### "Google Search Console no indexa"
- Espera 24-48 horas después de agregar
- Verifica que las URLs son accesibles
- Ve a "Cobertura" para ver si hay errores

### "Cambios en productos no aparecen en sitemap"
```bash
# Regenera forzadamente
npm run sitemap:generate

# O con build completo
npm run build
```

### "El GitHub Action falla"
- Revisa logs en: Actions → update-sitemaps → Ver logs
- Verifica permisos: Settings → Actions → General → Permissions

---

## 📚 Referencias

- [Google Search Console Help](https://support.google.com/webmasters)
- [Schema.org Dokumentation](https://schema.org)
- [Google Structured Data Testing Tool](https://developers.google.com/search/docs/advanced/structured-data)
- [Sitemap Specification](https://www.sitemaps.org/protocol.html)

---

**Última actualización**: 21 de abril de 2026  
**Version**: 1.0  
**Status**: ✅ Producción
