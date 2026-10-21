# Reporte de alcance SEO e indexación

**Proyecto:** Pinturas Diamante (SPA con React 19, Vite y React Router)  
**Fecha de revisión:** 21 de octubre de 2026  
**Alcance solicitado:** archivos de SEO, datos estructurados, rutas del SPA, scripts npm y workflows de publicación; distinción entre código activo, material informativo y artefactos sin uso aparente.

## Resumen ejecutivo

El proyecto **sí genera HTML estático con metadatos SEO para las rutas principales** antes del deploy. El flujo de `npm run build` genera sitemaps, ejecuta Vite, produce páginas dentro de `dist/` y corre una verificación estática. El sitemap actual y sus metadatos reflejan 70 URLs públicas: inicio, catálogo, contacto, categorías, subcategorías y productos. La búsqueda se marca `noindex` y no se agrega al sitemap.

Eso ofrece una base de indexación mejor que una SPA que entrega únicamente un `index.html` genérico. Sin embargo, **no es un renderizado estático completo del contenido de todas las páginas**: el prerender actual inserta metadatos y JSON-LD, pero deja vacío el contenedor React en las páginas generadas. Solo las fichas de producto reciben contenido alternativo dentro de `<noscript>`. Además, hay configuraciones y workflows duplicados o heredados, y algunos archivos de documentación/verificación contradicen el flujo que realmente se ejecuta.

**Conclusión:** la configuración permite que Google descubra las URLs y reciba metadatos por ruta en el HTML inicial, pero no permite afirmar que el contenido de todas las rutas esté prerenderizado ni que un único workflow/plataforma controle siempre el sitio publicado. No se verificaron en vivo el dominio, Google Search Console, los headers efectivos ni el resultado de una ejecución de build durante esta revisión.

## 1. Flujo que participa en el sitio

### Arranque y rutas

- [index.html](./index.html) entrega el documento inicial y carga el punto de entrada `/index.tsx`.
- [index.tsx](./index.tsx) monta la aplicación con `ReactDOM.createRoot`; no usa `hydrateRoot`.
- [App.tsx](./App.tsx) configura React 19, `HelmetProvider`, `BrowserRouter` y las rutas `/`, `/contact`, `/search`, `/catalog`, categorías, subcategorías y productos.
- Las páginas principales se cargan con `React.lazy`; el contenido requiere JavaScript en el navegador.
- Los datos base de empresa y sucursales están en [data/seo.ts](./data/seo.ts), y el catálogo en [data/products.ts](./data/products.ts).

### Build y prerender

[package.json](./package.json) define este flujo:

1. `sitemap:generate` ejecuta `scripts/generate-sitemap.ts`.
2. `vite build` genera los archivos de producción.
3. `prerender` ejecuta `scripts/prerender.js`.
4. `seo:verify:static` ejecuta `scripts/verify-static-seo.js`.

Además, [vite.config.ts](./vite.config.ts) ejecuta otra vez `npm run sitemap:generate` desde el hook `buildStart`. Por tanto, el build normal genera los sitemaps **dos veces**.

[scripts/prerender.js](./scripts/prerender.js) crea archivos `dist/<ruta>/index.html` para inicio, catálogo, contacto, búsqueda, categorías, subcategorías y productos. Para cada ruta inserta título, descripción, robots, Open Graph, Twitter Cards, canonical y JSON-LD. La verificación estática [scripts/verify-static-seo.js](./scripts/verify-static-seo.js) comprueba la presencia de esas salidas y la correspondencia del sitemap con las rutas públicas.

## 2. Lo que está funcionando adecuadamente en el código

