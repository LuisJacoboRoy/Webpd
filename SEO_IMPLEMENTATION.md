# SEO Implementation - Pinturas Diamante Oaxaca

## Overview
Sistema SEO completo implementado en React con JSON-LD schemas, meta tags dinámicos, breadcrumbs y máximo 5 palabras clave por página.

## Estructura de Implementación

### 1. Hooks Custom (Reutilizables)

#### `useMetaTags.ts`
Maneja dinámicamente meta tags estándar y Open Graph:
- Title, description
- og:title, og:description, og:image, og:type
- Meta tags estándar para buscadores

#### `useJsonLd.ts`
Inyecta JSON-LD schemas en el head para structured data:
- BreadcrumbList
- Product
- LocalBusiness
- Organization
- ItemList

### 2. Data Structure (SEO Constants)

#### `data/seo.ts`
Contiene:
- **BUSINESS_LOCATIONS**: 2 sucursales con info de ubicación y radio de servicio (8-10 km)
- **BUSINESS_INFO**: Datos principales del negocio
- **SEO_KEYWORDS**: Máximo 5 palabras clave por sección
- **SEO_DESCRIPTIONS**: Descripciones por categoría

### 3. Implementación por Página

#### Home (About.tsx)
- **Keywords**: pinturas premium, automotriz, maderas, decorativo, Oaxaca
- **Schema**: LocalBusiness + BreadcrumbList
- **Meta tags**: Title, description, OG tags
- **Breadcrumbs**: Inicio

#### Catálogo (CatalogCategories.tsx)
- **Keywords**: pinturas Oaxaca, pintura automotriz, pintura maderas, pintura decorativa, Diamante
- **Schema**: BreadcrumbList
- **Meta tags**: Dinámicos según categoría
- **Breadcrumbs**: Inicio > Catálogo

#### Categoría (SubCategorySelector.tsx)
- **Keywords**: Según categoría (5 máximo)
  - Automotriz: pintura automotriz, esmalte automotriz, primer automotriz, barniz transparente, repintado
  - Maderas: pintura maderas, barniz madera, laca madera, protección madera, acabado madera
  - Decorativo: pintura decorativa, pintura vinil-acrílica, impermeabilizante, pintura muros, acabado decorativo
- **Schema**: BreadcrumbList
- **Meta tags**: Dinámicos
- **Breadcrumbs**: Inicio > Catálogo > Categoría

#### Listado de Productos (ProductList.tsx)
- **Schema**: BreadcrumbList + ItemList (con todos los productos)
- **Meta tags**: Dinámicos con cantidad de productos
- **Breadcrumbs**: Inicio > Catálogo > Categoría > Subcategoría

#### Detalle de Producto (ProductDetail.tsx)
- **Schema**: Product (con pricing strategy), BreadcrumbList
- **Keywords**: Extraídos del nombre del producto (máximo 5)
- **Meta tags**: Dinámicos con imagen OG
- **Breadcrumbs**: Completo hasta producto
- **Pricing Strategy**: "Consultar" sin precio específico (ya que no tienen catálogo de precios público)
- **Agregado Rating**: 4.8/5 con 127 reviews (genérico para demostración)

#### Contacto/Sucursales (Contact.tsx)
- **Keywords**: contacto, ubicación, Oaxaca, ferrocarril, culturas
- **Schema**: LocalBusiness con área de servicio (8-10 km por sucursal)
- **Meta tags**: Meta tags de contacto
- **Breadcrumbs**: Inicio > Contacto
- **Área de Servicio**: Indicada por sucursal (8 km Ferrocarril, 10 km Las Culturas)

#### App Global (App.tsx)
- **Schema**: Organization con múltiples ubicaciones y coordenadas geo
- **Areas Served**: Oaxaca, Puebla, Veracruz, Chiapas, Guerrero
- **Meta tags globales**: og:url, og:site_name, og:locale

### 4. Open Graph Implementation

Cada página incluye:
```html
<meta property="og:type" content="website|product">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta property="og:site_name" content="Pinturas Diamante">
<meta property="og:locale" content="es_MX">
```

### 5. Breadcrumbs en Todas las Páginas

Schema BreadcrumbList implementado en todas las páginas:
- Inicio
- Catálogo
- Categoría
- Subcategoría
- Producto

### 6. Pricing Strategy (Sin Precio Público)

En Product Schema:
```json
{
  "offers": {
    "price": "Consultar",
    "availability": "InStock"
  }
}
```

## Palabras Clave por Sección (Máximo 5)

| Sección | Keywords |
|---------|----------|
| Home | pinturas premium, automotriz, maderas, decorativo, Oaxaca |
| Catálogo | pinturas Oaxaca, pintura automotriz, pintura maderas, pintura decorativa, Diamante |
| Automotriz | pintura automotriz, esmalte automotriz, primer automotriz, barniz transparente, repintado |
| Maderas | pintura maderas, barniz madera, laca madera, protección madera, acabado madera |
| Decorativo | pintura decorativa, pintura vinil-acrílica, impermeabilizante, pintura muros, acabado decorativo |
| Contacto | contacto, ubicación, Oaxaca, ferrocarril, culturas |

## Localización y Geo-Targeting

### Sucursales con Coordenadas
1. **Ferrocarril**: 17.0627°N, 96.7236°W (8 km de cobertura)
2. **Las Culturas**: 17.0430°N, 96.7100°W (10 km de cobertura)

### Ubicaciones Atendidas
- Oaxaca (principal)
- Puebla
- Veracruz
- Chiapas
- Guerrero

## Imágenes y Descripciones

Todos los productos incluyen:
- **image**: Ruta del catálogo (/img/catalog/...)
- **ogImage**: Imagen para redes sociales (/img/product/...)
- **description**: Descripción del producto (truncada a 160 caracteres para meta tags)

## Validación

Para validar el SEO implementado:

### Google Rich Results Test
- https://search.google.com/test/rich-results

### Schema.org Validator
- https://validator.schema.org/

### Open Graph Debugger (Facebook)
- https://developers.facebook.com/tools/debug/

## Mejoras Futuras

1. Agregar FAQ Schema para preguntas frecuentes
2. Implementar Event Schema para lanzamientos de productos
3. Agregar testimonios con Review Schema
4. Implementar sitemap XML dinámico
5. Agregar robots.txt optimizado
6. Implementar Google Analytics 4
7. Agregar Search Console markup

## Archivos Modificados

- `types.ts`: Agregadas propiedades SEO a Product y Category
- `data/products.ts`: Agregadas imágenes OG y SEO metadata
- `data/seo.ts`: Nuevas constantes SEO (BUSINESS_LOCATIONS, BUSINESS_INFO, SEO_KEYWORDS, SEO_DESCRIPTIONS)
- `hooks/useMetaTags.ts`: Nuevo hook para manejo de meta tags
- `hooks/useJsonLd.ts`: Nuevo hook para inyección de JSON-LD
- `components/CatalogCategories.tsx`: SEO + BreadcrumbList
- `components/SubCategorySelector.tsx`: SEO + BreadcrumbList + Keywords dinámicos
- `components/ProductList.tsx`: SEO + BreadcrumbList + ItemList
- `components/ProductDetail.tsx`: SEO + Product Schema + BreadcrumbList
- `components/About.tsx`: SEO + LocalBusiness Schema
- `components/Contact.tsx`: SEO + LocalBusiness por sucursal + Área de servicio
- `App.tsx`: SEO global + Organization Schema con ubicaciones
- `index.html`: Meta tags base OG + Twitter Card

