# Environment Variable Guide

## Backend

- `MONGO_URL`: MongoDB connection string. Required.
- `DB_NAME`: MongoDB database name. Required.
- `JWT_SECRET`: strong random secret for JWT signing. Required.
- `FRONTEND_URL`: public frontend URL used in emails and QR links. Default: `http://localhost:3000`.
- `CORS_ORIGINS`: comma-separated allowed frontend origins. Production should not use `*`.
- `COOKIE_SECURE`: set `true` when served over HTTPS.
- `RATE_LIMIT_WINDOW_SECONDS`: rate-limit window. Default: `60`.
- `RATE_LIMIT_MAX_REQUESTS`: max requests per IP/window. Default: `120`.
- `ALERT_RADIUS_MILES`: lost-pet alert radius. Default: `10`.
- `EMAIL_BACKEND`: `dummy` for local logging or `resend` for Resend.
- `RESEND_API_KEY`: Resend API key.
- `RESEND_FROM`: sender address for Resend.
- `ADMIN_EMAIL`: initial administrator email. Production must set this.
- `ADMIN_PASSWORD`: initial administrator password. Production must set this to a strong secret and rotate after first login.
- `PAYPAL_DONATE_URL`: optional override for the hosted PayPal donation URL. Default: `https://www.paypal.com/donate/?hosted_button_id=FN55GF47FEC4J`.
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`: optional future API integration values for donation records.

## Frontend

- `REACT_APP_BACKEND_URL`: backend origin without `/api`, for example `https://api.nationalpetwatch.co.uk`.

## Variables Not Used

Card-payment plan variables are intentionally not used. National Pet Watch has no paid plans or feature-gated access.