- **HTML inicial con SEO por ruta:** el prerender crea un archivo HTML de ruta con título, descripción, canonical, etiquetas sociales y JSON-LD, en vez de depender únicamente de cambios hechos después de arrancar React.
- **Canonical consistente en los HTML generados:** el prerender usa el dominio `https://pinturasdiamante.com` y URLs con barra final.
- **Rutas indexables contempladas:** el generador toma productos, categorías y subcategorías desde los datos del catálogo. El conteo de [public/sitemap-metadata.json](./public/sitemap-metadata.json) y el generador activo coinciden en 70 URLs públicas (3 páginas principales, 3 categorías, 18 subcategorías y 46 productos).
- **Búsqueda excluida intencionalmente:** `/search` recibe `noindex, follow` en el prerender y se excluye de los sitemaps. No se observó una regla que bloquee el rastreo de las demás páginas.
- **robots.txt y sitemaps presentes:** [public/robots.txt](./public/robots.txt) permite el rastreo general y declara el sitemap principal, los sitemaps de productos/categorías y el de imágenes.
- **Sitemap de imágenes separado:** [scripts/generate-sitemap.ts](./scripts/generate-sitemap.ts) genera `sitemap-images.xml` a partir de imágenes locales existentes y asocia las imágenes con páginas.
- **Datos estructurados preventivamente conservadores:** las fichas usan `WebPage` y `Thing`, no `Product` con ofertas/reseñas no verificadas. Esa decisión evita afirmar datos comerciales que no se encuentran en el catálogo.
- **Verificación de salida incorporada al build:** `seo:verify:static` hace comprobaciones de rutas, canonicals, noindex para búsqueda, JSON-LD parseable y sitemaps en `dist`.

Estos puntos se refieren al código y a los archivos existentes. No equivalen a confirmar que Google ya rastreó o indexó cada página.

## 3. Hallazgos e irregularidades

### Prioridad alta

#### 3.1 El contenido visible no está prerenderizado en la mayoría de las rutas

En `scripts/prerender.js`, `renderPage` copia la plantilla de Vite y añade metadatos/JSON-LD. La plantilla conserva un `<div id="root"></div>` vacío; el script solo añade contenido de `<noscript>` cuando `pageData` proporciona `noscriptContent`, y actualmente eso ocurre para las fichas de producto, no para inicio, catálogo, categorías, subcategorías ni contacto.

Por ello:

- Google puede recibir metadatos y datos estructurados por URL en el HTML inicial, pero necesita ejecutar React para obtener el contenido normal de esas páginas.
- Los rastreadores que no ejecutan JavaScript, incluidos algunos consumidores de previews sociales, reciben una página sin el contenido principal.
- El sitio no es SSR/SSG completo en cuanto al cuerpo de las páginas, aunque varias guías lo describan como páginas estáticas completas.

Referencias: [scripts/prerender.js](./scripts/prerender.js), [index.tsx](./index.tsx), [docs/SEO_PRERENDERING_GUIDE.md](./docs/SEO_PRERENDERING_GUIDE.md).

#### 3.2 Hay varios flujos de deploy que se solapan

Se encontraron tres workflows con publicación o intención de publicación:

- [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml) publica en GitHub Pages en `main`.
- [.github/workflows/deploy.yml](./.github/workflows/deploy.yml), pese a su nombre y a llamarse “Deploy to Vercel”, sube el artefacto con `upload-pages-artifact` y publica con `actions/deploy-pages`. También se activa en `main`, `master`, `production` y pull requests a `main`.
- [.github/workflows/deploy-vercel.yml](./.github/workflows/deploy-vercel.yml) publica en Vercel en `main` y genera previews para pull requests.

Así, un push a `main` puede iniciar dos publicaciones a GitHub Pages y otra a Vercel. El workflow `deploy.yml` también ejecuta el trabajo de deploy tras un pull request; `deploy-pages.yml` igualmente define el deploy sin condicionarlo a que el evento sea un `push`. Los workflows de Pages no establecen una sola estrategia de exclusión mutua entre ambos.

El repositorio tiene [CNAME](./CNAME) con `pinturasdiamante.com`, y la configuración de Vite normalmente usa `/` salvo que `GITHUB_PAGES=true`. Los workflows no establecen esa variable. Esto es compatible con servir el sitio desde un dominio personalizado en la raíz, pero no con asumir sin más que también funcionará en la URL de proyecto de GitHub Pages (`/<repo>/`). El repositorio no deja inequívoco cuál de las plataformas es la fuente de verdad para el dominio publicado.

