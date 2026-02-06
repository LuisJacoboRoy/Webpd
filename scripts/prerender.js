/**
 * SSG Prerendering Script
 * Genera páginas estáticas HTML con SEO completo para todos los productos
 * Ejecutar: node scripts/prerender.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar datos de productos y funciones SEO
import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products.js';
import {
  generateProductSEOData,
  generateCategorySEOData,
  generateDynamicSitemap,
  generateRobotsTxt,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  exportAllProductsSEO
} from '../utils/seoPrerender.js';

const DOMAIN = 'https://pinturasdiamante.com';
const OUTPUT_DIR = path.join(__dirname, '../prerendered');

/**
 * Crear directorio si no existe
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generar HTML base con meta tags SEO
 */
function generateProductHTML(productId, seoData) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !seoData) return null;

  const structuredDataJSON = JSON.stringify(seoData.structuredData);
  const openGraphJSON = JSON.stringify(seoData.openGraphTags);
  const twitterJSON = JSON.stringify(seoData.twitterCard);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  
  <!-- SEO Títulos y Descripciones -->
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}">
  <meta name="keywords" content="${product.tag || 'pintura'}, ${product.name}, oaxaca, pinturas diamante">
  <meta name="author" content="Pinturas Diamante">
  <meta name="theme-color" content="#3b82f6">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${seoData.canonical}">
  
  <!-- Preconexiones para performance -->
  <link rel="preconnect" href="${DOMAIN}">
  <link rel="dns-prefetch" href="${DOMAIN}">
  
  <!-- Favicons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  
  <!-- Open Graph Tags (Facebook, LinkedIn, etc) -->
  <meta property="og:type" content="${seoData.openGraphTags['og:type']}">
  <meta property="og:url" content="${seoData.openGraphTags['og:url']}">
  <meta property="og:title" content="${seoData.openGraphTags['og:title']}">
  <meta property="og:description" content="${seoData.openGraphTags['og:description']}">
  <meta property="og:image" content="${seoData.openGraphTags['og:image']}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${seoData.openGraphTags['og:site_name']}">
  <meta property="og:locale" content="${seoData.openGraphTags['og:locale']}">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="${seoData.twitterCard['twitter:card']}">
  <meta name="twitter:title" content="${seoData.twitterCard['twitter:title']}">
  <meta name="twitter:description" content="${seoData.twitterCard['twitter:description']}">
  <meta name="twitter:image" content="${seoData.twitterCard['twitter:image']}">
  <meta name="twitter:creator" content="${seoData.twitterCard['twitter:creator']}">
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
${JSON.stringify(seoData.structuredData, null, 2)}
  </script>
  
  <!-- Sitemap Reference -->
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
  
  <!-- Robots Meta Tags -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  
  <!-- Google Search Console Verification (reemplazar con tu token) -->
  <!-- <meta name="google-site-verification" content="TU_TOKEN_AQUI"> -->
  
  <!-- Performance & Security -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Preload críticos -->
  <link rel="preload" as="style" href="/index.css">
  <link rel="preload" as="script" href="/index.tsx">
  
  <!-- Stylesheet -->
  <style>
    [data-v-app] { display: none; }
  </style>
</head>
<body>
  <div id="app" data-v-app></div>
  
  <!-- Script de redirección a SPA -->
  <script>
    // Redirigir a la aplicación React con hash routing
    const productId = '${productId}';
    window.location.replace('/#/product/' + productId);
  </script>
  
  <!-- Script principal de la aplicación -->
  <script type="module" src="/index.tsx"></script>
</body>
</html>`;
}

/**
 * Generar HTML para categoría
 */
function generateCategoryHTML(categoryId, seoData) {
  if (!seoData) return null;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}">
  <link rel="canonical" href="${seoData.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${seoData.canonical}">
  <meta property="og:title" content="${seoData.title}">
  <meta property="og:description" content="${seoData.description}">
  <meta property="og:image" content="${seoData.ogImage}">
  <script type="application/ld+json">
${JSON.stringify(seoData.structuredData, null, 2)}
  </script>
</head>
<body>
  <div id="app" data-v-app></div>
  <script>
    window.location.replace('/#/catalog/${categoryId}');
  </script>
  <script type="module" src="/index.tsx"></script>
</body>
</html>`;
}

/**
 * Renderizar todos los productos
 */
