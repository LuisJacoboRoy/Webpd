import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.resolve(process.argv[2] || 'dist');
const productionUrl = process.env.VERCEL_PRODUCTION_URL;

if (!productionUrl) {
  throw new Error('VERCEL_PRODUCTION_URL must be set to the Vercel production URL');
}

const productionOrigin = new URL(productionUrl);
if (productionOrigin.protocol !== 'https:' || productionOrigin.pathname !== '/' ||
    productionOrigin.search || productionOrigin.hash) {
  throw new Error('VERCEL_PRODUCTION_URL must be an HTTPS origin without a path or query');
}

for (const route of ['admin', 'reseña']) {
  const routePath = `/${route}`;
  const destinationUrl = new URL(routePath, productionOrigin.origin);
  const redirectPage = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0;url=${destinationUrl.href}">
    <link rel="canonical" href="${destinationUrl.href}">
    <title>Redirigiendo…</title>
    <script>
      const destination = new URL(${JSON.stringify(routePath)}, ${JSON.stringify(productionOrigin.origin)});
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.href);
    </script>
  </head>
  <body>
    <p>Redirigiendo a la aplicación. <a href="${destinationUrl.href}">Continuar</a></p>
  </body>
</html>
`;
  const routeDirectory = path.join(outputDirectory, route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, 'index.html'), redirectPage, 'utf8');
}

console.log(`Created GitHub Pages redirects for /admin and /reseña to ${productionOrigin.origin}`);
