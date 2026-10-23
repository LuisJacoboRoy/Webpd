import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://pinturasdiamante.com';
const PUBLIC_DIR = path.join(__dirname, '../public');

interface SitemapEntry {
  loc: string;
  schema?: string;
}

// Función para generar XML del sitemap
function generateSitemapXML(entries: SitemapEntry[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

// Función para generar sitemap índice
function generateSitemapIndex(sitemaps: Array<{ loc: string }>): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  return xml;
}

// 1. SITEMAP DE PÁGINAS ESTÁTICAS
function generatePagesSitemap(): SitemapEntry[] {
  const pages: SitemapEntry[] = [
    {
      loc: `${BASE_URL}/`,
      schema: 'Organization'
    },
    {
      loc: `${BASE_URL}/contact/`,
      schema: 'ContactPage'
    },
    {
      loc: `${BASE_URL}/catalog/`,
      schema: 'CollectionPage'
    }
  ];

  return pages;
}

// 2. SITEMAP DE CATEGORÍAS Y SUBCATEGORÍAS
function generateCategoriesSitemap(): SitemapEntry[] {
  const categories: SitemapEntry[] = [];

  // Categorías principales
  CATEGORIES.forEach(category => {
    categories.push({
      loc: `${BASE_URL}/catalog/${category.id}/`,
      schema: 'Category'
    });
  });

  // Subcategorías
  SUB_CATEGORIES.forEach(subCategory => {
    categories.push({
      loc: `${BASE_URL}/catalog/${subCategory.categoryId}/${subCategory.id}/`,
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
      loc: `${BASE_URL}/product/${product.id}/`,
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
    { loc: `${BASE_URL}/sitemap-pages.xml` },
    { loc: `${BASE_URL}/sitemap-categories.xml` },
    { loc: `${BASE_URL}/sitemap-products.xml` }
  ]);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndex);

  // Generar un robots.txt mejorado
  const robotsTxt = `# Reglas de rastreo para Pinturas Diamante
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Sitemaps con URLs públicas y canónicas
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-products.xml
Sitemap: ${BASE_URL}/sitemap-categories.xml
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
