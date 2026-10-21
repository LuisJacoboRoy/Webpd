# Checklist de despliegue en Vercel

## Antes del primer despliegue

- Configura estos secretos en **Settings → Secrets and variables → Actions**:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Confirma que el proyecto de Vercel asociado tenga `pinturasdiamante.com` como dominio y que su configuración de DNS esté vigente.
- Ejecuta localmente `npm ci` y `npm run build`. El build genera los sitemaps, prerenderiza las rutas públicas y ejecuta `seo:verify:static`.

## Flujo de publicación

- Los cambios en pull requests a `main` ejecutan el build. Los pull requests del mismo repositorio también generan un preview de Vercel; los de forks no reciben secretos ni despliegan previews.
- Un push a `main` ejecuta el build y publica a producción en Vercel.
- El único workflow de despliegue es `.github/workflows/deploy-vercel.yml`. Los workflows de GitHub Pages fueron retirados.
- `update-sitemaps.yml` puede actualizar los sitemaps versionados, pero no hace un despliegue aparte. El workflow de Vercel los regenera durante el build de `main`.

## Después del despliegue

1. Revisa que el workflow de Vercel termine correctamente en GitHub Actions.
2. Comprueba que respondan el dominio y las rutas públicas principales: `/`, `/catalog/`, `/contact/`, una categoría, una subcategoría y un producto.
3. Comprueba que `/robots.txt`, `/sitemap.xml`, `/sitemap-products.xml`, `/sitemap-categories.xml` y `/sitemap-images.xml` estén disponibles.
4. En Search Console, revisa el sitemap y usa Inspección de URL para comprobar el estado de indexación. Un build exitoso no confirma por sí mismo que Google haya indexado las páginas.

## Notas

- El dominio personalizado sirve el sitio desde la raíz, por lo que Vite debe compilar con `base: '/'`.
- `.nojekyll` y `_redirects` son mecanismos de GitHub Pages y no controlan el enrutamiento de Vercel.
- Mantén `/search/` fuera de los sitemaps y con `noindex`; las rutas públicas restantes deben conservar su canonical y directiva de indexación.