#### 3.3 La política CSP impide cargar los scripts de analítica declarados

[index.html](./index.html) carga Google Analytics desde `www.googletagmanager.com` y Ahrefs desde `analytics.ahrefs.com`. La política `Content-Security-Policy` definida en ese mismo archivo restringe `script-src` a `'self'`, scripts inline, Tailwind CDN y `esm.sh`; no incluye ninguno de esos dos hosts. La misma política está replicada en [netlify.toml](./netlify.toml) y [public/.htaccess](./public/.htaccess).

Con esos orígenes ausentes de `script-src`, el navegador bloquea las etiquetas externas de analítica declaradas. Esto afecta la medición y hace que el seguimiento configurado en el HTML no sea una fuente fiable de datos de tráfico/SEO. No bloquea por sí mismo la indexación de Google.

### Prioridad media

#### 3.4 El canonical dinámico no se actualiza para todas las rutas en navegación SPA

Los HTML creados por el prerender sí reciben el canonical correcto. En cambio, [hooks/useMetaTags.ts](./hooks/useMetaTags.ts) declara `canonicalUrl`, pero no lo aplica; los componentes de catálogo, subcategoría, listado y contacto que usan ese hook actualizan título/descripción/Open Graph, no canonical. Al navegar a esas vistas desde otra ruta sin recargar, el canonical del documento puede continuar apuntando a la URL desde la que se abrió el HTML. `ProductDetail` tiene un `<link rel="canonical">` propio y constituye una excepción.

Este comportamiento afecta el estado del documento después de navegación cliente; no invalida el canonical incluido en el HTML generado para un acceso directo a cada ruta.

#### 3.5 El JSON-LD activo varía entre HTML directo y navegación cliente

- El HTML prerenderizado usa un grafo compartido con propiedades de dirección y horarios por sucursal.
- [App.tsx](./App.tsx) crea además un esquema de organización al ejecutar la aplicación. En ese esquema usa `addressCity` en vez de `addressLocality` y asigna a ambas sucursales el cierre de las 18:30, aunque `data/seo.ts` indica que Las Culturas cierra a las 18:00.
- [hooks/useJsonLd.ts](./hooks/useJsonLd.ts) mantiene un solo `<script data-type="dynamic">` compartido. Hay varias instancias en algunas rutas (por ejemplo, organización, breadcrumbs y lista de productos), por lo que las inserciones dinámicas se reemplazan entre sí en vez de conservar necesariamente todos esos esquemas.
- La generación estática de las rutas evita varios de estos problemas en el acceso directo porque inserta un único grafo antes de que React cargue.

#### 3.6 Las instrucciones sobre Search Console y rich results sobredeclaran lo que el código produce

[docs/GOOGLE_SEARCH_CONSOLE_SETUP.md](./docs/GOOGLE_SEARCH_CONSOLE_SETUP.md) afirma que se esperan informes para Product, Organization, LocalBusiness y Category, y propone probar URLs con fragmentos `#/...`. La aplicación usa `BrowserRouter` y rutas reales, no un router hash; además, el prerender no produce `@type: Product`, sino `Thing` y `WebPage`. Google Search Console no ofrece un informe de mejora para cada tipo Schema.org genérico; solo presenta informes de tipos compatibles que detecta.

La misma discrepancia aparece en [scripts/validate-rich-results.js](./scripts/validate-rich-results.js): es una simulación con 56 productos y resultados prefijados, que afirma Product/Offer/Rating y “ready for Google”, mientras que los datos actuales contienen 46 productos y el código activo deliberadamente no declara schema Product. Ese archivo no valida el HTML real.

#### 3.7 `lastmod` del sitemap se renueva en cada generación

