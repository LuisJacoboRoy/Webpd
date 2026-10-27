import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, PRODUCTS, SUB_CATEGORIES } from '../data/products.ts';
import IMAGE_LICENSING from '../data/image-licensing.json';
import { CATALOG_PATH, categoryPath, findProductBySlug, productPath } from '../utils/routes.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(scriptDirectory, '../dist');
const routes = [
  '/',
  CATALOG_PATH.slice(0, -1),
  '/contact',
  '/search',
  ...CATEGORIES.map(category => categoryPath(category.id).slice(0, -1)),
  ...SUB_CATEGORIES.map(item => categoryPath(item.categoryId, item.id).slice(0, -1)),
  ...PRODUCTS.map(product => productPath(product).slice(0, -1))
];
const domain = 'https://pinturasdiamante.com';

function fail(message) {
  console.error(`SEO estático inválido: ${message}`);
  process.exitCode = 1;
}

function containsType(value, type) {
  if (!value || typeof value !== 'object') return false;
  if (value['@type'] === type) return true;
  return Object.values(value).some(child =>
    Array.isArray(child)
      ? child.some(item => containsType(item, type))
      : containsType(child, type)
  );
}

function hasAvailableProductImage(product) {
  return [product.image, product.ogImage].filter(Boolean).some(image => {
    if (/^https?:\/\//i.test(image)) return true;
    return fs.existsSync(path.join(
      scriptDirectory,
      '../public',
      image.replace(/^\/+/, '')
    ));
  });
}

for (const route of routes) {
  const relativePath = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
  const filePath = path.join(distDirectory, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`falta HTML para ${route}`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const routeMarker = html.match(/<meta\b[^>]*name=["']static-seo-route["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description = html.match(/<meta\b(?=[^>]*name=["']description["'])[^>]*content=["']([^"']+)["'][^>]*>/i);
  const canonical = html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["'][^>]*>/i);
  const robots = html.match(/<meta\b(?=[^>]*name=["']robots["'])[^>]*content=["']([^"']+)["'][^>]*>/i);
  const jsonLdScripts = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  const expectedCanonical = `${domain}${route === '/' ? '/' : `${route}/`}`;

  if (!title?.[1].trim()) fail(`${route}: falta título`);
  if (!description?.[1].trim()) fail(`${route}: falta descripción`);
  if (routeMarker?.[1] !== route) fail(`${route}: falta o no coincide el marcador de ruta`);
  if (canonical?.[1] !== expectedCanonical) {
    fail(`${route}: canonical esperado ${expectedCanonical}, encontrado ${canonical?.[1] || 'ninguno'}`);
  }
  if (route === '/search' && !robots?.[1].toLowerCase().includes('noindex')) {
    fail(`${route}: debe conservar noindex`);
  }
  if (route !== '/search' && robots?.[1].toLowerCase().includes('noindex')) {
    fail(`${route}: una página pública está marcada noindex`);
  }
  if (jsonLdScripts.length !== 1) {
    fail(`${route}: se esperaba un bloque JSON-LD, se encontraron ${jsonLdScripts.length}`);
    continue;
  }

  try {
    const schema = JSON.parse(jsonLdScripts[0][1]);
    const graph = schema['@graph'] || [];
    const types = graph.map(item => item['@type']);
    if (schema['@context'] !== 'https://schema.org') fail(`${route}: contexto Schema.org ausente`);
    if (!types.includes('Organization') || !types.includes('WebSite')) {
      fail(`${route}: faltan los schemas globales Organization/WebSite`);
    }
    if (!containsType(schema, 'Brand') ||
        !JSON.stringify(schema).includes('"name":"Diamante Pinturas"')) {
      fail(`${route}: falta la marca Diamante Pinturas`);
    }
    if (containsType(schema, 'Product')) {
      fail(`${route}: contiene Product sin datos de oferta o reseñas verificables`);
    }
    if (route.startsWith('/producto/') && !types.includes('WebPage')) {
      fail(`${route}: falta el schema WebPage`);
    }
    if (route.startsWith('/producto/') && !containsType(schema, 'Thing')) {
      fail(`${route}: falta la descripción estructurada del elemento del catálogo`);
    }
    if (route.startsWith('/producto/')) {
      const product = findProductBySlug(route.slice('/producto/'.length));
      const article = graph.find(item => item['@type'] === 'Article');
      if (!article) fail(`${route}: falta el schema Article`);
      if (product && hasAvailableProductImage(product)) {
        const images = Array.isArray(article?.image) ? article.image : [article?.image];
        if (!images.some(image =>
          image?.['@type'] === 'ImageObject' &&
          image.license === IMAGE_LICENSING.license &&
          image.acquireLicensePage === IMAGE_LICENSING.acquireLicensePage &&
          image.copyrightNotice === '© Diamante Pinturas'
        )) {
          fail(`${route}: faltan metadatos de licencia y atribución en la imagen`);
        }
      } else if (article?.image) {
        fail(`${route}: asigna una imagen al schema Article sin una imagen de producto disponible`);
      }
      if (!html.includes('og:image:alt') || !html.includes('twitter:image:alt')) {
        fail(`${route}: faltan metadatos alt para la imagen de compartir`);
      }
      const noscript = html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] || '';
      if (!product || !noscript.includes('<h1>') || !noscript.includes(product.name) || !noscript.includes('<p>')) {
        fail(`${route}: falta texto accesible en el HTML prerenderizado`);
      }
      if (product && hasAvailableProductImage(product) && !noscript.includes('<img ')) {
        fail(`${route}: falta la imagen disponible en el HTML prerenderizado`);
      }
    }
    if ((route === '/catalogo' || route.startsWith('/categoria/')) && !types.includes('CollectionPage')) {
      fail(`${route}: falta el schema CollectionPage`);
    }
    if (route === '/contact' && !types.includes('ContactPage')) {
      fail(`${route}: falta el schema ContactPage`);
    }
    if (route === '/' && !types.includes('WebPage')) {
      fail(`${route}: falta el schema WebPage`);
    }
  } catch (error) {
    fail(`${route}: JSON-LD no parseable (${error.message})`);
  }
}

const sitemapPath = path.join(distDirectory, 'sitemap.xml');
const robotsPath = path.join(distDirectory, 'robots.txt');
if (!fs.existsSync(sitemapPath)) {
  fail('falta sitemap.xml en dist');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const expectedUrls = routes
    .filter(route => route !== '/search')
    .map(route => `${domain}${route === '/' ? '/' : `${route}/`}`);

  if (sitemapUrls.some(url => url.includes('#'))) fail('sitemap.xml contiene URLs con fragmentos');
  if (sitemapUrls.some(url => url !== `${domain}/` && !url.endsWith('/'))) {
    fail('sitemap.xml contiene URLs que no terminan en barra canónica');
  }
  if (sitemapUrls.length !== expectedUrls.length ||
      expectedUrls.some(url => !sitemapUrls.includes(url)) ||
      sitemapUrls.some(url => !expectedUrls.includes(url))) {
    fail('sitemap.xml no coincide exactamente con las páginas públicas prerenderizadas');
  }
}

if (!fs.existsSync(robotsPath)) {
  fail('falta robots.txt en dist');
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${domain}/sitemap.xml`)) {
    fail('robots.txt no referencia el sitemap principal');
  }
  if (!robots.includes(`Sitemap: ${domain}/sitemap-images.xml`)) {
    fail('robots.txt no referencia sitemap-images.xml');
  }
  if (/Sitemap:\s+\S+\.json\b/i.test(robots)) {
    fail('robots.txt referencia un archivo JSON como si fuera un sitemap');
  }
}

for (const [fileName, isExpectedUrl] of [
  ['sitemap-products.xml', url => url.startsWith(`${domain}/producto/`)],
  ['sitemap-categories.xml', url =>
    url === `${domain}/catalogo/` || url.startsWith(`${domain}/categoria/`)]
]) {
  const filePath = path.join(distDirectory, fileName);
  if (!fs.existsSync(filePath)) {
    fail(`falta ${fileName} en dist`);
    continue;
  }
  const sitemapUrls = [...fs.readFileSync(filePath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(match => match[1]);
  if (!sitemapUrls.length || sitemapUrls.some(url => !isExpectedUrl(url) || !url.endsWith('/'))) {
    fail(`${fileName} contiene URLs incorrectas o no canónicas`);
  }
}

const imageSitemapPath = path.join(distDirectory, 'sitemap-images.xml');
if (!fs.existsSync(imageSitemapPath)) {
  fail('falta sitemap-images.xml en dist');
} else {
  const imageSitemap = fs.readFileSync(imageSitemapPath, 'utf8');
  const imagePageEntries = [...imageSitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(match => match[1]);
  const productEntries = imagePageEntries.filter(entry =>
    entry.includes(`<loc>${domain}/producto/`)
  );
  const expectedProductImageUrls = PRODUCTS
    .filter(hasAvailableProductImage)
    .map(product => `${domain}${productPath(product)}`);
  if (!imageSitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
    fail('sitemap-images.xml no declara el namespace de Google Images');
  }
  if (productEntries.length !== expectedProductImageUrls.length ||
      expectedProductImageUrls.some(url =>
        !productEntries.some(entry => entry.includes(`<loc>${url}</loc>`) && entry.includes('<image:image>'))
      )) {
    fail('sitemap-images.xml no coincide con las fichas que tienen imágenes disponibles');
  }
  if (imagePageEntries.some(entry => !entry.includes('<image:title>') || !entry.includes('<image:caption>'))) {
    fail('sitemap-images.xml contiene imágenes sin título o descripción');
  }
}

if (!process.exitCode) {
  console.log(`SEO estático validado: ${routes.length} rutas con metadatos y JSON-LD parseable.`);
}
