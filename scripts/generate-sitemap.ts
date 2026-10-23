import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script para generar sitemaps dinámicos basados en los datos de productos
 * Genera sitemaps de páginas, productos, categorías e imágenes:
 * 1. sitemap.xml - Todas las URLs
 * 2. sitemap-products.xml - URLs canónicas de fichas de producto
 * 3. sitemap-categories.xml - Categorías y subcategorías
 * 4. sitemap-images.xml - Imágenes enlazadas a sus páginas de producto/categoría
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface URLEntry {
  loc: string;
  schemaType: string;
  images?: ImageEntry[];
}

interface ImageEntry {
  loc: string;
  title: string;
  caption: string;
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
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function imageReferences(baseUrl: string, title: string, description: string, candidates: (string | undefined)[]): ImageEntry[] {
  return [...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate)))]
    .filter(candidate => {
      if (/^https?:\/\//i.test(candidate)) return true;
      const localPath = path.join(__dirname, '..', 'public', candidate.replace(/^\/+/, ''));
      return fs.existsSync(localPath);
    })
    .map(candidate => ({
      loc: /^https?:\/\//i.test(candidate)
        ? candidate
        : `${baseUrl}${encodeURI(candidate.startsWith('/') ? candidate : `/${candidate}`)}`,
      title,
      caption: `${title}. Imagen de Diamante Pinturas. ${description}`.slice(0, 1000)
    }));
}

