import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUSINESS_INFO,
  BUSINESS_LOCATIONS,
  SEO_DESCRIPTIONS,
  SEO_KEYWORDS
} from '../data/seo.ts';
import { CATEGORIES, PRODUCTS, SUB_CATEGORIES } from '../data/products.ts';
import { CATALOG_PATH, categoryPath, findProductBySlug, productPath } from '../utils/routes.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(scriptDirectory, '../dist');
const domain = BUSINESS_INFO.url.replace(/\/$/, '');
const pageUrl = route => `${domain}${route === '/' ? '/' : `${route}/`}`;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function absoluteUrl(value) {
  if (!value) return BUSINESS_INFO.logo;
  return value.startsWith('http') ? value : `${domain}${value.startsWith('/') ? '' : '/'}${value}`;
}

function availableImages(values) {
  return [...new Set(values.filter(Boolean))].filter(value => {
    if (/^https?:\/\//i.test(value)) return true;
    return fs.existsSync(path.join(
      scriptDirectory,
      '../public',
      value.replace(/^\/+/, '')
    ));
  });
}

function imageSchema(value, name, description) {
  return {
    '@type': 'ImageObject',
    contentUrl: absoluteUrl(value),
    name,
    description,
    creator: { '@id': `${domain}/#organization` },
    creditText: 'Diamante Pinturas',
    copyrightHolder: { '@id': `${domain}/#organization` },
    copyrightNotice: '© Diamante Pinturas'
  };
}

function jsonForHtml(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function getBusinessSchemas() {
  const organizationId = `${domain}/#organization`;
  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: BUSINESS_INFO.name,
    brand: { '@type': 'Brand', '@id': `${domain}/#brand`, name: 'Diamante Pinturas' },
    description: BUSINESS_INFO.description,
    url: pageUrl('/'),
    logo: imageSchema(BUSINESS_INFO.logo, 'Logotipo de Diamante Pinturas', BUSINESS_INFO.description),
    email: BUSINESS_INFO.email,
    telephone: BUSINESS_INFO.phone,
    sameAs: BUSINESS_INFO.sameAs,
    location: BUSINESS_LOCATIONS.map(location => ({
      '@id': `${domain}/#business-${location.id}`
    }))
  };

  const localBusinesses = BUSINESS_LOCATIONS.map(location => ({
    '@type': 'LocalBusiness',
    '@id': `${domain}/#business-${location.id}`,
    name: location.name,
    description: `${BUSINESS_INFO.name} - ${location.name}`,
    url: pageUrl('/'),
    image: imageSchema(BUSINESS_INFO.logo, 'Logotipo de Diamante Pinturas', BUSINESS_INFO.description),
    brand: { '@type': 'Brand', name: 'Diamante Pinturas' },
    telephone: location.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: 'Oaxaca',
      postalCode: location.postalCode,
      addressCountry: 'MX'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude
    },
    areaServed: {
      '@type': 'City',
      name: location.city
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: location.id === 'culturas-xoxo' ? '18:00' : '18:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:30',
        closes: '16:30'
      }
    ]
  }));

  const website = {
    '@type': 'WebSite',
    '@id': `${domain}/#website`,
    url: pageUrl('/'),
    name: BUSINESS_INFO.name,
    publisher: { '@id': organizationId },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${domain}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return [organization, ...localBusinesses, website];
}

