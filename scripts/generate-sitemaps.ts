import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products.js';
import { BUSINESS_LOCATIONS } from '../data/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://pinturasdiamante.com';
const PUBLIC_DIR = path.join(__dirname, '../public');

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  schema?: string;
}

// Función para generar XML del sitemap
function generateSitemapXML(entries: SitemapEntry[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

// Función para generar sitemap índice
function generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod: string }>): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  return xml;
}

// Hoy (para lastmod)
const today = new Date().toISOString().split('T')[0];

// 1. SITEMAP DE PÁGINAS ESTÁTICAS
function generatePagesSitemap(): SitemapEntry[] {
  const pages: SitemapEntry[] = [
    {
      loc: `${BASE_URL}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 1.0,
      schema: 'Organization'
    },
    {
      loc: `${BASE_URL}/contact`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
      schema: 'LocalBusiness'
    },
    {
      loc: `${BASE_URL}/catalog`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9,
      schema: 'CollectionPage'
    },
    {
      loc: `${BASE_URL}/about`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      schema: 'Organization'
    }
  ];

  // Agregar ubicaciones de sucursales
  BUSINESS_LOCATIONS.forEach(location => {
    pages.push({
      loc: `${BASE_URL}/location/${location.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6,
      schema: 'LocalBusiness'
    });
  });

  return pages;
}

// 2. SITEMAP DE CATEGORÍAS Y SUBCATEGORÍAS
function generateCategoriesSitemap(): SitemapEntry[] {
  const categories: SitemapEntry[] = [];

  // Categorías principales
  CATEGORIES.forEach(category => {
    categories.push({
      loc: `${BASE_URL}/catalog/${category.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
      schema: 'Category'
    });
  });

  // Subcategorías
  SUB_CATEGORIES.forEach(subCategory => {
    categories.push({
      loc: `${BASE_URL}/catalog/${subCategory.categoryId}/${subCategory.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.80,
      schema: 'Category'
    });
  });

  return categories;
}

// 3. SITEMAP DE PRODUCTOS (puede dividirse en múltiples si hay >50k URLs)
function generateProductsSitemap(): SitemapEntry[] {
  const products: SitemapEntry[] = [];

  PRODUCTS.forEach(product => {
    products.push({
      loc: `${BASE_URL}/product/${product.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      schema: 'Product'
    });
  });

  return products;
}

// 4. CREAR ARCHIVOS
function createSitemaps() {
  const pagesEntries = generatePagesSitemap();
  const categoriesEntries = generateCategoriesSitemap();
  const productsEntries = generateProductsSitemap();

  // Generar XMLs
  const pagesSitemap = generateSitemapXML(pagesEntries);
  const categoriesSitemap = generateSitemapXML(categoriesEntries);
  const productsSitemap = generateSitemapXML(productsEntries);

  // Escribir archivos
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), pagesSitemap);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-categories.xml'), categoriesSitemap);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-products.xml'), productsSitemap);

  // Generar sitemap índice
  const sitemapIndex = generateSitemapIndex([
    { loc: `${BASE_URL}/sitemap-pages.xml`, lastmod: today },
    { loc: `${BASE_URL}/sitemap-categories.xml`, lastmod: today },
    { loc: `${BASE_URL}/sitemap-products.xml`, lastmod: today }
  ]);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndex);

  // Generar un robots.txt mejorado
  const robotsTxt = `# Pinturas Diamante Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Descargar user agents específicos
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt);

  console.log('✅ Sitemaps generados exitosamente:');
  console.log(`   📄 sitemap.xml (índice) - ${sitemapIndex.length} bytes`);
  console.log(`   📄 sitemap-pages.xml - ${pagesEntries.length} URLs`);
  console.log(`   📄 sitemap-categories.xml - ${categoriesEntries.length} URLs`);
  console.log(`   📄 sitemap-products.xml - ${productsEntries.length} URLs`);
  console.log(`   🤖 robots.txt actualizado`);
}

// Ejecutar
createSitemaps();
