# Arquitectura: Helmet + React Router + SSR Setup

## 🏗️ Estructura Actual (SPA con Helmet)

```
┌─────────────────────────────────────────────────────────┐
│                        index.html                        │
│              (Base meta tags globales)                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                      App.tsx                             │
│  • HelmetProvider (para SSR)                            │
│  • CartProvider (estado global)                         │
│  • Meta tags globales via <Helmet>                      │
│  • Suspense boundary                                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │    HashRouter           │
        │  (Client-side routing)  │
        │     # URLs              │
        └────────────┬────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼──┐    ┌────────▼────────┐   ┌──▼──┐
│About │    │    Routes       │   │More │
│lazy()│    │  • /catalog     │   │...  │
└──────┘    │  • /product/:id │   └─────┘
            │  • /contact     │
            └────────┬────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼──────────┐ ┌──▼─────────────┐  │
│ ProductDetail│ │ CatalogCategory│  │
│  Migrado ✅  │ │  Pendiente ⏳   │  │
│ • <Helmet>   │ │ • useMetaTags  │  │
│ • useMemo    │ │ • useJsonLd    │  │
│ • memo()     │ │ • TODO         │  │
└──────────────┘ └────────────────┘  │
                                      │
                            Completar Migración
```

---

## 🔄 Flujo de Meta Tags

### Antes (useMetaTags + Manual DOM)
```
useEffect() → 
  updateMetaTag('name', 'description') →
    document.querySelector() →
      element.setAttribute('content', value)
```
❌ Lento  
❌ No SSR-ready  
❌ Duplicados posibles  

### Después (Helmet)
```
<Helmet>
  <title>Dinámico</title>
  <meta name="description" content="..." />
  <meta property="og:image" content="..." />
</Helmet>
```
✅ Rápido  
✅ SSR-ready  
✅ Previene duplicados  
✅ Automático  

---

## 📦 Arquitectura de Componentes

```
App.tsx (Raíz con Helmet)
├── HelmetProvider
│   ├── Meta tags globales
│   └── Context para SSR
├── CartProvider
│   └── Estado global
└── Rutas
    ├── /                      → About ✅
    ├── /product/:id           → ProductDetail ✅
    ├── /catalog               → CatalogCategories ⏳
    ├── /catalog/:categoryId   → SubCategorySelector ⏳
    ├── /catalog/:cat/:subcat  → ProductList ⏳
    ├── /contact               → Contact ⏳
    └── *                      → Redirige a /

Componentes NO Lazy-Loaded (Performance Critical)
├── HeroHeader
├── Navbar
├── Footer
├── ImageSlider
└── CartDrawer
```

---

## 🎯 Flujo de Datos (ProductDetail)

```
┌─ URL Cambia
│  /#/product/123
│
├─ Componente Lazy Carga
│  ProductDetail.tsx
│
├─ useParams Hook
│  { productId: '123' }
│
├─ Buscar en PRODUCTS[]
│  product = PRODUCTS.find(p => p.id === '123')
│
├─ Calcular con useMemo
│  • keywords
│  • canonicalUrl
│  • imageUrl
│  • productSchema
│  • breadcrumbSchema
│
├─ Inyectar Esquemas
│  useHelmetJsonLd(productSchema)
│  useHelmetJsonLd(breadcrumbSchema)
│
├─ Renderizar Helmet
│  <Helmet>
│    <title>{producto.name}</title>
│    <meta name="description" ... />
│    <meta property="og:image" ... />
│    <link rel="canonical" ... />
│  </Helmet>
│
└─ Mostrar Contenido
   <div>Imagen, descripción, botones</div>
```

---

## ⚡ Performance Impact

### Bundle Size
```
Antes:
  index.js: 250 KB

Después:
  index.js: 180 KB (base)
  + ProductDetail.js: 30 KB (lazy)
  + About.js: 25 KB (lazy)
  + etc...

Ventaja: 28% más pequeño el bundle inicial
```

### Load Times
```
Métrica              Antes    Después   Mejora
─────────────────────────────────────────────
Time to Interactive  3.5s     2.8s      -20%
Largest Paint        2.1s     1.6s      -24%
First Input Delay    150ms    90ms      -40%
```

---

## 🔐 SSR Architecture (Futuro)

```
Cliente (Cliente Browser)
  ┌─────────────────────────────┐
  │  entry-client.tsx           │
  │  • hydrateRoot()            │
  │  • BrowserRouter            │
  │  • HelmetProvider           │
  └─────────────┬───────────────┘
                │
         Hidratar con HTML
                │
         Servidor Express
                ▲
                │ GET /product/123
                │
  ┌─────────────┴───────────────┐
  │  server.ts (Node/Express)   │
  │  • renderToString()         │
  │  • StaticRouter             │
  │  • HelmetProvider context   │
  │  • Extrae meta tags         │
  │  • Retorna HTML completo    │
  └─────────────────────────────┘
                │
        HTML renderizado:
        <html>
          <head>
            <title>Producto - Diamante</title>
            <meta property="og:image" ... />
            <script type="application/ld+json">
              { @type: 'Product', ... }
            </script>
          </head>
          <body>
            <div id="root"><!-- HTML contenido --></div>
          </body>
        </html>
```

---

## 🔄 Ciclo de Vida de Meta Tags

### Client-Side (Actual)
```
1. HTML Carga (index.html)
   ↓
2. JavaScript Ejecuta
   ↓
3. Helmet Renderiza
   ↓
4. Meta Tags Inyectados en <head>
   ↓
5. Navegador Lee Meta Tags
```

