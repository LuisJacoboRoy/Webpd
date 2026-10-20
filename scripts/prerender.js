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

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(scriptDirectory, '../dist');
const domain = BUSINESS_INFO.url.replace(/\/$/, '');

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
    description: BUSINESS_INFO.description,
    url: domain,
    logo: absoluteUrl(BUSINESS_INFO.logo),
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
    url: domain,
    image: absoluteUrl(BUSINESS_INFO.logo),
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
    url: domain,
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
  const items = [{ name: 'Inicio', url: `${domain}/` }];
  if (route === '/catalog' || route.startsWith('/catalog/') || route.startsWith('/product/')) {
    items.push({ name: 'Catálogo', url: `${domain}/catalog` });
  }
  if (category) items.push({ name: category.name, url: `${domain}/catalog/${category.id}` });
  if (subCategory) items.push({
    name: subCategory.name,
    url: `${domain}/catalog/${category.id}/${subCategory.id}`
  });
  if (product) items.push({ name: product.name, url: `${domain}/product/${product.id}` });
  else if (route === '/contact') items.push({ name: label, url: `${domain}${route}` });

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
    const description = '30 años de experiencia en pinturas de calidad premium. Soluciones automotriz, maderas y decorativo. Presencia en Oaxaca, Puebla, Veracruz y más.';
    return {
      title: 'Pinturas Diamante | Líderes en Recubrimientos Mexicanos',
      description,
      keywords: SEO_KEYWORDS.home.join(', '),
      image: BUSINESS_INFO.logo,
      schemas: [{
        '@type': 'WebPage',
        '@id': `${domain}/#home`,
        name: 'Pinturas Diamante Oaxaca',
        url: `${domain}/`,
        description,
        inLanguage: 'es-MX'
      }, breadcrumbSchema(route, 'Inicio')]
    };
  }

  if (route === '/catalog') {
    return {
      title: 'Catálogo de Pinturas | Diamante Oaxaca',
      description: 'Explora nuestro catálogo de pinturas especializadas: automotriz, maderas y decorativo. Soluciones de pintura de alta gama.',
      keywords: SEO_KEYWORDS.catalog.join(', '),
      image: BUSINESS_INFO.logo,
      schemas: [
        {
          '@type': 'CollectionPage',
          name: 'Catálogo de Pinturas',
          url: `${domain}${route}`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: CATEGORIES.map((category, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: category.name,
              url: `${domain}/catalog/${category.id}`
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
        url: `${domain}${route}`,
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
        url: `${domain}${route}`,
        description: 'Búsqueda de productos de Pinturas Diamante.'
      }]
    };
  }

  const productMatch = route.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    const product = PRODUCTS.find(item => item.id === productMatch[1]);
    if (!product) return null;
    const category = CATEGORIES.find(item => item.id === product.categoryId);
    const subCategory = SUB_CATEGORIES.find(item => item.id === product.subCategoryId);
    const title = product.ogTitle || `${product.name} - Diamante Oaxaca`;
    const description = product.ogDescription || product.description.slice(0, 160);
    const productUrl = `${domain}${route}`;

    return {
      title,
      description,
      keywords: [product.tag, product.name, subCategory?.name, category?.name, 'Oaxaca'].filter(Boolean).join(', '),
      image: product.ogImage || product.image,
      schemas: [
        {
          '@type': 'Product',
          '@id': `${productUrl}#product`,
          name: product.name,
          url: productUrl,
          description: product.description,
          image: [product.ogImage, product.image].filter(Boolean).map(absoluteUrl),
          sku: product.id,
          brand: { '@type': 'Brand', name: BUSINESS_INFO.name },
          category: subCategory?.name || category?.name || product.tag
        },
        breadcrumbSchema(route, product.name, category, subCategory, product)
      ]
    };
  }

  const categoryMatch = route.match(/^\/catalog\/([^/]+)$/);
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
          url: `${domain}${route}`,
          description,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: subCategories.map((subCategory, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: subCategory.name,
              url: `${domain}/catalog/${category.id}/${subCategory.id}`
            }))
          }
        },
        breadcrumbSchema(route, category.name, category)
      ]
    };
  }

  const subCategoryMatch = route.match(/^\/catalog\/([^/]+)\/([^/]+)$/);
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
          url: `${domain}${route}`,
          description,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: product.name,
                url: `${domain}/product/${product.id}`,
                image: absoluteUrl(product.ogImage || product.image),
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
  let html = template
    .replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi, '')
    .replace(/<meta\b[^>]*name=["']static-seo-route["'][^>]*>/gi, '');

  html = setTitle(html, data.title);
  const metas = {
    description: data.description,
    keywords: data.keywords,
    robots: data.noIndex ? 'noindex, follow' : 'index, follow',
    'og:type': route.startsWith('/product/') ? 'product' : 'website',
    'og:url': `${domain}${route === '/' ? '/' : route}`,
    'og:title': data.title,
    'og:description': data.description,
    'og:image': absoluteUrl(data.image),
    'og:site_name': BUSINESS_INFO.name,
    'og:locale': 'es_MX',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': absoluteUrl(data.image)
  };

  for (const [name, content] of Object.entries(metas)) {
    html = setMeta(html, name.startsWith('og:') ? 'property' : 'name', name, content);
  }
  html = html.replace(/<\/head>/i, [
    `  <link rel="canonical" href="${escapeHtml(`${domain}${route === '/' ? '/' : route}`)}">`,
    `  <meta name="static-seo-route" content="${escapeHtml(route)}">`,
    `  <script type="application/ld+json" data-static-seo="true">${jsonForHtml({
      '@context': 'https://schema.org',
      '@graph': [...getBusinessSchemas(), ...data.schemas]
    })}</script>`,
    '</head>'
  ].join('\n'));
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
  '/catalog',
  '/contact',
  '/search',
  ...CATEGORIES.map(category => `/catalog/${category.id}`),
  ...SUB_CATEGORIES.map(item => `/catalog/${item.categoryId}/${item.id}`),
  ...PRODUCTS.map(product => `/product/${product.id}`)
];

for (const route of routes) writeStaticPage(route, template);
console.log(`SEO estático generado para ${routes.length} rutas en dist/.`);