function breadcrumbSchema(route, label, category, subCategory, product) {
  const items = [{ name: 'Inicio', url: pageUrl('/') }];
  if (route === '/catalogo' || route.startsWith('/categoria/') || route.startsWith('/producto/')) {
    items.push({ name: 'Catálogo', url: pageUrl(CATALOG_PATH) });
  }
  if (category) items.push({ name: category.name, url: pageUrl(categoryPath(category.id)) });
  if (subCategory) items.push({
    name: subCategory.name,
    url: pageUrl(categoryPath(category.id, subCategory.id))
  });
  if (product) items.push({ name: product.name, url: pageUrl(productPath(product)) });
  else if (route === '/contact') items.push({ name: label, url: pageUrl(route) });

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

function pageData(route) {
  if (route === '/') {
    const description = 'Pinturas Diamante en Oaxaca: soluciones automotrices, para madera y decorativas. Visita nuestras sucursales y encuentra opciones para tu proyecto.';
    return {
      title: 'Pinturas Diamante Oaxaca | Pinturas y Recubrimientos',
      description,
      keywords: SEO_KEYWORDS.home.join(', '),
      image: BUSINESS_INFO.logo,
      schemas: [{
        '@type': 'WebPage',
        '@id': `${domain}/#home`,
        name: 'Pinturas Diamante Oaxaca',
        url: pageUrl('/'),
        description,
        primaryImageOfPage: imageSchema(
          '/img/heads/head.jpg',
          'Pinturas Diamante',
          description
        ),
        inLanguage: 'es-MX'
      }, breadcrumbSchema(route, 'Inicio')]
    };
  }

  if (route === '/catalogo') {
    return {
      title: 'Catálogo de Pinturas | Diamante Oaxaca',
      description: 'Explora nuestro catálogo de pinturas especializadas: automotriz, maderas y decorativo. Soluciones de pintura de alta gama.',
      keywords: SEO_KEYWORDS.catalog.join(', '),
      image: BUSINESS_INFO.logo,
      schemas: [
        {
          '@type': 'CollectionPage',
          name: 'Catálogo de Pinturas',
          url: pageUrl(route),
          image: CATEGORIES.map(category =>
            imageSchema(category.ogImage || category.image, category.name, category.description)
          ),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: CATEGORIES.map((category, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: category.name,
              url: pageUrl(categoryPath(category.id))
            }))
          }
        },
        breadcrumbSchema(route, 'Catálogo')
      ]
    };
  }

  if (route === '/contact') {
    return {
      title: 'Nuestras Sucursales | Contacto | Diamante Oaxaca',
      description: 'Sucursales en Oaxaca con 8-10 km de cobertura de servicio. Ferrocarril y Las Culturas. Consulta horarios y ubicaciones.',
      keywords: 'contacto, ubicación, Oaxaca, sucursales, pinturas',
      image: BUSINESS_INFO.logo,
      schemas: [{
        '@type': 'ContactPage',
        name: 'Nuestras Sucursales',
        url: pageUrl(route),
        description: 'Visítanos en cualquiera de nuestras sucursales en Oaxaca.'
      }, breadcrumbSchema(route, 'Contacto')]
    };
  }

  if (route === '/search') {
    return {
      title: 'Buscar productos | Pinturas Diamante',
      description: 'Busca productos de pintura automotriz, para madera y decorativa en Pinturas Diamante.',
      keywords: 'buscar productos, pinturas, Oaxaca',
      image: BUSINESS_INFO.logo,
      noIndex: true,
      schemas: [{
        '@type': 'WebPage',
        name: 'Buscar productos',
        url: pageUrl(route),
        description: 'Búsqueda de productos de Pinturas Diamante.'
      }]
    };
  }

  const productMatch = route.match(/^\/producto\/([^/]+)$/);
  if (productMatch) {
    const product = findProductBySlug(productMatch[1]);
    if (!product) return null;
    const category = CATEGORIES.find(item => item.id === product.categoryId);
    const subCategory = SUB_CATEGORIES.find(item => item.id === product.subCategoryId);
    const title = product.ogTitle || `${product.name} - Diamante Oaxaca`;
    const description = product.ogDescription || product.description.slice(0, 160);
    const productUrl = pageUrl(route);

    return {
      title,
      description,
      keywords: [product.tag, product.name, subCategory?.name, category?.name, 'Oaxaca'].filter(Boolean).join(', '),
      image: availableImages([product.ogImage, product.image])[0] || BUSINESS_INFO.logo,
      noscriptContent: `<main><article><h1>${escapeHtml(product.name)}</h1><p>${escapeHtml(product.description)}</p>${availableImages([product.image, product.ogImage]).map(image => `<figure><img src="${escapeHtml(image)}" alt="${escapeHtml(`${product.name} | Diamante Pinturas`)}" title="${escapeHtml(product.name)}" /><figcaption>© Diamante Pinturas</figcaption></figure>`).join('')}</article></main>`,
      schemas: [
        {
          '@type': 'WebPage',
          '@id': `${productUrl}#webpage`,
          name: product.name,
          url: productUrl,
          description: product.description,
          primaryImageOfPage: imageSchema(
            availableImages([product.ogImage, product.image])[0],
            product.name,
            product.ogDescription || product.description
          ),
          mainEntity: {
            '@type': 'Thing',
            '@id': `${productUrl}#item`,
            name: product.name,
            url: productUrl,
            description: product.description,
            image: availableImages([product.ogImage, product.image])
              .map(value => imageSchema(value, product.name, product.ogDescription || product.description))
          }
        },
        breadcrumbSchema(route, product.name, category, subCategory, product)
      ]
    };
  }

  const categoryMatch = route.match(/^\/categoria\/([^/]+)$/);
  if (categoryMatch) {
    const category = CATEGORIES.find(item => item.id === categoryMatch[1]);
    if (!category) return null;
    const title = `${category.name} | Pinturas Diamante Oaxaca`;
    const description = SEO_DESCRIPTIONS[category.id] || category.description;
    const subCategories = SUB_CATEGORIES.filter(item => item.categoryId === category.id);

    return {
      title,
      description,
      keywords: (SEO_KEYWORDS[category.id] || []).join(', '),
      image: category.ogImage || category.image,
      schemas: [
        {
          '@type': 'CollectionPage',
          name: title,
          url: pageUrl(route),
          description,
          image: imageSchema(category.ogImage || category.image, category.name, category.description),
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: subCategories.map((subCategory, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: subCategory.name,
              url: pageUrl(categoryPath(category.id, subCategory.id))
            }))
          }
        },
        breadcrumbSchema(route, category.name, category)
      ]
    };
  }

  const subCategoryMatch = route.match(/^\/categoria\/([^/]+)\/([^/]+)$/);
  if (subCategoryMatch) {
    const category = CATEGORIES.find(item => item.id === subCategoryMatch[1]);
    const subCategory = SUB_CATEGORIES.find(item =>
      item.categoryId === subCategoryMatch[1] && item.id === subCategoryMatch[2]
    );
    if (!category || !subCategory) return null;
    const products = PRODUCTS.filter(item => item.subCategoryId === subCategory.id);
    const title = `${subCategory.name} | ${category.name} | Diamante`;
    const description = `Explora nuestra línea de ${subCategory.name.toLowerCase()} ${category.name.toLowerCase()}. ${products.length} productos disponibles.`;

    return {
      title,
      description,
      keywords: `${subCategory.name}, ${category.name}, pinturas, Oaxaca`,
      image: category.ogImage || category.image,
      schemas: [
        {
          '@type': 'CollectionPage',
          name: title,
          url: pageUrl(route),
          description,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Thing',
                name: product.name,
                url: pageUrl(productPath(product)),
                image: imageSchema(
                  product.ogImage || product.image,
                  product.name,
                  product.ogDescription || product.description
                ),
                description: product.description.slice(0, 160)
              }
            }))
          }
        },
        breadcrumbSchema(route, subCategory.name, category, subCategory)
      ]
    };
  }

  return null;
}

