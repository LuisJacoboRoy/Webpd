import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script para generar sitemaps dinámicos basados en los datos de productos
 * Genera 3 sitemaps:
 * 1. sitemap.xml - Todas las URLs
 * 2. sitemap-products.xml - Solo productos con schema Product
 * 3. sitemap-categories.xml - Categorías y subcategorías
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface URLEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  schemaType: string;
}

function escapeXml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemapXML(urls: URLEntry[]): string {
  const urlEntries = urls
    .map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function extractProductIds(productsContent: string): string[] {
  const productIdMatches = [...productsContent.matchAll(/id:\s*['"`]([a-z0-9-]+)['"`],\s*categoryId/g)];
  return productIdMatches.map(m => m[1]);
}

function readProductsData(): {
  products: { id: string }[];
  categories: { id: string; name: string }[];
  subCategories: { id: string; categoryId: string; name: string }[];
} {
  const productsPath = path.join(__dirname, '..', 'data', 'products.ts');
  const content = fs.readFileSync(productsPath, 'utf-8');

  // Extraer categorías
  const categoryRegex = /\{\s*id:\s*['"`]([^'"`]+)['"`],\s*name:\s*['"`]([^'"`]+)['"`]/g;
  const categories: { id: string; name: string }[] = [];

  let match;
  const categoriesSection = content.substring(
    content.indexOf('CATEGORIES: Category[]'),
    content.indexOf('export const SUB_CATEGORIES')
  );

  let catMatch;
  while ((catMatch = categoryRegex.exec(categoriesSection)) !== null) {
    categories.push({ id: catMatch[1], name: catMatch[2] });
  }

  // Extraer subcategorías
  const subCategoryRegex = /\{\s*id:\s*['"`]([^'"`]+)['"`],\s*categoryId:\s*['"`]([^'"`]+)['"`],\s*name:\s*['"`]([^'"`]+)['"`]/g;
  const subCategories: { id: string; categoryId: string; name: string }[] = [];

  const subCatSection = content.substring(
    content.indexOf('SUB_CATEGORIES: SubCategory[]'),
    content.indexOf('export const PRODUCTS')
  );

  let subCatMatch;
  while ((subCatMatch = subCategoryRegex.exec(subCatSection)) !== null) {
    subCategories.push({
      id: subCatMatch[1],
      categoryId: subCatMatch[2],
      name: subCatMatch[3]
    });
  }

  // Extraer productos
  const products = extractProductIds(content).map(id => ({ id }));

  return { products, categories, subCategories };
}

// Importar datos dinámicamente
async function loadProductsData() {
  try {
    const { PRODUCTS, CATEGORIES, SUB_CATEGORIES } = await import('../data/products.js');
    const { BUSINESS_LOCATIONS } = await import('../data/seo.js');
    return { PRODUCTS, CATEGORIES, SUB_CATEGORIES, BUSINESS_LOCATIONS };
  } catch (error) {
    console.warn('⚠️ No se pudieron cargar datos dinámicos, usando método fallback');
    return {
      PRODUCTS: [],
      CATEGORIES: [],
      SUB_CATEGORIES: [],
      BUSINESS_LOCATIONS: []
    };
  }
}

async function generateSitemaps() {
  const baseUrl = process.env.SITE_URL || 'https://pinturasdiamante.com';
  const today = new Date().toISOString().split('T')[0];

  try {
    // Leer datos de productos
    const { PRODUCTS, CATEGORIES, SUB_CATEGORIES, BUSINESS_LOCATIONS } = await loadProductsData();
    
    // Si falla la carga dinámica, usar método de parsing
    let products = PRODUCTS || [];
    let categories = CATEGORIES || [];
    let subCategories = SUB_CATEGORIES || [];
    let businessLocations = BUSINESS_LOCATIONS || [];

    if (products.length === 0) {
      const { products: p, categories: c, subCategories: sc } = readProductsData();
      products = p;
      categories = c;
      subCategories = sc;
    }

    console.log('📚 Datos cargados:');
    console.log(`   - Productos: ${products.length}`);
    console.log(`   - Categorías: ${categories.length}`);
    console.log(`   - Subcategorías: ${subCategories.length}`);
    console.log(`   - Sucursales: ${businessLocations.length}`);

    // ============================================
    // 1. SITEMAP GENERAL (todas las URLs)
    // ============================================
    const allUrls: URLEntry[] = [
      // URLs estáticas
      {
        loc: `${baseUrl}/`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 1.0,
        schemaType: 'Organization'
      },
      {
        loc: `${baseUrl}/#/catalog`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.9,
        schemaType: 'CollectionPage'
      },
      {
        loc: `${baseUrl}/#/contact`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.8,
        schemaType: 'LocalBusiness'
      },
      {
        loc: `${baseUrl}/#/about`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
        schemaType: 'Organization'
      }
    ];

    // Agregar ubicaciones de sucursales
    if (businessLocations && Array.isArray(businessLocations)) {
      businessLocations.forEach(location => {
        allUrls.push({
          loc: `${baseUrl}/#/location/${location.id}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: 0.6,
          schemaType: 'LocalBusiness'
        });
      });
    }

    // Agregar categorías
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        allUrls.push({
          loc: `${baseUrl}/#/catalog/${cat.id}`,
          lastmod: today,
          changefreq: 'weekly',
          priority: 0.85,
          schemaType: 'Category'
        });
      });
    }

    // Agregar subcategorías
    if (Array.isArray(subCategories)) {
      subCategories.forEach(subCat => {
        const category = categories.find(c => c.id === subCat.categoryId);
        if (category) {
          allUrls.push({
            loc: `${baseUrl}/#/catalog/${category.id}/${subCat.id}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 0.80,
            schemaType: 'Category'
          });
        }
      });
    }

    // Agregar productos
    if (Array.isArray(products)) {
      products.forEach((product, index) => {
        const date = new Date(2026, 2, 15 + Math.floor(index / 10)).toISOString().split('T')[0];
        allUrls.push({
          loc: `${baseUrl}/#/product/${product.id}`,
          lastmod: date,
          changefreq: 'monthly',
          priority: 0.70,
          schemaType: 'Product'
        });
      });
    }

    // Generar sitemap general
    const generalSitemap = generateSitemapXML(allUrls);
    const generalPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.mkdirSync(path.dirname(generalPath), { recursive: true });
    fs.writeFileSync(generalPath, generalSitemap);

    console.log(`\n✅ sitemap.xml generado (${allUrls.length} URLs)`);

    // ============================================
    // 2. SITEMAP DE PRODUCTOS
    // ============================================
    const productUrls = allUrls.filter(u => u.schemaType === 'Product');
    const productSitemap = generateSitemapXML(productUrls);
    const productPath = path.join(__dirname, '..', 'public', 'sitemap-products.xml');
    fs.writeFileSync(productPath, productSitemap);

    console.log(`✅ sitemap-products.xml generado (${productUrls.length} URLs)`);

    // ============================================
    // 3. SITEMAP DE CATEGORÍAS
    // ============================================
    const categoryUrls = allUrls.filter(u =>
      u.schemaType === 'Category' || u.schemaType === 'CollectionPage'
    );
    const categorySitemap = generateSitemapXML(categoryUrls);
    const categoryPath = path.join(__dirname, '..', 'public', 'sitemap-categories.xml');
    fs.writeFileSync(categoryPath, categorySitemap);

    console.log(`✅ sitemap-categories.xml generado (${categoryUrls.length} URLs)`);

    // ============================================
    // 4. METADATOS PARA GOOGLE SEARCH CONSOLE
    // ============================================
    const schemaStats = {
      Organization: allUrls.filter(u => u.schemaType === 'Organization').length,
      LocalBusiness: allUrls.filter(u => u.schemaType === 'LocalBusiness').length,
      Category: allUrls.filter(u => u.schemaType === 'Category').length,
      Product: allUrls.filter(u => u.schemaType === 'Product').length,
      CollectionPage: allUrls.filter(u => u.schemaType === 'CollectionPage').length
    };

    const localBusinessUrls = allUrls.filter(u => u.schemaType === 'LocalBusiness');

    const metadata = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      sitemaps: {
        general: 'sitemap.xml',
        products: 'sitemap-products.xml',
        categories: 'sitemap-categories.xml'
      },
      statistics: {
        totalURLs: allUrls.length,
        bySchema: schemaStats,
        breakdown: {
          staticPages: 4,
          locations: businessLocations.length,
          categories: categories.length,
          subcategories: subCategories.length,
          products: products.length
        }
      },
      measurementGuide: {
        title: 'Cómo medir el alcance SEO por tipo de esquema en Google Search Console',
        step1: {
          title: 'Ir a Google Search Console',
          url: 'https://search.google.com/search-console',
          action: 'Selecciona tu propiedad: pinturasdiamante.com'
        },
        step2: {
          title: 'Agregar Sitemaps',
          location: 'Menú izquierdo > Sitemaps',
          urls: [
            'https://pinturasdiamante.com/sitemap.xml',
            'https://pinturasdiamante.com/sitemap-products.xml',
            'https://pinturasdiamante.com/sitemap-categories.xml'
          ]
        },
        step3: {
          title: 'Ver Resultados Enriquecidos por Tipo de Esquema',
          location: 'Menú izquierdo > Apariencia en búsqueda > Resultados enriquecidos',
          options: {
            product: {
              name: 'Product',
              description: 'Muestra todas las páginas de productos indexadas',
              expectedCount: products.length
            },
            breadcrumb: {
              name: 'BreadcrumbList',
              description: 'Migas de pan para navegación',
              expectedCount: 'Múltiples (una por página de producto/categoría)'
            },
            organization: {
              name: 'Organization',
              description: 'Información de la organización',
              expectedCount: 1
            },
            localBusiness: {
              name: 'LocalBusiness',
              description: 'Información de sucursales y ubicaciones',
              expectedCount: businessLocations.length
            }
          }
        },
        step4: {
          title: 'Ver Performance por Página',
          location: 'Menú izquierdo > Rendimiento',
          filters: {
            byType: 'Usa "Filtros avanzados" para ver por tipo de página',
            byQueryParameter: 'Agrupa por "Página" para ver clics/impresiones por producto o categoría',
            byDevice: 'Filtra por dispositivo (móvil/escritorio) para ver qué schemas funcionan mejor'
          }
        },
        step5: {
          title: 'Monitorear Cobertura',
          location: 'Menú izquierdo > Cobertura',
          whatToLook: {
            valid: `Debe mostrar ${allUrls.length} URLs válidas`,
            excluded: 'Verifica qué URLs están excluidas y por qué',
            error: 'Resuelve cualquier error de indexación'
          }
        }
      },
      schemasTracking: {
        products: {
          schema: 'Product',
          count: products.length,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/product',
          howToMeasure: 'En "Resultados enriquecidos" > "Product", verás el número de productos indexados',
          expectedMetrics: ['indexed', 'valid', 'invalid', 'excluded']
        },
        categories: {
          schema: 'Category / BreadcrumbList',
          count: categoryUrls.length,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
          howToMeasure: 'En "Resultados enriquecidos" > "BreadcrumbList"',
          expectedMetrics: ['indexed', 'valid', 'invalid']
        },
        locations: {
          schema: 'LocalBusiness',
          count: localBusinessUrls.length,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
          howToMeasure: 'En "Resultados enriquecidos" > "LocalBusiness" o mediante Google Business Profile',
          expectedMetrics: ['indexed', 'valid', 'invalid']
        },
        organization: {
          schema: 'Organization',
          count: schemaStats.Organization,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
          howToMeasure: 'En "Resultados enriquecidos" > "Organization"',
          expectedMetrics: ['indexed', 'valid']
        }
      },
      analyticsIntegration: {
        googleAnalytics: {
          howToTrack: 'Configura eventos en Google Analytics para rastrear clics en resultados enriquecidos',
          eventExample: {
            eventName: 'view_item',
            parameters: {
              item_id: 'product_id',
              item_name: 'product_name',
              item_category: 'product_category',
              value: 'price'
            }
          }
        },
        gscIntegration: {
          howToTrack: 'Google Search Console te muestra automáticamente las impresiones por tipo de esquema',
          metricsAvailable: ['Clics', 'Impresiones', 'CTR', 'Posición promedio']
        }
      },
      urls: {
        products: productUrls.slice(0, 10).map(u => ({ url: u.loc, lastmod: u.lastmod })),
        categories: categoryUrls.slice(0, 10).map(u => ({ url: u.loc, lastmod: u.lastmod })),
        locations: localBusinessUrls.map(u => ({ url: u.loc, lastmod: u.lastmod }))
      }
    };

    const metadataPath = path.join(__dirname, '..', 'public', 'sitemap-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✅ sitemap-metadata.json generado`);

    // ============================================
    // 5. RESUMEN Y ESTADÍSTICAS
    // ============================================
    console.log(`\n📊 RESUMEN POR TIPO DE ESQUEMA:`);
    Object.entries(schemaStats).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${type.padEnd(20)}: ${count}`);
      }
    });

    console.log(`\n📍 DESGLOSE DETALLADO:`);
    console.log(`   Páginas estáticas   : 4`);
    console.log(`   Sucursales/Ubicaciones: ${businessLocations.length}`);
    console.log(`   Categorías          : ${categories.length}`);
    console.log(`   Subcategorías       : ${subCategories.length}`);
    console.log(`   Productos           : ${products.length}`);
    console.log(`   ────────────────────────`);
    console.log(`   TOTAL URLs          : ${allUrls.length}`);

    console.log(`\n🚀 PRÓXIMOS PASOS - AGREGAR A GOOGLE SEARCH CONSOLE:`);
    console.log(`\n   1️⃣  Ve a: https://search.google.com/search-console`);
    console.log(`   2️⃣  Selecciona tu propiedad: pinturasdiamante.com`);
    console.log(`   3️⃣  Menú izquierdo > Sitemaps`);
    console.log(`   4️⃣  Agrega estas 3 URLs:`);
    console.log(`       • https://pinturasdiamante.com/sitemap.xml`);
    console.log(`       • https://pinturasdiamante.com/sitemap-products.xml`);
    console.log(`       • https://pinturasdiamante.com/sitemap-categories.xml`);

    console.log(`\n📈 CÓMO MEDIR POR ESQUEMA:`);
    console.log(`\n   Para ver el INDEXADO y PERFORMANCE por tipo de esquema:`);
    console.log(`   • Ve a: Menú > Apariencia en búsqueda > Resultados enriquecidos`);
    console.log(`   • Verás: Product, BreadcrumbList, LocalBusiness, Organization`);
    console.log(`   • Cada uno mostrará: válidos, inválidos, excluidos`);
    console.log(`\n   Para ver CLICS y IMPRESIONES por página:`);
    console.log(`   • Ve a: Menú > Rendimiento`);
    console.log(`   • Filtra por "Página" para ver qué productos/categorías generan tráfico`);

    console.log(`\n✅ Archivos generados:`);
    console.log(`   ✓ public/sitemap.xml`);
    console.log(`   ✓ public/sitemap-products.xml`);
    console.log(`   ✓ public/sitemap-categories.xml`);
    console.log(`   ✓ public/sitemap-metadata.json (instrucciones detalladas)`);

  } catch (error) {
    console.error('❌ Error generando sitemaps:', error);
    process.exit(1);
  }
}

// Ejecutar
generateSitemaps();

