# Mejores Prácticas de React-Helmet-Async + SSR

## Resumen de Implementación

Este documento detalla las mejores prácticas aplicadas para optimizar el sitio hacia SSR (Server-Side Rendering) usando `react-helmet-async` y `react-router-dom`.

---

## 1. Migración de Hooks Personalizados a Helmet

### Antes (Hooks personalizados)
```typescript
// Antiguo
useMetaTags({ title, description, ogImage });
useJsonLd({ '@type': 'Product', ... });
```

### Después (React-Helmet-Async)
```typescript
// Nuevo - más estándar y SSR-ready
<Helmet>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:image" content={ogImage} />
</Helmet>

useHelmetJsonLd({ '@type': 'Product', ... });
```

### Ventajas de Helmet
✅ **SSR-Ready**: Soporta renderToString y renderToPipeableStream  
✅ **Estándar**: Librería oficial mantenida activamente  
✅ **Manejo de conflictos**: Elimina automáticamente meta tags duplicados  
✅ **Contexto**: Soporte para contextos de SSR con `<HelmetProvider>`  
✅ **Nested**: Permite Helmet en componentes anidados con precedencia clara  

---

## 2. Configuración de App.tsx

### HelmetProvider en Raíz
```typescript
const App: React.FC = () => {
  const helmetContext = {};

  return (
    <HelmetProvider context={helmetContext}>
      <CartProvider>
        {/* Contenido */}
      </CartProvider>
    </HelmetProvider>
  );
};
```

**Por qué importa para SSR:**
- El `context` debe pasarse en SSR para extraer meta tags
- En cliente, se usa `{}` vacío  
- En servidor, se usa para renderizar `<head>` correcto

### Meta Tags Globales
Se establecen en `App.tsx` dentro de `<Helmet>`:
```typescript
<Helmet>
  <html lang="es" />
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:site_name" content={BUSINESS_INFO.name} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="canonical" href={BUSINESS_INFO.url} />
</Helmet>
```

---

## 3. Lazy Loading de Componentes

### Configuración en App.tsx
```typescript
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));

// Con Suspense
<Suspense fallback={<LoadingComponent />}>
  <Routes>
    <Route path="/" element={<About />} />
    {/* más rutas */}
  </Routes>
</Suspense>
```

**Beneficios:**
- Code-splitting automático
- Reduce tamaño del bundle inicial
- Mejora Core Web Vitals (LCP, FID)
- Los componentes se cargan bajo demanda

---

## 4. Optimizaciones con useMemo y React.memo

### useMemo para Cálculos Costosos
```typescript
// Evita recalcular en cada render
const keywords = useMemo(() => {
  return [product.tag, product.name.split(' ')[0], ...]
    .filter(Boolean)
    .slice(0, 5)
    .join(', ');
}, [product, category, subCat]);

const productSchema = useMemo(() => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  // ... propiedades
}), [product, category, subCat, canonicalUrl]);
```

### React.memo en Exportación
```typescript
export default React.memo(ProductDetailComponent);
```

**Cuando usar:**
- Componentes con props costosas
- Componentes en listas largas
- Props primitivas que cambian frecuentemente
- Componentes puros (no usan context frecuentemente)

---

## 5. Meta Tags Dinámicos para Cada Página

### Patrón Recomendado
```typescript
const ProductDetailComponent: React.FC = () => {
  const { productId } = useParams();
  const product = PRODUCTS.find(p => p.id === productId);

  return (
    <>
      <Helmet>
        <title>{product.name} - Diamante Oaxaca</title>
        <meta name="description" content={product.description} />
        <meta property="og:image" content={product.ogImage} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Contenido del componente */}
    </>
  );
};
```

### Meta Tags por Tipo de Página

#### Página de Producto
```typescript
<Helmet>
  <title>{product.name} - Diamante Oaxaca</title>
  <meta property="og:type" content="product" />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:price:amount" content="Consultar" />
  <meta property="og:price:currency" content="MXN" />
</Helmet>
```

#### Página de Categoría
```typescript
<Helmet>
  <title>{category.name} - Pinturas Diamante</title>
  <meta property="og:type" content="website" />
  <meta property="og:image" content={category.image} />
</Helmet>
```

#### Página de Inicio (About)
```typescript
<Helmet>
  <title>Pinturas Diamante - 30 Años Sirviendo a Oaxaca</title>
  <meta property="og:type" content="business.business" />
</Helmet>
```

---

## 6. JSON-LD Schemas con Helmet

### Hook Personalizado: useHelmetJsonLd
```typescript
export const useHelmetJsonLd = (schema: any) => {
  useEffect(() => {
    const scriptId = `json-ld-${Date.now()}-${Math.random()}`;
    let script = document.querySelector(
      `script[data-ld-json="${scriptId}"]`
    );
    
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-ld-json', scriptId);
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(schema);
  }, [schema]);
};
```

