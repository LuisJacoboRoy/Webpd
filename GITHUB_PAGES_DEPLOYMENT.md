# Guía de Despliegue - GitHub Pages + React 19

## ✅ Configuración Completada

El workflow `.github/workflows/deploy-github-pages.yml` publica el sitio estático en GitHub Pages cuando hay un push a `main` o cuando se ejecuta manualmente.

---

## 🚀 Cómo Desplegar (MUY SIMPLE)

Para publicar, haz push a `main` o ejecuta **Deploy to GitHub Pages** desde la pestaña Actions.

El workflow instala dependencias, ejecuta `npm run build`, verifica que la meta de verificación esté en `dist/index.html`, agrega `CNAME` y `.nojekyll`, genera redirecciones para `/admin` y `/reseña` hacia la app de producción en Vercel (`https://pinturas-web.vercel.app`) y publica el artefacto. El resto del sitio, incluida la portada, sigue sirviéndose desde GitHub Pages. Las redirecciones conservan los parámetros de consulta y el fragmento de la URL; el navegador cambia al dominio de Vercel.

En **Settings → Pages**, configura GitHub Actions como fuente de despliegue. El DNS de `pinturasdiamante.com` también debe apuntar a GitHub Pages; el archivo `CNAME` no cambia el DNS.

El sitio estático estará en:
**https://pinturasdiamante.com/**

> Vercel conserva su workflow independiente para `www.pinturasdiamante.com`. GitHub Pages publica archivos estáticos y no ejecuta las funciones `/api` del proyecto; las funciones administrativas requieren que el backend siga disponible en un host que las soporte.

### Publicación manual

Si necesitas probar el build localmente, ejecuta `npm run build`. El workflow es quien publica a GitHub Pages.

---

## 🔧 Qué Está Configurado

✅ **GitHub Action** (`.github/workflows/deploy-github-pages.yml`)
- Corre automáticamente en cada push a main
- Instala dependencias con `npm ci`
- Build optimizado para el dominio raíz
- Comprueba la meta de verificación y agrega `CNAME`
- Upload de artifact y deploy automático

✅ **Vite** (`vite.config.ts`)
- Usa base `/` para el dominio personalizado
- Code splitting configurado
- Minificación con terser
- Optimización de assets

✅ **SEO** (prerendering)
- Sitemap.xml dinámico
- Robots.txt optimizado
- `dist/` incluye HTML por cada ruta de catálogo y producto
- Cada HTML entrega metadatos y JSON-LD inline desde la primera respuesta
- `npm run seo:verify:static` valida las rutas y sus schemas

✅ **Dominio personalizado**
- El workflow publica `CNAME` con `pinturasdiamante.com`
- Las rutas estáticas prerenderizadas se publican desde `dist/`

✅ **Scripts Disponibles**
```bash
npm run dev              # Desarrollo local
npm run build            # Build + prerender SEO + validación
npm run prerender        # Generar SEO en dist/ (requiere npm run build)
npm run build:ssg        # Alias de npm run build
npm run seo:verify:static # Validar HTML y JSON-LD generados
npm run prepare:deploy   # Preparar y verificar LOCAL
npm run validate:pages   # Validar configuración
npm run seo:verify       # Verificar SEO
```

---

## 📊 Características Implementadas

- ✅ **React 19** completamente soportado
- ✅ **SPA Routing** con BrowserRouter funcionando
- ✅ **Prerendering SSG** para SEO perfecto
- ✅ **Schema.org** Structured Data (JSON-LD)
- ✅ **Sitemap.xml** dinámico
- ✅ **Robots.txt** optimizado
- ✅ **Open Graph & Twitter Cards**
- ✅ **GitHub Pages** deployment workflow automático
- ✅ **Dominio personalizado** (`pinturasdiamante.com`)
- ✅ **Asset optimization** con Vite
- ✅ **Code splitting** para mejor performance
- ✅ **Cache** busting automático

---

## 🎯 URLs Importantes

- **Sitio en vivo**: https://pinturasdiamante.com/
- **Sitemap**: https://pinturasdiamante.com/sitemap.xml
- **Robots.txt**: https://pinturasdiamante.com/robots.txt
- **GitHub Actions**: https://github.com/LuisJacoboRoy/Webpd/actions

---

## ✨ Próximos Pasos

1. Configura GitHub Pages para desplegar desde **GitHub Actions**.
2. Verifica que el DNS del dominio raíz apunte a GitHub Pages.
3. Haz push a `main` o ejecuta el workflow manualmente.
4. Revisa el resultado en GitHub Actions y visita el dominio.

Ver documentación detallada: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)