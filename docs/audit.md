# Audit Report

Date: 2026-06-10

Scope: full repository review of the React frontend, FastAPI backend, MongoDB schema assumptions, tests, generated reports and documentation.

## Branding Issues Found

- `frontend/public/index.html` contained third-party builder metadata, external builder script injection, a fixed builder badge, and a generic full-stack app title. Fixed by replacing the HTML shell with National Pet Watch metadata.
- `frontend/package.json` and `frontend/craco.config.js` contained a development visual-editing dependency and CRACO integration tied to the previous builder. Fixed by removing the dependency and wrapper.
- `backend/requirements.txt` contained previous-builder packages and an external wheel URL. Fixed by removing those dependencies.
- `frontend/src/pages/Contact.jsx`, `frontend/src/pages/Support.jsx`, and `frontend/src/pages/Privacy.jsx` used old Global Pet Registry email addresses. Fixed with `nationalpetwatch.co.uk` addresses.
- `frontend/src/App.js`, `frontend/src/lib/api.js`, and `frontend/src/lib/auth.jsx` used legacy `gpr` identifiers. Fixed for runtime code.
- `frontend/src/constants/testIds/home.js` and `frontend/src/constants/testIds/auth.js` contained builder-specific test naming/comments. Fixed.

## Placeholder Branding

- `README.md` contained only a generic instruction heading. Fixed with a National Pet Watch project README.
- `frontend/public/index.html` had generic app metadata. Fixed.
- No custom logo asset exists yet. The current app uses a lucide `PawPrint` icon as a brand mark. This is acceptable for launch foundation but should be replaced with a dedicated National Pet Watch SVG logo before a public marketing launch.

## Temporary Content And Test Data

- `test_reports/` and `test_result.md` were generated QA artifacts describing simulated paid-plan/payment behaviour and preview URLs. Removed.
- `memory/PRD.md` described outdated paid-plan and simulated payment behaviour. Removed.
- `design_guidelines.json` contained placeholder/dummy-asset guidance unrelated to the production app. Removed.
- Frontend pages use external Unsplash hero imagery on the home page. This is not seeded pet content, but it is a temporary marketing asset risk. Replace with licensed National Pet Watch photography before public launch.
- Backend tests create synthetic test users/pets at runtime. This is acceptable test data and does not ship as application content.

## Incomplete Pages And Workflows

- Owner dashboard lists pets and links to QR/lost-report flows, but does not yet expose full edit, photo gallery, document upload or emergency-contact management UI. Backend foundations for emergency contacts and document metadata were added.
- Public QR pet profiles exist under `/p/:id`; the requested example `/pet/abc123` route is not yet aliased. Add `/pet/:id` as a frontend route before launch.
- Veterinary and rescue dashboards are still registration-first. They do not yet include complete case-management workflows.
- Admin panel is read-heavy and lacks management actions for users, pets, lost reports, found reports, notifications, support tickets and audit logs.
- Email templates now cover the required message types at backend helper level, but password reset and account verification endpoints are not yet implemented.
- Notification architecture now writes `notifications` and `notification_queue`, but there is no separate worker process. Email dispatch still happens inline from the async task.
- Found-pet and sighting reports notify owners by email for strong matches, but there is no owner-facing inbox UI yet.
- Document storage is metadata-only. A secure file-storage provider should replace inline base64 image storage.

## Technical Debt

- `backend/server.py` remains a large monolithic module. Split into routers/services for auth, pets, reports, notifications, email, admin and donations.
- Frontend is JavaScript/JSX, not TypeScript. The user requirement says React + TypeScript; migration remains outstanding.
- The backend uses Pydantic validation but could benefit from stricter postcode, phone and microchip formats.
- Uploaded images are stored inline as base64 in MongoDB. This is not suitable for scale or CDN delivery.
- Rate limiting is in-memory and per-process. Production should use Redis or another shared store.
- Tests target live HTTP endpoints and are not isolated with a disposable database fixture.
- There are many unused shadcn/Radix UI components in `frontend/src/components/ui`. Keep only used components to reduce maintenance surface.

## Security Issues

- Password strength validation was missing. Fixed for owner, veterinary practice and rescue registration.
- CSRF protection for cookie-authenticated writes was missing. Added CSRF token cookie and header enforcement for mutating requests.
- Rate limiting was missing. Added in-memory request throttling middleware.
- Security headers were missing. Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Role strings were hardcoded and not database-driven. Added seeded role documents and user `role_id` migration.
- Default administrator credentials existed in code. Changed defaults to National Pet Watch values, but production must always override `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- CORS can still be configured as `*` through environment defaults. Production must set explicit allowed origins.
- JWT refresh tokens are issued but there is no refresh endpoint or token revocation list.
- Public image upload remains anonymous. It has size/type checks, but should add malware scanning and abuse controls.

## Funding And Payments

- Card-payment plan checkout and cancellation endpoints were present. Removed.
- Paid membership UI and feature-gating language were present. Removed or replaced with free-access/donation messaging.
- Donation page now uses the provided PayPal hosted donation URL and states that donations are optional.

## Current Status

National Pet Watch now has a cleaner production foundation, but it is not yet a complete public-launch product. The highest-priority remaining work is TypeScript migration, storage hardening, full role dashboards, complete admin operations, password-reset/account-verification endpoints, and a durable notification worker.
