# Cloudflare Deployment

## Cloudflare Pages Frontend

Use Cloudflare Pages with the `frontend` directory as the project root.

- Framework preset: Create React App
- Build command: `npm run build:cloudflare`
- Build output directory: `build`
- Node version: `20`
- Environment variable: `REACT_APP_BACKEND_URL=https://api.nationalpetwatch.co.uk`

The repository includes:

- `frontend/public/_redirects` for SPA history fallback.
- `frontend/public/_headers` for static security headers and immutable asset caching.

## Backend API

FastAPI does not run directly on Cloudflare Pages. Deploy it as a separate API service and put it behind Cloudflare DNS/proxy, for example:

- Container, VPS or PaaS running Uvicorn or Gunicorn.
- Cloudflare Tunnel from the API host.
- A platform that supports Python ASGI services.

Recommended API origin:

```text
https://api.nationalpetwatch.co.uk
```

Set backend `CORS_ORIGINS` to the exact Pages domains:

```text
https://nationalpetwatch.co.uk,https://www.nationalpetwatch.co.uk,https://<project>.pages.dev
```

Set:

```text
COOKIE_SECURE=true
FRONTEND_URL=https://nationalpetwatch.co.uk
```

## Cloudflare DNS

- `nationalpetwatch.co.uk`: Cloudflare Pages custom domain.
- `www.nationalpetwatch.co.uk`: Cloudflare Pages custom domain or CNAME.
- `api.nationalpetwatch.co.uk`: proxied DNS record to the backend host or Cloudflare Tunnel.

## Cloudflare Security Settings

- Enable HTTPS-only mode.
- Enable automatic HTTPS rewrites.
- Keep WAF managed rules enabled.
- Add rate limiting rules for `/api/auth/*`, `/api/upload/*`, `/api/found`, and `/api/sightings` if the API is proxied through Cloudflare.
