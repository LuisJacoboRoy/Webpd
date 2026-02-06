/**
 * Ejemplos de Integración SEO en Componentes Existentes
 * Copiar y adaptar según necesidad
 */

// ============================================
// EJEMPLO 1: ProductDetail.tsx (ACTUAL)
// ============================================

/**
 * ANTES (Código actual sin cambios)
 */
/*
import React from 'react';
import { useParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(p => p.id === productId);

  return (
    <div className="product-detail">
      <h1>{product?.name}</h1>
      <p>{product?.description}</p>
      {/* resto del contenido */}
    </div>
  );
};
*/

/**
 * DESPUÉS (Con SEO, sin afectar lo existente)
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { useSEOProduct, SEOHelmet } from '../hooks/useSEOPrerender';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(p => p.id === productId);
  
  // Nuevo: Hook SEO (solo una línea)
  const seoData = useSEOProduct(productId || '');

  return (
    <>
      {/* Nuevo: SEO markup (puede ser comentado si no se usa) */}
      {seoData && <SEOHelmet seoData={seoData} />}
      
      {/* Código existente sin cambios */}
      <div className="product-detail">
        <h1>{product?.name}</h1>
        <p>{product?.description}</p>
        {/* resto del contenido */}
      </div>
    </>
  );
};

export default ProductDetail;

// ============================================
// EJEMPLO 2: CatalogCategories.tsx (ACTUAL)
// ============================================

/**
 * ANTES (Sin SEO)
 */
/*
const CatalogCategories: React.FC = () => {
  return (
    <div className="catalog">
      <h1>Catálogo de Productos</h1>
      {CATEGORIES.map(cat => (
        <Link key={cat.id} to={`/catalog/${cat.id}`}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
};
*/

/**
 * DESPUÉS (Con SEO)
 */
import { useSEOCategory } from '../hooks/useSEOPrerender';

const CatalogCategories: React.FC = () => {
  // Usar primer hook de categoría si necesita SEO global
  // o ver siguiente ejemplo para categoría específica
  
  return (
    <div className="catalog">
      <h1>Catálogo de Productos</h1>
      {CATEGORIES.map(cat => (
        <Link key={cat.id} to={`/catalog/${cat.id}`}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
};

// ============================================
// EJEMPLO 3: SubCategorySelector.tsx (CON SEO)
// ============================================

/**
 * Categoría específica con SEO
 */
import { useSEOCategory, SEOHelmet } from '../hooks/useSEOPrerender';

const SubCategorySelector: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const seoData = useSEOCategory(categoryId || '');

  return (
    <>
      {seoData && <SEOHelmet seoData={seoData} />}
      {/* Contenido existente */}
    </>
  );
};

// ============================================
// EJEMPLO 4: App.tsx (INTEGRACIÓN GLOBAL)
// ============================================

/**
 * A nivel de aplicación para schemas globales
 */
import {
  useOrganizationSchema,
  useLocalBusinessSchema
} from './hooks/useSEOPrerender';

const AppContent: React.FC = () => {
  // Ejecutar una sola vez al cargar la app
  useOrganizationSchema();      // Organization schema
  useLocalBusinessSchema();     // Local business schema

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        {/* Header, Navbar, etc */}
        <main className="flex-grow">
          {/* Routes aquí */}
        </main>
        {/* Footer, etc */}
      </div>
    </HashRouter>
  );
};

// ============================================
// EJEMPLO 5: Componente de Depuración (DESARROLLO)
// ============================================

/**
 * Ver en tiempo real problemas de SEO mientras desarrollas
 */
import { SEOStatusDebug, MetaTagPreview, JSONLDViewer } from '../components/SEOComponents';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const seoData = useSEOProduct(productId || '');

  return (
    <>
      <SEOHelmet seoData={seoData} />
      
      {/* Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <SEOStatusDebug seoData={seoData} />
          <div style={{ marginTop: '20px', padding: '20px' }}>
            <MetaTagPreview seoData={seoData} />
            <JSONLDViewer seoData={seoData} />
          </div>
        </>
      )}

      {/* Contenido normal */}
      <div className="product-detail">
        {/* ... */}
      </div>
    </>
  );
};

// ============================================
// EJEMPLO 6: Validación de SEO en Desarrollo
// ============================================

/**
 * Reportar problemas automáticamente en console
 */
import { useSEOValidation } from '../hooks/useSEOPrerender';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const seoData = useSEOProduct(productId || '');

  // Mostrar warnings en console si hay problemas
  useSEOValidation(seoData);

  return (
    <>
      <SEOHelmet seoData={seoData} />
      {/* Contenido */}
    </>
  );
};