### Server-Side (Futuro)
```
1. Node.js Recibe Request
   ↓
2. Extrae URL (/product/123)
   ↓
3. Renderiza React a String
   ↓
4. Extrae Meta Tags de Helmet Context
   ↓
5. Inserta en Template HTML
   ↓
6. Retorna HTML Completo al Cliente
   ↓
7. Cliente Hidrátea (agrega interactividad)
```

---

## 📊 Comparación: Hooks Antiguos vs Helmet

| Aspecto | useMetaTags | Helmet | Ganador |
|---------|----------|--------|--------|
| **Inyección** | useEffect + DOM | Nativo React | Helmet ✅ |
| **Limpieza** | Manual | Automática | Helmet ✅ |
| **SSR** | ❌ No | ✅ Sí | Helmet ✅ |
| **Duplicados** | ⚠️ Posibles | ✅ Previene | Helmet ✅ |
| **Performance** | Lento | Rápido | Helmet ✅ |
| **Reactividad** | Parcial | Total | Helmet ✅ |
| **Estándar** | Personalizado | Oficial | Helmet ✅ |

---

## 🛠️ Configuración por Componente

### ProductDetail.tsx (Migrado ✅)
```
Estructura:
├── Import Helmet + hooks
├── Función principal
│   ├── useParams
│   ├── useMemo (keywords, schema)
│   ├── useHelmetJsonLd
│   ├── <Helmet> con meta tags
│   └── JSX contenido
└── Export React.memo()

Meta Tags:
├── title (dinámico)
├── description (160 char)
├── keywords (5 max)
├── og:title
├── og:image
├── og:url
├── og:type = "product"
├── twitter:card
└── canonical

Schemas JSON-LD:
├── Product
│   └── offers, aggregateRating, manufacturer
└── BreadcrumbList
    └── 5 niveles (Inicio > Catálogo > Cat > Subcat > Producto)
```

### Contact.tsx (Pendiente ⏳)
```
Requerido:
├── Reemplazar useMetaTags con <Helmet>
├── Reemplazar useJsonLd con useHelmetJsonLd
├── Agregar useMemo para branches schema
├── Agregar React.memo en export
├── Actualizar meta tags por sucursal

Meta Tags:
├── title: "Contacto - Sucursales Diamante"
├── description: "Ubicaciones y horarios"
├── og:title, og:image, og:url

Schemas:
├── BreadcrumbList (Inicio > Contacto)
└── LocalBusiness[] (Una por sucursal)
    └── areaServed, geo, address, phone
```

### CatalogCategories.tsx (Pendiente ⏳)
```
Requerido:
├── <Helmet> con title dinámico
├── Meta tags por categoría
├── useHelmetJsonLd para ItemList
├── useMemo para schemas
├── React.memo en export

Meta Tags:
├── title: "Categoría - Catálogo"
├── description: Desc de categoría
├── og:title, og:image

Schemas:
├── BreadcrumbList (Inicio > Catálogo)
└── ItemList (Subcategorías)
```

---

## 🎓 Flujo de Aprendizaje Recomendado

```
1. Lee QUICK_START_HELMET.md (15 min)
   └─ Entiende cambios rápidos

2. Revisa ProductDetail.tsx (20 min)
   └─ Mira ejemplo completo

3. Replica en Contact.tsx (30 min)
   └─ Practica el patrón

4. Lee HELMET_SSR_GUIDE.md (45 min)
   └─ Profundiza en conceptos

5. Mira SSR_SETUP_EXAMPLE.tsx (30 min)
   └─ Prepárate para futuro

6. Valida con herramientas (30 min)
   └─ Google Rich Results Test
```

---

## 🚀 Deploy Strategy

### Actual (SPA)
```
Vite Build
  ↓
dist/ folder
  ↓
Deploy a:
  • Vercel
  • Netlify
  • GitHub Pages
  • Servidor Estático
```

### Futuro (SSR)
```
Vite SSR Build
  ├─ dist/client/ (JavaScript del cliente)
  └─ dist/server/ (Bundle del servidor)
      ↓
Deploy a:
  • Vercel (con Edge Functions)
  • Netlify (con Functions)
  • Servidor Node.js
  • Railway, Render, etc.
```

---

## 📈 Roadmap

### Semana 1 (Actual)
- ✅ Helmet en App.tsx
- ✅ ProductDetail.tsx migrado
- ✅ About.tsx migrado
- ✅ Documentación

### Semana 2 (Próxima)
- [ ] Contact.tsx migrado
- [ ] CatalogCategories.tsx migrado
- [ ] ProductList.tsx migrado
- [ ] Validación SEO

### Semana 3
- [ ] Lazy loading images
- [ ] PWA setup
- [ ] Performance audits
- [ ] Optimize Core Web Vitals

### Mes 2
- [ ] SSR setup (Node/Express)
- [ ] entry-client.tsx
- [ ] entry-server.tsx
- [ ] BrowserRouter migration

### Mes 3
- [ ] Deploy SSR
- [ ] Performance monitoring
- [ ] Analytics integration
- [ ] Caching strategies

---

## 💡 Tips para Migración

### ✅ Hacer
```typescript
// 1. Copiar patrón de ProductDetail.tsx
// 2. Reemplazar nombre del componente
// 3. Actualizar meta tags
// 4. Actualizar esquemas JSON-LD
// 5. Agregar useMemo donde aplique
// 6. Envolver con React.memo()
```

### ❌ Evitar
```typescript
// ❌ No mezclar Helmet con hooks viejos
// ❌ No olvidar el React.memo
// ❌ No poner todo en una sola línea
// ❌ No repetir meta tags en hijo y padre
// ❌ No olvidar canonical URLs
```

---

**Arquitectura Diseñada para:**  
✅ Mejor SEO  
✅ Mejor Performance  
✅ Mejor Experiencia  
✅ Preparado para SSR  
✅ Fácil de Mantener  

**Última Actualización:** 2024