function setMeta(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selector = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=\\s*["']${escapedName}["'])[^>]*>`, 'gi');
  const tag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
  return html.replace(selector, '').replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function setTitle(html, title) {
  const escapedTitle = escapeHtml(title);
  return /<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
    : html.replace(/<\/head>/i, `  <title>${escapedTitle}</title>\n</head>`);
}

function renderPage(template, route, data) {
  const schemaGraph = [...getBusinessSchemas(), ...data.schemas];

  let html = template
    .replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']static-seo-route["'][^>]*>/gi, '');

  html = setTitle(html, data.title);
  const metas = {
    description: data.description,
    keywords: data.keywords,
    robots: data.noIndex ? 'noindex, follow' : 'index, follow',
    'og:type': route.startsWith('/producto/') ? 'product' : 'website',
    'og:url': pageUrl(route),
    'og:title': data.title,
    'og:description': data.description,
    'og:image': absoluteUrl(data.image),
    'og:image:alt': data.title,
    'og:site_name': BUSINESS_INFO.name,
    'og:locale': 'es_MX',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': absoluteUrl(data.image),
    'twitter:image:alt': data.title
  };

  for (const [name, content] of Object.entries(metas)) {
    html = setMeta(html, name.startsWith('og:') ? 'property' : 'name', name, content);
  }
  html = html.replace(/<\/head>/i, [
    `  <link rel="canonical" href="${escapeHtml(pageUrl(route))}">`,
    `  <meta name="static-seo-route" content="${escapeHtml(route)}">`,
    `  <script type="application/ld+json" data-static-seo="true">${jsonForHtml({
      '@context': 'https://schema.org',
      '@graph': schemaGraph
    })}</script>`,
    '</head>'
  ].join('\n'));
  if (data.noscriptContent) {
    html = html.replace(/<\/body>/i, `  <noscript>${data.noscriptContent}</noscript>\n</body>`);
  }
  return html;
}

function writeStaticPage(route, template) {
  const data = pageData(route);
  if (!data) throw new Error(`No hay datos SEO para la ruta ${route}`);
  const relativePath = route === '/' ? 'index.html' : path.join(route.slice(1), 'index.html');
  const outputPath = path.join(distDirectory, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, renderPage(template, route, data));
}

if (!fs.existsSync(path.join(distDirectory, 'index.html'))) {
  throw new Error('No existe dist/index.html. Ejecuta vite build antes del prerender.');
}

const template = fs.readFileSync(path.join(distDirectory, 'index.html'), 'utf8');
const routes = [
  '/',
  CATALOG_PATH.slice(0, -1),
  '/contact',
  '/search',
  ...CATEGORIES.map(category => categoryPath(category.id).slice(0, -1)),
  ...SUB_CATEGORIES.map(item => categoryPath(item.categoryId, item.id).slice(0, -1)),
  ...PRODUCTS.map(product => productPath(product).slice(0, -1))
];

for (const route of routes) writeStaticPage(route, template);
console.log(`SEO estático generado para ${routes.length} rutas en dist/.`);