// ============================================
// EJEMPLO 7: Meta Tags Dinámicos Manuales
// ============================================

/**
 * Si necesitas control manual de meta tags
 */
import { useDynamicMetaTags } from '../hooks/useSEOPrerender';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find(p => p.id === productId);

  // Actualizar meta tags manualmente
  useDynamicMetaTags(
    `${product?.name} - Pinturas Diamante`,
    product?.description || '',
    product?.ogImage,
    `https://pinturasdiamante.com/#/product/${productId}`
  );

  return (
    <div className="product-detail">
      {/* Contenido */}
    </div>
  );
};

// ============================================
// EJEMPLO 8: Usar con Wrapper Component
// ============================================

/**
 * Wrapper automático sin tocar componente
 */
import { ProductDetailWithSEO } from '../components/SEOComponents';
import ProductDetail from './ProductDetail';

const App: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  return (
    <ProductDetailWithSEO productId={productId || ''}>
      <ProductDetail />
    </ProductDetailWithSEO>
  );
};

// ============================================
// EJEMPLO 9: Configuración Centralizada
// ============================================

/**
 * Usar config centralizado si necesitas cambiar datos
 */
import { SEO_CONFIG, getSEOValue, getAbsoluteUrl } from '../config/seoConfig';

const customSEOData = {
  title: getSEOValue(
    'Mi Título Custom',
    SEO_CONFIG.seo.title.default
  ),
  description: getSEOValue(
    'Mi descripción',
    SEO_CONFIG.seo.description.default
  ),
  image: getAbsoluteUrl(SEO_CONFIG.seo.defaultImage),
  url: getAbsoluteUrl('#/product/auto-1')
};

// ============================================
// EJEMPLO 10: Generar Datos SEO en Build
// ============================================

/**
 * Script para generar páginas estáticas
 * Ejecutar: npm run prerender
 */
/*
import { exportAllProductsSEO } from './utils/seoPrerender';

const allProducts = exportAllProductsSEO();
allProducts.forEach(({ id, seoData, product }) => {
  // Generar HTML estático con seoData
  const html = generateHTML(seoData);
  // Guardar en disco
  fs.writeFileSync(`prerendered/product-${id}.html`, html);
});
*/

// ============================================
// INTEGRACIÓN PASO A PASO
// ============================================

/**
 * Pasos para integrar sin afectar código existente:
 * 
 * 1. Copiar uno de los ejemplos anterior
 * 
 * 2. Actualizar imports:
 *    ```tsx
 *    import { useSEOProduct, SEOHelmet } from '../hooks/useSEOPrerender';
 *    ```
 * 
 * 3. Usar hook dentro del componente:
 *    ```tsx
 *    const seoData = useSEOProduct(productId || '');
 *    ```
 * 
 * 4. Envolver contenido con SEOHelmet:
 *    ```tsx
 *    <SEOHelmet seoData={seoData} />
 *    ```
 * 
 * 5. El resto del código sigue igual
 * 
 * 6. Probar en navegador (F12 > head > meta tags nuevos)
 * 
 * 7. Ejecutar: npm run prerender
 * 
 * ✅ Listo, sin cambios en lógica existente
 */

// ============================================
// RESULTADO ESPERADO EN HTML
// ============================================

/**
 * Después de integración, el <head> tendrá:
 * 
 * <!-- SEO Markup Automático -->
 * <title>Esmalte Ureprix - Pinturas Diamante Oaxaca</title>
 * <meta name="description" content="...">
 * <meta property="og:type" content="product">
 * <meta property="og:image" content="...">
 * <link rel="canonical" href="...">
 * 
 * <!-- Structured Data -->
 * <script type="application/ld+json">
 * {
 *   "@context": "https://schema.org",
 *   "@type": "Product",
 *   "name": "Esmalte Ureprix",
 *   ...
 * }
 * </script>
 * 
 * ✅ Listo para Google, Facebook, Twitter, etc
 */
