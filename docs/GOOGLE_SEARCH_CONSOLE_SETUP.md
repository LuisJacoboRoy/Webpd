# 🚀 Guía Completa: Indexación en Google Search Console

## Resumen
Has optimizado tu sitio para indexación con:
- **3 Sitemaps dinámicos** por tipo de esquema
- **Robots.txt mejorado** con referencias de esquemas
- **JSON-LD estructurado** en cada página
- **Esquemas por página**: Product, Category, Organization, LocalBusiness

---

## 📋 Paso 1: Verificar el Dominio en Google Search Console

### 1.1 Acceder a Search Console
1. Ve a: https://search.google.com/search-console
2. Si aún no tienes propiedad, click en **"Agregar propiedad"**
3. Selecciona tipo: **Dominio** (no URL)
4. Ingresa: `pinturasdiamante.com`

### 1.2 Verificar Propiedad del Dominio
Google ofrece múltiples métodos:
- **Recomendado**: DNS TXT record
- **Alternativo**: Archivo HTML (si tienes acceso FTP)
- **Alternativo**: Meta tag en HTML

**Pasos para DNS TXT:**
1. Ve a tu proveedor de DNS (GoDaddy, Namecheap, etc.)
2. Agrega el TXT record que Google te proporciona
3. Espera 5-15 minutos para propagación
4. Click en "Verificar" en Search Console

---

## 🗺️ Paso 2: Agregar los Sitemaps

### 2.1 URLs de Sitemaps a Agregar
En Search Console, ve a **Sitemaps** (menú izquierdo):

```
https://pinturasdiamante.com/sitemap.xml
https://pinturasdiamante.com/sitemap-products.xml
https://pinturasdiamante.com/sitemap-categories.xml
```

### 2.2 Proceso Detallado
1. **Copia y pega la primera URL**: `https://pinturasdiamante.com/sitemap.xml`
2. Click en **"Enviar"**
3. Espera a que se procese (puede tardar horas)
4. Repite para los otros 2 sitemaps

### 2.3 Verificar Procesamiento
- **Estado esperado**: "Procesado exitosamente"
- **Tiempo**: Puede tardar 1-3 días hasta ver resultados
- **Ubicación**: Menú Sitemaps → ve el estado

---

## 🏷️ Paso 3: Validar Esquemas Estructurados

### 3.1 Acceder a Enhanced Results
En Search Console, ve a **Mejoras** (menú izquierdo) → **Datos estructurados**

Deberías ver reportes para:
- ✅ **Product** (esquema de productos)
- ✅ **Organization** (tu empresa)
- ✅ **LocalBusiness** (ubicación local)
- ✅ **Category** (categorías)

### 3.2 Validar Manualmente
Para cada tipo de esquema, haz:

1. **Valida Product schema:**
   - Ve a: https://search.google.com/test/rich-results
   - Pega: `https://pinturasdiamante.com/#/product/auto-1`
   - Debería mostrar: ✅ "Product schema válido"

2. **Valida Category schema:**
   - Pega: `https://pinturasdiamante.com/#/catalog/automotriz`
   - Debería mostrar: ✅ "Category schema válido"

3. **Valida LocalBusiness schema:**
   - Pega: `https://pinturasdiamante.com/#/contact`
   - Debería mostrar: ✅ "LocalBusiness schema válido"

---

## 📊 Paso 4: Medir Alcance por Esquema

### 4.1 Dashboard de Esquemas
En Search Console → **Mejoras** → **Datos estructurados**:

Verás una tabla como:
| Esquema | Válidos | Válidos con advertencias | Errores |
|---------|---------|-------------------------|---------|
| Product | 60 | 0 | 0 |
| Category | 18 | 0 | 0 |
| Organization | 1 | 0 | 0 |
| LocalBusiness | 1 | 0 | 0 |

### 4.2 Interpretar Resultados
- **Válidos**: Google entiende y puede usar para rich results
- **Con advertencias**: Funciona pero falta información
- **Errores**: No se procesa, revisa ProductDetail.tsx

### 4.3 Rich Results Reports
Ve a **Mejoras** → **Rich Results**:
- Haz click en cada tipo (Product, etc.)
- Verás: **Impresiones en búsqueda** (clicks × product)
- Filtra por: **Fecha, página, query, país**

---

## 🔍 Paso 5: Rastrear Cobertura por Tipo de URL

### 5.1 Coverage Report
En Search Console → **Cobertura**:

| Estado | Descripción | Acción |
|--------|-------------|--------|
| ✅ Válida | Google indexó sin problemas | ✓ Normal |
| ⚠️ Válida con advertencias | Indexada pero tiene problemas | Revisar |
| ❌ Error | No se pudo indexar | Investigar |
| ⏳ Pendiente de indexación | Detectada pero no procesada | Esperar |

### 5.2 Filtrar por Tipo de Contenido
Usa estos filtros para ver por categoría:
```
Tipo: Producto → /product/
Tipo: Categoría → /catalog/
Tipo: Página → /contact, /about
```

---

## 📈 Paso 6: Medir Vistas Totales por Tipo de Esquema

