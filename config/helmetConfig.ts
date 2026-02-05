/**
 * Helmet Configuration para SSR y Client-Side Rendering
 * Compatible con node renderToString y renderToPipeableStream
 */

export const helmetConfig = {
  // Para SSR: información sobre dónde extraer los meta tags
  titleTemplate: '%s | Diamante Oaxaca',
  defaultTitle: 'Pinturas Diamante Oaxaca',
  
  // Base URL para URLs canónicas en SSR
  base: 'https://pinturasdiamante.com',
  
  // Configuración de atributos del html
  htmlAttributes: {
    lang: 'es',
  },
  
  // Meta tags por defecto
  meta: [
    {
      name: 'charset',
      content: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      httpEquiv: 'x-ua-compatible',
      content: 'IE=edge',
    },
  ],
  
  // Link tags por defecto (favicon, etc)
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'canonical',
      href: 'https://pinturasdiamante.com',
    },
  ],
};

/**
 * Hook para extraer Helmet en SSR
 * Úsalo en tu servidor Node con renderToString
 */
export const getHelmetData = (helmet: any) => {
  return {
    htmlAttributes: helmet.htmlAttributes.toComponent(),
    title: helmet.title.toComponent(),
    meta: helmet.meta.toComponent(),
    link: helmet.link.toComponent(),
    script: helmet.script.toComponent(),
  };
};

/**
 * Plantilla HTML para SSR
 * Inserta los componentes de Helmet aquí
 */
export const htmlTemplate = (content: string, helmetData: any) => `
<!DOCTYPE html>
<html ${helmetData.htmlAttributes}>
  <head>
    ${helmetData.title}
    ${helmetData.meta}
    ${helmetData.link}
    ${helmetData.script}
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/fonts.css" rel="stylesheet">
  </head>
  <body>
    <div id="root">${content}</div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`;
