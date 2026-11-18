# Diagrama visual de secuencia — Webpd

Mapa de los recorridos principales de la aplicación: navegación pública y administración de publicaciones de Facebook. Los iconos identifican a cada parte y las flechas indican a qué función o servicio se dirige cada solicitud.

![Vista conceptual de Webpd con cuadros y conectores entre servicios](./DIAGRAMA_SECUENCIA_VECTOR.svg)

## Partes y responsabilidades

| Icono | Parte | Qué hace y a dónde dirige el trabajo |
|---|---|---|
| 👤 | Visitante / administrador | Navega el sitio o gestiona contenido desde `/admin`. |
| 🧭 | Navegador | Descarga la aplicación y envía solicitudes HTTP al mismo dominio. |
| ⚛️ | React (`App.tsx`) | Inicializa providers, medición y rutas; carga las páginas bajo demanda. |
| 🖥️ | Panel admin | Envía solicitudes a `/api/*` con el token de sesión. |
| ⚙️ | API serverless (`api/*.js`) | Valida entradas y sesión; coordina base de datos y servicios externos. |
| 🔐 | Autenticación (`server/http.js`) | Valida credenciales y tokens de administrador. |
| 🗄️ | Supabase | Guarda usuarios, publicaciones y configuración; almacena imágenes generadas. |
| ✨ | Google Gemini | Genera textos e imágenes cuando el administrador lo solicita. |
| ⏰ | Vercel Cron | Ejecuta diariamente `/api/meta-scheduler` para procesar publicaciones pendientes. |
| 📣 | Meta Graph API | Recibe imágenes y publicaciones programadas para una página de Facebook. |
| 📘 | Página de Facebook | Recibe y publica el contenido en la fecha acordada. |

## 1. Navegación del sitio

```mermaid
sequenceDiagram
    autonumber
    actor Visitante as 👤 Visitante
    participant Navegador as 🧭 Navegador
    participant Hosting as 🌐 Vercel / hosting estático
    participant App as ⚛️ React: App.tsx
    participant Router as 🧭 BrowserRouter
    participant Pagina as 🧩 Página o componente

    Visitante->>Navegador: Abre una URL
    Navegador->>Hosting: GET / (HTML, JS, CSS y recursos)
    Hosting-->>Navegador: index.html y archivos de la aplicación
    Navegador->>App: Ejecuta index.tsx y monta React
    App->>Router: Inicia providers y rutas
    Router->>Pagina: Resuelve URL y carga la ruta
    Note over Router,Pagina: Las páginas de ruta se cargan bajo demanda con React.lazy/Suspense.
    Pagina-->>Visitante: Renderiza catálogo, producto, contacto u otra vista
```

