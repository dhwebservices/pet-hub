# National Pet Watch — Product Requirements

## Problem statement (verbatim from user)
Build a UK-focused, production-grade lost & found pet platform.
- Tech: React + FastAPI + MongoDB.
- Brand: National Pet Watch (UK-focused at launch). Trusted public service feel — inspired by (not copying) GOV.UK / NHS / UK charities. Distinct round-button visual identity, warm coral + deep teal-navy palette.
- Auth: JWT email/password (Bearer token).
- Payments: Stripe £2.99/mo subscriptions (MOCKED until keys provided); PayPal one-off donations (MOCKED until keys provided).
- Email: Resend transactional alerts (MOCKED to db.email_log until key provided).
- Map: Leaflet + OpenStreetMap (Mapbox-swappable later).
- Storage: built-in image upload (base64 in MongoDB).
- Radius alert: postcode geocoded via Nominatim, 10-mile Haversine match against registered members.

## User personas
1. **Pet owner** — registers pet(s), reports lost, manages subscription.
2. **Veterinary practice** — registers, gets verified, submits found reports.
3. **Rescue organisation** — registers, gets verified, manages cases & reunifications.
4. **Public reporter** — submits found / sighting reports anonymously.
5. **Administrator** — moderates the platform.

## Implemented
- Backend: 30+ endpoints, JWT auth, bcrypt hashing, admin seed, Nominatim geocoding, Haversine radius dispatcher, QR code generator, image upload, MongoDB collections for users, pets, lost_reports, found_reports, sighting_reports, vet practices, rescue orgs, subscriptions, donations, support_tickets, email_log, audit_logs, notification_queue. 30/30 backend tests passing.
- Frontend: Home, Login, Register, Owner Dashboard, Register Pet, Lost Pets, Found Pets, Report Lost, Report Found, Report Sighting, Public Pet Profile, Lost Detail, Search, Map, Vet Register, Rescue Register, Subscribe, Donate, Support, About, Privacy, Terms, Contact, Admin Panel.
- Design: rebranded to National Pet Watch — warm coral + deep teal-navy palette, rounded UI, public-service inspired (not GOV.UK clone), photo-led hero, friendly service-card grid.

## Mocked
- Stripe checkout — activates Premium directly until key supplied.
- PayPal orders — recorded as mocked entries.
- Resend email — written to email_log collection.

## Backlog (P1)
- Mapbox swap-in once token provided.
- Twilio / Vonage SMS via existing notification_queue model.
- Document vault (vaccination records, insurance PDFs).
- Cloudflare Turnstile or hCaptcha bot protection on public forms.
- Password strength validation + brute-force lockout (auth playbook recommendation).
- Reunifications wall (public, anonymised) for trust signals.

## Backlog (P2)
- Vet/rescue case management dashboard.
- Family / multi-user accounts.
- Mobile app via React Native or PWA install prompts.
- Geo-2dsphere index for scale of radius dispatcher.
