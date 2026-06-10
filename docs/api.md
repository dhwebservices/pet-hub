# API Documentation

Base path: `/api`

## Health

- `GET /` returns API name and status.

## Authentication

- `POST /auth/register`: owner registration.
- `POST /auth/login`: email/password login.
- `POST /auth/logout`: clears auth cookies.
- `GET /auth/me`: returns the current authenticated user.

Authentication uses JWT bearer tokens and HTTP-only cookies. Cookie-authenticated mutating requests must include `X-CSRF-Token`.

## Pets

- `POST /pets`: create a pet.
- `GET /pets/mine`: list current user's pets.
- `GET /pets/{pet_id}`: public-safe pet profile.
- `PUT /pets/{pet_id}`: update owned pet or administrator update.
- `DELETE /pets/{pet_id}`: delete owned pet or administrator delete.
- `GET /pets/{pet_id}/qr`: download QR code PNG.
- `POST /emergency-contacts`: add pet emergency contact.
- `GET /pets/{pet_id}/emergency-contacts`: list pet emergency contacts.
- `POST /pet-documents`: add pet document metadata.
- `GET /pets/{pet_id}/documents`: list pet documents.

## Uploads

- `POST /upload/image`: authenticated pet image upload.
- `POST /upload/public-image`: anonymous image upload for found/sighting reports.

## Lost, Found And Sightings

- `POST /lost`: report a pet lost and queue radius alerts.
- `GET /lost`: list active lost-pet reports.
- `GET /lost/{report_id}`: public lost-pet report detail.
- `POST /lost/{report_id}/found`: mark a lost report resolved.
- `POST /found`: submit a found-pet report.
- `GET /found`: list open found-pet reports.
- `POST /sightings`: submit a sighting.
- `GET /sightings/{lost_report_id}`: list sightings for an owner/admin.

## Map And Search

- `GET /map/markers`: lost and found map markers.
- `GET /search?q=&species=&status=`: search pet records.

## Professional Registration

- `POST /vet/register`: veterinary practice registration.
- `POST /rescue/register`: rescue organisation registration.

## Donations And Support

- `POST /donations/create`: records donation intent and returns the hosted PayPal donation URL when API credentials are not configured.
- `POST /donations/capture/{order_id}`: records donation completion.
- `POST /support`: create support ticket.

## Administration

Requires administrator role.

- `GET /admin/stats`
- `GET /admin/users`
- `GET /admin/pets`
- `GET /admin/vets`
- `GET /admin/rescues`
- `GET /admin/support`
- `POST /admin/verify/{kind}/{id}`
- `GET /admin/donations`
- `GET /admin/email-log`