function generateImageSitemapXML(urls: URLEntry[]): string {
  const entries = urls
    .filter(url => url.images?.length)
    .map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${url.images!.map(image => `    <image:image>
      <image:loc>${escapeXml(image.loc)}</image:loc>
      <image:title>${escapeXml(image.title)}</image:title>
      <image:caption>${escapeXml(image.caption)}</image:caption>
    </image:image>`).join('\n')}
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
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
  const baseUrl = (process.env.SITE_URL || 'https://pinturasdiamante.com').replace(/\/+$/, '');

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
      {
        loc: `${baseUrl}/`,
        schemaType: 'Organization',
        images: [
          ...imageReferences(baseUrl, 'Pinturas Diamante', 'Soluciones de pintura para automotriz, maderas y decoración.', [
            '/img/heads/head.jpg',
            '/img/heads/head (2).jpg',
            '/img/heads/head (3).jpg',
            '/img/heads/head (4).jpg',
            '/img/logo.png',
            '/img/catalog/LOGO-WEB-DIAMANTE-PNG.png'
          ]),
          ...imageReferences(baseUrl, 'Base Color Innova Plus', 'Acabados automotrices de Diamante Pinturas.', ['/img/car.jpeg']),
          ...imageReferences(baseUrl, 'Poder Cubriente', 'Productos decorativos de Diamante Pinturas.', ['/img/rodillo.jpg']),
          ...imageReferences(baseUrl, 'Color Intenso', 'Acabados para madera de Diamante Pinturas.', ['/img/wood.jpg']),
          ...imageReferences(baseUrl, 'Diamacril 8 Años', 'Pintura decorativa de Diamante Pinturas.', ['/img/vinil.jpg']),
          ...imageReferences(baseUrl, 'Cromato de Zinc', 'Recubrimientos automotrices de Diamante Pinturas.', ['/img/product/cromato.jpg']),
          ...imageReferences(baseUrl, 'Esmalte Ureprix', 'Esmalte automotriz de Diamante Pinturas.', ['/img/product/urepix.jpg']),
          ...imageReferences(baseUrl, 'Innova Plus Red', 'Acabados automotrices de Diamante Pinturas.', ['/img/product/red.jpg']),
          ...imageReferences(baseUrl, 'D500 Anticorrosivo', 'Esmalte anticorrosivo de Diamante Pinturas.', ['/img/product/d500.jpg']),
          ...imageReferences(baseUrl, 'DG Secado Rápido', 'Esmalte industrial de Diamante Pinturas.', ['/img/product/industrial.jpg'])
        ].filter((image, index, images) =>
          images.findIndex(candidate => candidate.loc === image.loc) === index
        )
      },
      {
        loc: `${baseUrl}/catalog/`,
        schemaType: 'CollectionPage'
      },
      {
        loc: `${baseUrl}/contact/`,
        schemaType: 'ContactPage',
        images: imageReferences(baseUrl, 'Sucursales de Pinturas Diamante', 'Visita nuestras sucursales en Oaxaca.', [
          '/img/catalog/LOGO-WEB-DIAMANTE-PNG.png'
        ])
      }
    ];

    // Agregar categorías
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        allUrls.push({
          loc: `${baseUrl}/catalog/${cat.id}/`,
          schemaType: 'CollectionPage',
          images: imageReferences(baseUrl, cat.name, cat.description, [cat.image, cat.ogImage])
        });
      });
    }

    // Agregar subcategorías
    if (Array.isArray(subCategories)) {
      subCategories.forEach(subCat => {
        const category = categories.find(c => c.id === subCat.categoryId);
        if (category) {
          allUrls.push({
            loc: `${baseUrl}/catalog/${category.id}/${subCat.id}/`,
            schemaType: 'CollectionPage',
            images: imageReferences(
              baseUrl,
              subCat.name,
              subCat.description || `Productos de ${subCat.name} de Pinturas Diamante.`,
              products.filter(product => product.subCategoryId === subCat.id)
                .flatMap(product => [product.image, product.ogImage])
            )
          });
        }
      });
    }

    // Agregar productos
    if (Array.isArray(products)) {
      products.forEach(product => {
        allUrls.push({
          loc: `${baseUrl}/product/${product.id}/`,
          schemaType: 'ProductPage',
          images: imageReferences(
            baseUrl,
            product.name,
            product.ogDescription || product.description,
            [product.image, product.ogImage]
          )
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
    const productUrls = allUrls.filter(u => u.schemaType === 'ProductPage');
    const productSitemap = generateSitemapXML(productUrls);
    const productPath = path.join(__dirname, '..', 'public', 'sitemap-products.xml');
    fs.writeFileSync(productPath, productSitemap);

    console.log(`✅ sitemap-products.xml generado (${productUrls.length} URLs)`);

    // ============================================
    // 3. SITEMAP DE CATEGORÍAS
    // ============================================
    const categoryUrls = allUrls.filter(u => u.schemaType === 'CollectionPage');
    const categorySitemap = generateSitemapXML(categoryUrls);
    const categoryPath = path.join(__dirname, '..', 'public', 'sitemap-categories.xml');
    fs.writeFileSync(categoryPath, categorySitemap);

    console.log(`✅ sitemap-categories.xml generado (${categoryUrls.length} URLs)`);

    // ============================================
    // 4. SITEMAP DE IMÁGENES
    // ============================================
    const imageSitemapPath = path.join(__dirname, '..', 'public', 'sitemap-images.xml');
    const imageSitemap = generateImageSitemapXML(allUrls);
    fs.writeFileSync(imageSitemapPath, imageSitemap);
    const indexedImageCount = allUrls.reduce((count, entry) => count + (entry.images?.length || 0), 0);
    console.log(`✅ sitemap-images.xml generado (${indexedImageCount} imágenes enlazadas a sus páginas)`);

    // ============================================
    // 5. METADATOS PARA GOOGLE SEARCH CONSOLE
    // ============================================
    const schemaStats = {
      Organization: allUrls.filter(u => u.schemaType === 'Organization').length,
      ProductPage: productUrls.length,
      CollectionPage: categoryUrls.length,
      ContactPage: allUrls.filter(u => u.schemaType === 'ContactPage').length
    };

    const metadata = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      sitemaps: {
        general: 'sitemap.xml',
        products: 'sitemap-products.xml',
        categories: 'sitemap-categories.xml',
        images: 'sitemap-images.xml'
      },
      statistics: {
        totalURLs: allUrls.length,
        bySchema: schemaStats,
        breakdown: {
          staticPages: 3,
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
            'https://pinturasdiamante.com/sitemap-categories.xml',
            'https://pinturasdiamante.com/sitemap-images.xml'
          ]
        },
        step3: {
          title: 'Revisar datos estructurados',
          location: 'Search Console > Mejoras (solo los tipos que Google reporte)',
          note: 'No todos los esquemas generan un informe o un resultado enriquecido.',
          options: {
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
            valid: `Se enviaron ${allUrls.length} URLs; el envío no garantiza que Google las indexe`,
            excluded: 'Las URLs enviadas no garantizan indexación; revisa las exclusiones y sus motivos',
            error: 'Resuelve cualquier error de indexación'
          }
        }
      },
      schemasTracking: {
        productPages: {
          schema: 'WebPage / Thing',
          count: products.length,
          howToMeasure: 'En Search Console > Rendimiento, filtra por página; el sitemap no habilita resultados enriquecidos de producto',
          expectedMetrics: ['clics', 'impresiones', 'CTR', 'posición']
        },
        images: {
          sitemap: 'sitemap-images.xml',
          count: indexedImageCount,
          copyrightHolder: 'Diamante Pinturas'
        },
        categories: {
          schema: 'Category / BreadcrumbList',
          count: categoryUrls.length,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
          howToMeasure: 'En "Resultados enriquecidos" > "BreadcrumbList"',
          expectedMetrics: ['indexed', 'valid', 'invalid']
        },
        organization: {
          schema: 'Organization',
          count: schemaStats.Organization,
          documentation: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
          howToMeasure: 'Validar el JSON-LD con Rich Results Test; Search Console puede no mostrar un informe para este tipo',
          expectedMetrics: ['datos estructurados detectados']
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
      imageIndexing: {
        sitemap: 'sitemap-images.xml',
        indexedImages: indexedImageCount,
        copyrightHolder: 'Diamante Pinturas'
      },
      urls: {
        products: productUrls.slice(0, 10).map(u => u.loc),
        categories: categoryUrls.slice(0, 10).map(u => u.loc)
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
    console.log(`   Páginas estáticas   : 3`);
    console.log(`   Categorías          : ${categories.length}`);
    console.log(`   Subcategorías       : ${subCategories.length}`);
    console.log(`   Productos           : ${products.length}`);
    console.log(`   ────────────────────────`);
    console.log(`   TOTAL URLs          : ${allUrls.length}`);

    console.log(`\n🚀 PRÓXIMOS PASOS - AGREGAR A GOOGLE SEARCH CONSOLE:`);
    console.log(`\n   1️⃣  Ve a: https://search.google.com/search-console`);
    console.log(`   2️⃣  Selecciona tu propiedad: pinturasdiamante.com`);
    console.log(`   3️⃣  Menú izquierdo > Sitemaps`);
    console.log(`   4️⃣  Agrega estos 4 sitemaps:`);
    console.log(`       • https://pinturasdiamante.com/sitemap.xml`);
    console.log(`       • https://pinturasdiamante.com/sitemap-products.xml`);
    console.log(`       • https://pinturasdiamante.com/sitemap-categories.xml`);
    console.log(`       • https://pinturasdiamante.com/sitemap-images.xml`);

    console.log(`\n📈 CÓMO REVISAR INDEXACIÓN Y RESULTADOS ENRIQUECIDOS:`);
    console.log(`   • Usa "Inspección de URLs" y el informe de páginas para revisar la indexación.`);
    console.log(`   • Consulta "Mejoras" para los tipos de datos estructurados que Google reporte.`);
    console.log(`   • Las fichas no llevan schema Product ni garantizan resultados enriquecidos de producto.`);
    console.log(`\n   Para ver CLICS y IMPRESIONES por página:`);
    console.log(`   • Ve a: Menú > Rendimiento`);
    console.log(`   • Filtra por "Página" para ver qué productos/categorías generan tráfico`);

    console.log(`\n✅ Archivos generados:`);
    console.log(`   ✓ public/sitemap.xml`);
    console.log(`   ✓ public/sitemap-products.xml`);
    console.log(`   ✓ public/sitemap-categories.xml`);
    console.log(`   ✓ public/sitemap-images.xml`);
    console.log(`   ✓ public/sitemap-metadata.json (instrucciones detalladas)`);

  } catch (error) {
    console.error('❌ Error generando sitemaps:', error);
    process.exit(1);
  }
}

// Ejecutar
generateSitemaps();
