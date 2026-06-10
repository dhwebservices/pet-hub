# Security Review

## Implemented

- JWT authentication.
- Secure password hashing with bcrypt.
- Password strength validation for all registration types.
- Database-driven role records and role IDs.
- Role-based access checks for owner/admin/professional paths.
- CSRF token protection for cookie-authenticated mutating requests.
- In-memory rate limiting.
- Basic security headers.
- Public pet and lost-report responses hide exact owner address.
- Upload type and size checks.
- No paid feature gates.

## Remaining Risks

- Rate limiting is in-memory and not shared across processes. Use Redis for production.
- Refresh tokens are issued but not yet revocable and no refresh endpoint exists.
- Image uploads are stored inline in MongoDB. Use private object storage, signed URLs, malware scanning and lifecycle policies.
- Account verification and password reset templates exist, but the full endpoints are still required.
- Admin actions need richer audit coverage.
- CORS defaults must be locked down in production.
- Nominatim geocoding should respect production usage policy and be cached.
- Public found/sighting submissions need stronger anti-abuse controls such as CAPTCHA or reputation throttling.

## Production Checklist

- Set strong `JWT_SECRET`.
- Set `COOKIE_SECURE=true`.
- Set explicit `CORS_ORIGINS`.
- Rotate default administrator credentials.
- Run behind HTTPS.
- Enable database backups.
- Add monitoring for email delivery, notification queue depth and error rates.
