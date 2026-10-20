import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, PRODUCTS, SUB_CATEGORIES } from '../data/products.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(scriptDirectory, '../dist');
const routes = [
  '/',
  '/catalog',
  '/contact',
  '/search',
  ...CATEGORIES.map(category => `/catalog/${category.id}`),
  ...SUB_CATEGORIES.map(item => `/catalog/${item.categoryId}/${item.id}`),
  ...PRODUCTS.map(product => `/product/${product.id}`)
];

function fail(message) {
  console.error(`SEO estático inválido: ${message}`);
  process.exitCode = 1;
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
  const jsonLdScripts = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];

  if (!title?.[1].trim()) fail(`${route}: falta título`);
  if (!description?.[1].trim()) fail(`${route}: falta descripción`);
  if (routeMarker?.[1] !== route) fail(`${route}: falta o no coincide el marcador de ruta`);
  if (!canonical?.[1]) fail(`${route}: falta canonical`);
  if (jsonLdScripts.length !== 1) {
    fail(`${route}: se esperaba un bloque JSON-LD, se encontraron ${jsonLdScripts.length}`);
    continue;
  }

  try {
    const schema = JSON.parse(jsonLdScripts[0][1]);
    const types = schema['@graph']?.map(item => item['@type']) || [];
    if (schema['@context'] !== 'https://schema.org') fail(`${route}: contexto Schema.org ausente`);
    if (!types.includes('Organization') || !types.includes('WebSite')) {
      fail(`${route}: faltan los schemas globales Organization/WebSite`);
    }
    if (route.startsWith('/product/') && !types.includes('Product')) {
      fail(`${route}: falta el schema Product`);
    }
    if ((route === '/catalog' || route.startsWith('/catalog/')) && !types.includes('CollectionPage')) {
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

if (!process.exitCode) {
  console.log(`SEO estático validado: ${routes.length} rutas con metadatos y JSON-LD parseable.`);
}
