# Deployment Guide

## Services

- Frontend: static React build.
- Backend: FastAPI served by Uvicorn/Gunicorn.
- Database: MongoDB.
- Email: Resend in production.
- Donations: PayPal hosted donation button.

## Backend

1. Create a production MongoDB database.
2. Configure variables from `docs/environment.md`.
3. Install `backend/requirements.txt`.
4. Run database startup once by starting the API. Startup creates roles and indexes.
5. Serve with a process manager, for example:

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

For production, run behind a reverse proxy with TLS, request-size limits and access logs.

## Frontend

1. Set `REACT_APP_BACKEND_URL` to the public backend origin.
2. Build:

```bash
cd frontend
yarn install
yarn build
```

3. Serve `frontend/build` from a static hosting provider or web server.

For Cloudflare Pages-specific settings, use `docs/cloudflare.md`.

## DNS And TLS

- Point `nationalpetwatch.co.uk` and `www.nationalpetwatch.co.uk` to the frontend.
- Expose the backend on a separate API origin or behind `/api`.
- Use HTTPS everywhere.

## Operational Notes

- Set explicit `CORS_ORIGINS`; do not use `*` in production.
- Set `COOKIE_SECURE=true` in production.
- Use a strong `JWT_SECRET`.
- Replace inline MongoDB image storage with object storage before high-volume launch.
- Move notification delivery to a worker backed by a durable queue before high-volume launch.