## 2. Administración, generación y programación en Facebook

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👩‍💻 Administrador
    participant Panel as 🖥️ Panel React /admin
    participant API as ⚙️ Funciones Vercel /api/*
    participant Auth as 🔐 server/http.js
    participant DB as 🗄️ Supabase
    participant Gemini as ✨ Google Gemini
    participant Cron as ⏰ Vercel Cron
    participant Meta as 📣 Meta Graph API
    participant Page as 📘 Página de Facebook

    rect rgb(239, 246, 255)
        Note over Admin,DB: Acceso y lectura del contenido
        Admin->>Panel: Inicia sesión
        Panel->>API: POST /api/auth
        API->>DB: Busca la cuenta de administrador
        DB-->>API: Usuario y hash de contraseña
        API-->>Panel: Token de sesión
        Panel->>API: GET /api/publicaciones?tipo=lote + token
        API->>Auth: authorizeAdmin()
        Auth-->>API: Sesión válida
        API->>DB: Consulta publicaciones del lote
        DB-->>Panel: Publicaciones para revisión
    end

    rect rgb(250, 245, 255)
        Note over Admin,Gemini: Redacción opcional
        Admin->>Panel: Solicita generar texto
        Panel->>API: POST /api/generar-texto + token
        API->>Auth: Verifica sesión
        API->>DB: Lee instrucciones editoriales
        API->>Gemini: Genera texto de imagen y copy
        Gemini-->>API: JSON con texto y copy
        API-->>Panel: Contenido validado
        Panel-->>Admin: Muestra borrador editable
    end

    rect rgb(240, 253, 244)
        Note over Admin,DB: Imagen opcional y aprobación
        Admin->>Panel: Solicita generar imagen
        Panel->>API: POST /api/generar-fondo + token
        API->>Auth: Verifica sesión
        API->>DB: Comprueba publicación
        API->>Gemini: Genera imagen
        Gemini-->>API: Imagen
        API->>DB: Guarda archivo y ruta en la publicación
        API-->>Panel: Vista previa y publicación actualizada
        Admin->>Panel: Guarda cambios y aprueba el contenido
        Panel->>API: POST /api/publicaciones (actualizar) + token
        API->>Auth: Verifica sesión
        API->>DB: Valida y guarda texto, estado y fecha
        DB-->>Panel: Publicación guardada
        Admin->>Panel: Confirma validar lote
        Panel->>API: POST /api/publicaciones (validar_lote) + token
        API->>DB: Ejecuta RPC validar_lote
        DB-->>Panel: Lote aprobado y fechas asignadas
    end

    rect rgb(255, 247, 237)
        Note over Cron,Page: Publicación programada (proceso automático)
        Cron->>API: GET /api/meta-scheduler + CRON_SECRET
        API->>API: Valida Bearer CRON_SECRET
        API->>DB: Busca publicaciones aprobadas pendientes
        DB-->>API: Copy, fecha e imagen (si existe)
        opt La publicación tiene imagen
            API->>DB: Descarga imagen de Storage
            DB-->>API: Archivo de imagen
            API->>Meta: POST /{page-id}/photos (imagen no publicada)
            Meta-->>API: ID de la foto
        end
        API->>Meta: POST /{page-id}/feed (texto/enlace y fecha)
        Meta->>Page: Programa la publicación
        Page-->>Meta: Publicación aceptada
        Meta-->>API: ID de publicación
        API->>DB: Guarda fb_post_id y fecha programada
        API-->>Cron: Resultado de publicaciones procesadas
    end
```

## Rutas y servicios involucrados

| Solicitud | Función principal | Destino |
|---|---|---|
| `POST /api/auth` | Inicia sesión o cambia contraseña | Supabase `usuarios` |
| `GET /api/publicaciones?tipo=lote` | Carga el lote activo | Supabase `publicaciones` |
| `POST /api/publicaciones` | Actualiza publicaciones o valida el lote | Supabase y RPC `validar_lote` |
| `POST /api/generar-texto` | Genera y valida copy editorial | Gemini; instrucciones desde Supabase |
| `POST /api/generar-fondo` | Genera imagen y la vincula a una publicación | Gemini y Supabase Storage |
| `GET /api/meta-scheduler` | Busca aprobadas y programa publicaciones | Supabase y Meta Graph API |
| `GET /api/imagen-publicacion` | Genera una vista previa de la imagen | Supabase Storage y Vercel OG |

### Nota sobre permisos de Meta

El publicador del proyecto usa un **token de página** del lado del servidor (`META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN` y `META_GRAPH_API_VERSION`) para enviar solicitudes a `/{page-id}/photos` y `/{page-id}/feed`. Los scopes `developer_tools_mcp_app_read` y `developer_tools_mcp_app_management` no son permisos válidos de Facebook Login: no los agregues. Para crear publicaciones, el permiso de Meta relevante es `pages_manage_posts`; si tu flujo OAuth necesita listar páginas y obtener el token de página, agrega también `pages_show_list` y `pages_read_engagement`. No configures esos permisos como scopes del MCP.