### 6.1 Performance Report
En Search Console → **Rendimiento**:

1. **Click en Filtro "Búsqueda" → Producto**
   - Verás impresiones/clicks solo de resultados Product
   - Ejemplo: "Acondicionador de metales" = 150 impresiones

2. **Filtra por País, Fecha, Dispositivo:**
   ```
   País: México
   Fecha: Últimos 28 días
   Dispositivo: Móvil
   ```

3. **Exporta datos:**
   - Click en ⋮ (menu) → "Descargar"
   - Guarda como CSV
   - Usa Excel/Sheets para análisis

### 6.2 Dashboard Recomendado
Crea un Google Sheet con:

| Esquema | URLs Indexadas | Impresiones (28d) | Clicks (28d) | CTR |
|---------|----------------|-------------------|--------------|-----|
| Product | 60 | 2,150 | 180 | 8.4% |
| Category | 18 | 450 | 75 | 16.7% |
| Contact | 1 | 25 | 5 | 20% |

---

## 🎯 Paso 7: Interpretación de Métricas

### 7.1 Productos (Product Schema)
- **Impresiones altas (>100)**: Tu categoría sale en búsquedas
- **CTR bajo (<5%)**: Revisa título/descripción en schema
- **Errores de schema**: Completa fields requeridos

### 7.2 Categorías (Category Schema)
- **Impresiones altas**: Category sale en búsquedas amplias
- **Clicks altos**: Los usuarios seleccionan tu categoría
- **Action**: Optimiza títulos si CTR < 10%

### 7.3 Contact (LocalBusiness)
- **Impresiones**: Búsquedas locales ("pinturas Oaxaca")
- **Clicks**: Click para obtener dirección/teléfono
- **Meta**: Target local keywords

---

## 🛠️ Paso 8: Troubleshooting

### 8.1 "URLs no indexadas"
**Causa**: Robots.txt bloquea o schema tiene errores

**Solución**:
```bash
# Verificar robots.txt
curl -s https://pinturasdiamante.com/robots.txt

# Verificar cada sitemap
curl -s https://pinturasdiamante.com/sitemap.xml

# En Search Console: ve a Cobertura, filtra "Errores"
# Haz click en una URL para ver detalles
```

### 8.2 "Errores de Schema"
**Causa**: Campo requerido falta (ej: price, availability, rating)

**Solución**:
1. Ve a ProductDetail.tsx
2. Verifica generateEnhancedProductSchema()
3. Agrega campos faltantes:
   ```typescript
   price: { "@type": "PriceSpecification", "price": "19.99" }
   availability: "https://schema.org/InStock"
   ```

### 8.3 "Sin impresiones después de 2 semanas"
**Causa**: Google aún no procesó todas las URLs

**Solución**:
1. Manualmente solicita indexación:
   - En Search Console → Inspeccionador de URL
   - Ingresa: `https://pinturasdiamante.com/#/product/auto-1`
   - Click: "Solicitar indexación"

2. Repite para 5-10 URLs de diferentes tipos

---

## 📝 Paso 9: Monitoreo Continuo

### 9.1 Checklist Semanal
- [ ] Revisar Cobertura (¿nuevos errores?)
- [ ] Revisar Rich Results (¿productos válidos?)
- [ ] Ver Rendimiento (¿clicks subiendo?)
- [ ] Validar 2-3 URLs nuevas

### 9.2 Checklist Mensual
- [ ] Descargar datos de Rendimiento
- [ ] Actualizar Google Sheet de métricas
- [ ] Revisar Keywords con pocos clicks
- [ ] Optimizar títulos/descripciones de bajo CTR

### 9.3 Herramientas Recomendadas
- **Google Search Console** (oficial)
- **Screaming Frog** (verificar sitemap)
- **Schema.org Validator** (validar esquemas)
- **Google Lighthouse** (SEO audit)

---

## 📊 Plantilla: Google Sheet de Monitoreo

Copia este template y actualiza mensualmente:

```
Fecha | Esquema | Indexadas | Impres | Clicks | CTR% | Notas
------|---------|-----------|--------|--------|------|-------
4/20  | Product | 60        | 2150   | 180    | 8.4  | Bueno
4/20  | Category| 18        | 450    | 75     | 16.7 | OK
4/20  | Contact | 1         | 25     | 5      | 20   | Poco tráfico
```

---

## 🚀 Siguientes Pasos

1. **Esta semana**:
   - Agregar sitemaps a Search Console
   - Verificar esquemas manualmente

2. **Próximas 2 semanas**:
   - Esperar indexación
   - Revisar reportes de errores

3. **Después de 1 mes**:
   - Analizar métricas
   - Optimizar bajo CTR

---

## 📞 URLs de Referencia

| Herramienta | URL |
|-----------|-----|
| Google Search Console | https://search.google.com/search-console |
| Rich Results Test | https://search.google.com/test/rich-results |
| Validate Schema | https://validator.schema.org |
| Google Lighthouse | https://developers.google.com/web/tools/lighthouse |

---

**Última actualización**: 2026-04-20
**Autor**: GitHub Copilot
**Status**: ✅ Listo para implementar