El generador activo asigna `new Date()` como `lastmod` a todas las URLs cada vez que se ejecuta, independientemente de si cambió cada página. El build incluso lo ejecuta dos veces. En consecuencia, el valor no representa con precisión la fecha de modificación de cada recurso; el sitemap sigue siendo sintácticamente una lista de URLs, pero sus fechas pueden sugerir cambios que no ocurrieron.

#### 3.8 El workflow de actualización de sitemaps observa una ruta que no existe en esta estructura

[.github/workflows/update-sitemaps.yml](./.github/workflows/update-sitemaps.yml) incluye el patrón `src/components/**/*.tsx`, pero los componentes están en `components/` en la raíz del repositorio. Cambios solo en esos componentes no activan ese workflow por ese patrón. También publica un comentario con cifras fijas (`73 URLs`, `46 productos`, `22 categorías`) que no están sincronizadas con la salida actual de 70 URLs totales y el contenido del sitemap. La generación desde el build de Pages/Vercel es independiente de este disparador.

#### 3.9 El `.htaccess` bloquea XML si el hosting lo interpreta

[public/.htaccess](./public/.htaccess) contiene una regla `FilesMatch` que deniega acceso a extensiones `.xml`. Si el sitio se sirve en Apache aplicando ese archivo, el bloqueo incluye `sitemap.xml`, `sitemap-products.xml`, `sitemap-categories.xml` y `sitemap-images.xml`. Vercel y GitHub Pages no ejecutan reglas de `.htaccess`, por lo que el impacto depende de la plataforma efectiva.

### Prioridad baja / mantenimiento

#### 3.10 Configuración duplicada y divergente

La fuente más claramente activa para el build es `data/seo.ts`, junto con la lógica de `scripts/prerender.js`. También existen [config/seoConfig.ts](./config/seoConfig.ts), [config/helmetConfig.ts](./config/helmetConfig.ts), [utils/seoPrerender.ts](./utils/seoPrerender.ts) y varios generadores auxiliares.

Estas copias no están completamente sincronizadas: incluyen correos, teléfonos, redes sociales y lógica de dominio distintos. Por ejemplo, `seoConfig.ts` usa `info@pinturasdiamantemx.com`, mientras que `data/seo.ts` usa `info@pinturasdiamante.com`; algunas utilidades conservan el host `luisjacoboroy.github.io/Webpd`. La divergencia aumenta el riesgo de que una modificación en una configuración aparentemente central no cambie lo que el build publica.

#### 3.11 Iconos referenciados pero no presentes en la raíz de `public/`

[index.html](./index.html) y [public/site.webmanifest](./public/site.webmanifest) refieren rutas como `/favicon-16x16.png`, `/favicon-32x32.png`, `/apple-touch-icon.png` y `/android-chrome-192x192.png`. En el inventario de `public/` no aparecen esos nombres en la raíz; hay algunos archivos de icono con otros nombres bajo `public/img/catalog/`. Esto afecta los recursos de favicon/PWA, no la capacidad básica de indexar páginas.

El manifest también define accesos directos con URLs `/#/catalog` y `/#/contact`; esas rutas hash no coinciden con `BrowserRouter`.

#### 3.12 Validadores secundarios no reflejan el deploy actual

[scripts/validate-github-pages.js](./scripts/validate-github-pages.js), expuesto como `npm run validate:pages`, espera un elemento `<div id="app">`, mientras que la aplicación monta en `<div id="root">`. También requiere `.nojekyll`, archivo que el workflow crea después de su etapa de validación de build. Este validador no es llamado por los workflows mostrados y sus supuestos no coinciden con el entry point actual.

`npm run build` sí llama `verify-static-seo.js`; `npm run seo:verify` llama a un verificador más antiguo que revisa nombres/archivos de la arquitectura previa y no valida que cada página publicada tenga contenido renderizado.

## 4. Errores de compilación identificados