function prerenderProducts() {
  console.log('🔨 Iniciando prerendering de productos...\n');
  
  const seoDataList = exportAllProductsSEO();
  let successCount = 0;
  let errorCount = 0;

  seoDataList.forEach(({ id, seoData, product }) => {
    try {
      const html = generateProductHTML(id, seoData);
      if (html) {
        const outputPath = path.join(OUTPUT_DIR, `product-${id}.html`);
        fs.writeFileSync(outputPath, html);
        successCount++;
        console.log(`✅ Generado: product-${id}.html`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error en ${id}:`, error.message);
    }
  });

  console.log(`\n✨ Productos prerenderizados: ${successCount}/${PRODUCTS.length}`);
  if (errorCount > 0) console.warn(`⚠️ Errores: ${errorCount}`);
}

/**
 * Renderizar categorías
 */
function prerenderCategories() {
  console.log('\n🔨 Iniciando prerendering de categorías...\n');
  
  let successCount = 0;

  CATEGORIES.forEach(category => {
    try {
      const seoData = generateCategorySEOData(category.id);
      const html = generateCategoryHTML(category.id, seoData);
      if (html) {
        const outputPath = path.join(OUTPUT_DIR, `category-${category.id}.html`);
        fs.writeFileSync(outputPath, html);
        successCount++;
        console.log(`✅ Generado: category-${category.id}.html`);
      }
    } catch (error) {
      console.error(`❌ Error en ${category.id}:`, error.message);
    }
  });

  console.log(`\n✨ Categorías prerenderizadas: ${successCount}/${CATEGORIES.length}`);
}

/**
 * Generar sitemap dinámico
 */
function generateSitemap() {
  console.log('\n🗺️  Generando sitemap dinámico...');
  
  try {
    const sitemap = generateDynamicSitemap();
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    console.log('✅ Sitemap generado: public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generando sitemap:', error.message);
  }
}

/**
 * Generar robots.txt
 */
function generateRobots() {
  console.log('\n🤖 Generando robots.txt...');
  
  try {
    const robots = generateRobotsTxt();
    const outputPath = path.join(__dirname, '../public/robots.txt');
    fs.writeFileSync(outputPath, robots);
    console.log('✅ robots.txt generado: public/robots.txt');
  } catch (error) {
    console.error('❌ Error generando robots.txt:', error.message);
  }
}

/**
 * Generar Schema.org indexado
 */
function generateSchemaIndex() {
  console.log('\n📋 Generando índice de schemas...');
  
  try {
    const index = {
      organization: generateOrganizationSchema(),
      localBusiness: generateLocalBusinessSchema(),
      generatedAt: new Date().toISOString(),
      productCount: PRODUCTS.length,
      categoryCount: CATEGORIES.length,
      subCategoryCount: SUB_CATEGORIES.length
    };

    const outputPath = path.join(OUTPUT_DIR, 'schema-index.json');
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
    console.log('✅ Índice de schemas generado');
  } catch (error) {
    console.error('❌ Error generando índice de schemas:', error.message);
  }
}

/**
 * Ejecutar prerendering completo
 */
function runPrerender() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🚀 SEO Prerendering System - Static Site Generation');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Crear directorio de salida
  ensureDir(OUTPUT_DIR);

  // Ejecutar tareas
  prerenderProducts();
  prerenderCategories();
  generateSitemap();
  generateRobots();
  generateSchemaIndex();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ Prerendering completado exitosamente!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📁 Archivos generados:');
  console.log(`   • ${PRODUCTS.length} páginas de productos`);
  console.log(`   • ${CATEGORIES.length} páginas de categorías`);
  console.log('   • sitemap.xml (dinámico)');
  console.log('   • robots.txt (optimizado)');
  console.log('   • schema-index.json\n');

  console.log('📍 Ubicaciones:');
  console.log(`   • Prerendered HTML: ${OUTPUT_DIR}`);
  console.log('   • Sitemaps & Robots: public/\n');

  console.log('🔍 Próximos pasos:');
  console.log('   1. Enviar sitemap.xml a Google Search Console');
  console.log('   2. Enviar sitemap.xml a Bing Webmaster Tools');
  console.log('   3. Validar robots.txt en Search Console');
  console.log('   4. Implementar server-side rendering (opcional)\n');
}

// Ejecutar si se llama directamente
runPrerender();