### Uso en Componentes
```typescript
// En ProductDetail
useHelmetJsonLd({
  '@type': 'Product',
  'name': product.name,
  'offers': {
    '@type': 'Offer',
    'priceCurrency': 'MXN',
    'price': 'Consultar'
  }
});

useHelmetJsonLd({
  '@type': 'BreadcrumbList',
  'itemListElement': [...]
});
```

---

## 7. Router Optimization para SSR

### Actual: HashRouter (Client-side SPA)
```typescript
<HashRouter>
  <Routes>
    <Route path="/" element={<About />} />
    {/* Rutas con # prefix: /#/, /#/catalog */}
  </Routes>
</HashRouter>
```

### Para SSR: BrowserRouter (con servidor Node)
```typescript
// Client-side
<BrowserRouter>
  <Routes>{/* rutas */}</Routes>
</BrowserRouter>

// Server-side
import { StaticRouter } from 'react-router-dom/server';

const App = ({ location }) => (
  <StaticRouter location={location}>
    <Routes>{/* rutas */}</Routes>
  </StaticRouter>
);
```

**Transición recomendada:**
1. Mantener HashRouter por ahora (funciona como SPA)
2. Cuando se implemente SSR, cambiar a BrowserRouter
3. Crear servidor Express/Node para manejar rutas

---

## 8. Performance Considerations

### Preconnect para Recursos Externos
```typescript
<Helmet>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://cdn.tailwindcss.com" />
  <link rel="dns-prefetch" href="https://analytics.google.com" />
</Helmet>
```

### Lazy Loading de Imágenes
```typescript
<img 
  src={product.image}
  alt={product.name}
  loading="lazy"
  decoding="async"
/>
```

### Suspense Boundaries
```typescript
<Suspense fallback={<LoadingComponent />}>
  <Routes>
    {/* Rutas con componentes lazy-loaded */}
  </Routes>
</Suspense>
```

---

## 9. SSR Setup (Para Futuro)

### Estructura Recomendada
```
src/
├── entry-client.tsx       // Entrada para cliente
├── entry-server.tsx       // Entrada para servidor
├── App.tsx
└── components/

server.ts                   // Express/Node server
```

### Ejemplo: entry-server.tsx
```typescript
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';

export async function render(url: string) {
  const helmetContext = {};
  
  const markup = renderToString(
    <HelmetProvider context={helmetContext}>
      <App />
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  
  return `
    <!DOCTYPE html>
    <html ${helmet.htmlAttributes.toString()}>
      <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
      </head>
      <body>
        <div id="root">${markup}</div>
      </body>
    </html>
  `;
}
```

---

## 10. Validación y Testing

### Verificar Meta Tags en Navegador
```javascript
// Console en navegador
document.head.innerHTML
document.querySelector('meta[property="og:title"]')?.content
document.querySelector('link[rel="canonical"]')?.href
document.querySelectorAll('script[type="application/ld+json"]')
```

### Herramientas para Validar
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org/
- **Open Graph Debugger (Facebook)**: https://developers.facebook.com/tools/debug/og/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator

---

## 11. Checklist de Implementación

### Por cada componente de página:

- [ ] Importar `Helmet` de react-helmet-async
- [ ] Agregar `<Helmet>` con título dinámico
- [ ] Incluir meta descripción (160 caracteres max)
- [ ] Incluir keywords (5 máximo)
- [ ] Agregar Open Graph meta tags
- [ ] Incluir canonical URL
- [ ] Agregar JSON-LD schema apropiado
- [ ] Usar `useMemo` para cálculos costosos
- [ ] Envolver exportación con `React.memo` si aplica
- [ ] Agregar `loading="lazy"` a imágenes
- [ ] Testing con Rich Results Test

### A nivel de App.tsx:

- [ ] `<HelmetProvider context={}>` en raíz
- [ ] Meta tags globales en `<Helmet>`
- [ ] Preconnect a recursos externos
- [ ] `<Suspense>` alrededor de `<Routes>`
- [ ] Componentes lazy-loaded con `lazy()`
- [ ] LoadingComponent para fallback

---

## 12. Referencias

- **React-Helmet-Async**: https://github.com/stardust66/react-helmet-async
- **Schema.org Types**: https://schema.org/
- **Open Graph Protocol**: https://ogp.me/
- **React Router SSR**: https://reactrouter.com/en/start/concepts
- **Web.dev Performance**: https://web.dev/

---

## Conclusión

Implementar estas prácticas prepara el sitio para:
✅ SSR futuro (renderizado en servidor)  
✅ Mejor SEO (meta tags, schemas, canonical URLs)  
✅ Mejor performance (lazy loading, code splitting, memoization)  
✅ Mejor experiencia de usuario (carga progresiva, LCP mejorado)  
✅ Mejor mantenibilidad (código más estándar y limpio)
