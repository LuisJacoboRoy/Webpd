graph TD 
... graph TD
  A[DNS/GitHub Repo] -->|Code push| B[GitHub Actions]
  B -->|CI/CD Workflow| C[Build the application]
  C -->|Deploy| D[Vercel Hosting]
  
  subgraph Actions["GitHub Actions Workflow Jobs"]
    B1[Validate Configuration]
    B2[Build and Verify Artifacts]
    B3[Deploy to Pages with Notifications]
  end
  
  B ---> B1
  B1 ---> B2
  B2 ---> B3
  
  subgraph External_APIs[External APIs Integration]
    API1[fa:fa-google Google]
    API2[fa:fa-dollar-sign Stripe]
    API3[fa:fa-lock Auth0]
  end
  
  D -->|Proxy /api calls| API1
  D -->|Transaction data| API2
  D -->|Authentication requests| API3
  
  subgraph Files ["Key Files in Repository"]
    FILE1[.github/workflows/deploy.yml]
    FILE2[vite.config.ts]
    FILE3[api/layout.tsx]
  end
  
  API1 -->|Input: Location, search queries| Files["vite.config.ts"]
  API1 -->|Output: Search results, suggestions|
  API2 -->|Input: Payment details| Files["api/layout.tsx"]
  API2 -->|Output: Payment confirmations|
  API3 -->|Input: User credentials| Files["EMAILJS_PARAMETROS_CORREGIDOS.md"]
  API3 -->|Output: Auth tokens| ...
  