La revisión no ejecutó un nuevo build. Se revisó el resultado de `npm.cmd exec tsc -- --noEmit` ya obtenido en esta conversación. Ese chequeo reportó errores de sintaxis en archivos de documentación/ejemplos y snippets:

- [docs/SEO_INTEGRATION_EXAMPLES.tsx](./docs/SEO_INTEGRATION_EXAMPLES.tsx): el ejemplo contiene un comentario JSX dentro de un bloque `/* ... */`; el cierre del comentario JSX termina prematuramente el comentario externo y TypeScript interpreta lo siguiente como código.
- [docs/SSR_SETUP_EXAMPLE.tsx](./docs/SSR_SETUP_EXAMPLE.tsx): el contenido de ejemplo contiene fragmentos no válidos como entrada compilable.
- [MIGRATION_HELMET.ts](./MIGRATION_HELMET.ts), [PERSISTENCE_HTTPS_FAVICONS.ts](./PERSISTENCE_HTTPS_FAVICONS.ts) y [TIPS_BEST_PRACTICES.ts](./TIPS_BEST_PRACTICES.ts): son documentos/snippets guardados con extensión `.ts`; incluyen ejemplos que no son módulos TypeScript compilables.
- La salida de la misma ejecución identificó errores adicionales de parser en los dos ejemplos anteriores; no se reportó `components/Footer.tsx` como origen de esos errores.

[tsconfig.json](./tsconfig.json) no configura `include` ni `exclude` y tiene `allowJs: true`, de modo que `tsc` recoge archivos `.ts`, `.tsx` y `.js` del proyecto, incluidos ejemplos bajo `docs/` y snippets de la raíz. El comando `build` de `package.json` **no ejecuta `tsc`**: Vite transpila lo que importa y el build termina con el verificador SEO estático. Por tanto, ese diagnóstico es un error del chequeo de tipos/sintaxis global, no una excepción lanzada al ejecutar el footer ni prueba de que `npm run build` falle por esos archivos.

## 5. Archivos informativos, heredados o candidatos a revisión de uso

“No participa en el runtime” no significa automáticamente que un archivo sea basura; puede servir como historial o documentación. La clasificación siguiente se basa en referencias encontradas en el código y en el flujo npm descrito.

### Informativos: no controlan el sitio publicado

Los Markdown y reportes de SEO describen o documentan; no son importados por la aplicación ni forman parte del flujo de build, salvo que un script los inspeccione. Esto incluye, entre otros:

- Raíz: `DOMAIN_CORRECTION_REPORT.md`, `EJEMPLOS_JSONLD_COMPONENTES.md`, `HELMET_IMPLEMENTATION_SUMMARY.md`, `INDEX_REFERENCIA.md`, `INTEGRACION_RAPIDA_JSONLD.md`, `QUICK_START_HELMET.md`, `README_HELMET_IMPLEMENTATION.md`, `SEO_DEVOPS_SETUP.md`, `SEO_IMPLEMENTATION.md`, `SEO_IMPLEMENTATION_SUMMARY.txt`, `SEO_OVERVIEW.md`, `SEO_RESULTS.txt`, `SEO_SUMMARY.md` y `VERIFICACION_FINAL_DEVOPS_SEO.md`.
- `docs/`: `ADVANCED_SEO_ENHANCEMENTS.md`, `ENTREGABLE_FINAL.md`, `GOOGLE_SEARCH_CONSOLE_SETUP.md`, `HELMET_SSR_GUIDE.md`, `IMPLEMENTACION_CHECKLIST.md`, `IMPLEMENTATION_COMPLETE.md`, `IMPLEMENTATION_STATUS.md`, `INICIO_RAPIDO_30MIN.md`, `MICROFORMATOS_GUIDE.md`, `PRODUCT_SCHEMA_GUIDE.md`, `PRODUCT_SCHEMA_RICH_RESULTS.md`, `QUICK_START_SEO.md`, `README_SEO.md`, `RECURSOS_Y_REFERENCIAS.md`, `RESUMEN_MICROFORMATOS.md`, `SEO_IMPLEMENTATION_SUMMARY.md`, `SEO_PRERENDERING_GUIDE.md`, `SITEMAPS_DYNAMICOS_GUIA_COMPLETA.md` y `SITEMAPS_STRUCTURE.md`.

Varias guías reflejan una implementación anterior o hacen afirmaciones que no coinciden con el build actual; no deben tomarse como prueba de la salida desplegada.

### Artefactos o código heredado sin participación demostrada en el deploy actual

- [prerendered/](./prerendered/) contiene HTML y `schema-index.json` con formato/metadatos de una implementación anterior. El build vigente escribe en `dist/` desde `scripts/prerender.js`; no se encontró un paso que copie el directorio raíz `prerendered/` a `dist/`. Estos archivos no son los HTML que el workflow publica actualmente.
- [scripts/generate-sitemaps.ts](./scripts/generate-sitemaps.ts) es un generador antiguo. No es el script `sitemap:generate` del `package.json`. Si se invocara, escribiría un sitemap índice que referencia `sitemap-pages.xml` y volvería a escribir `robots.txt` sin declarar el sitemap de imágenes; no coincide con el generador activo.
- [scripts/validate-rich-results.js](./scripts/validate-rich-results.js) entrega cifras prefijadas y no valida las páginas reales; no está llamado por el build ni por un script npm.
- [components/SEOComponents.tsx](./components/SEOComponents.tsx), [components/SEOSchemaProvider.tsx](./components/SEOSchemaProvider.tsx), [components/JsonLd.tsx](./components/JsonLd.tsx), [hooks/useSEOPrerender.ts](./hooks/useSEOPrerender.ts), [hooks/useOrganizationSchema.ts](./hooks/useOrganizationSchema.ts) y [config/helmetConfig.ts](./config/helmetConfig.ts) forman una capa alternativa de SEO/Helmet. No se encontró que el entry point o las rutas actuales la monten; `SEOComponents.tsx` sí es referenciado por ejemplos en `docs/`.
- `utils/seoPrerender.ts`, `utils/seoUtils.ts`, `utils/schemaGenerators.ts` y `utils/enhancedProductSchema.ts` no son la ruta principal de generación HTML descrita en `package.json`. Algunos tienen consumidores auxiliares o dependen entre sí, pero no se encontró que sustituyan el flujo de `scripts/prerender.js`.
- [scripts/seo-verify.js](./scripts/seo-verify.js) es una herramienta informativa accesible mediante `npm run seo:verify`; no es parte del build del deploy y su checklist contiene estados estáticos/manuales.

### Archivos con función efectiva

No se clasifican como inactivos: [App.tsx](./App.tsx), [index.tsx](./index.tsx), [index.html](./index.html), [package.json](./package.json), [vite.config.ts](./vite.config.ts), [data/seo.ts](./data/seo.ts), [data/products.ts](./data/products.ts), [scripts/generate-sitemap.ts](./scripts/generate-sitemap.ts), [scripts/prerender.js](./scripts/prerender.js), [scripts/verify-static-seo.js](./scripts/verify-static-seo.js), [public/robots.txt](./public/robots.txt), los sitemaps bajo [public/](./public) y los workflows de deploy. Que dos generadores o workflows se solapen no elimina su función actual; es una discrepancia entre superficies activas.

## 6. Límites de este reporte

- Revisión estática de archivos locales y del resultado previo del comando TypeScript citado.
- No se hizo una solicitud HTTP al dominio ni se comprobó qué plataforma responde por `pinturasdiamante.com`.
- No se consultó una propiedad real de Google Search Console, estadísticas de Analytics, estado de indexación, respuestas de robots/sitemaps en producción ni Rich Results Test.
- No se ejecutaron build, deploy ni validaciones adicionales durante esta revisión.
- Este archivo contiene hallazgos y clasificación; **no se modificó ningún otro archivo ni se aplicaron las correcciones/sugerencias descritas o implícitas**.
