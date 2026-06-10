# Database Schema

MongoDB database configured by `DB_NAME`.

## Collections

- `roles`: database-driven role records. Fields: `id`, `slug`, `name`, `created_at`.
- `users`: account records. Fields include `id`, `email`, `password_hash`, owner contact/address fields, `lat`, `lon`, `role`, `role_id`, `created_at`.
- `pets`: pet records. Fields include `id`, `owner_id`, name/species/breed/gender/DOB/colour/weight, microchip, medical notes, emergency contact fallback, `photo_url`, `status`, `created_at`.
- `pet_photos`: uploaded pet images. Fields: `id`, `owner_id`, `filename`, `content_type`, `size`, `data_url`, `uploaded_at`.
- `pet_documents`: document metadata. Fields: `id`, `pet_id`, `owner_id`, `document_type`, `filename`, `url`, `created_at`.
- `emergency_contacts`: emergency contact records. Fields: `id`, `pet_id`, `owner_id`, `name`, `phone`, `email`, `relationship`, `priority`, `created_at`.
- `lost_reports`: lost-pet cases. Fields: `id`, `pet_id`, `owner_id`, last-seen date/location/coordinates, description, reward, status, alert count, timestamps.
- `found_reports`: public found-pet reports. Fields: `id`, species/breed/colour, location/coordinates, notes, microchip, photo, reporter contact, status, `created_at`.
- `sighting_reports`: public sightings for lost reports. Fields: `id`, `lost_report_id`, location/coordinates, notes, photo, reporter contact, status, `created_at`.
- `notifications`: in-app notification records. Fields: `id`, `user_id`, `type`, `channel`, `title`, `body`, related report IDs, `read`, `created_at`.
- `notification_queue`: channel-delivery queue. Fields: `id`, `notification_id`, `user_id`, `type`, `channel`, `status`, report IDs, distance, timestamps.
- `veterinary_practices`: practice profile records. Fields: `id`, `user_id`, `practice_name`, `license_number`, `verified`, timestamps.
- `rescue_organisations`: rescue profile records. Fields: `id`, `user_id`, `organisation_name`, `registration_number`, `verified`, timestamps.
- `donations`: optional donation records. Fields: `id`, `amount`, `currency`, `status`, `provider`, timestamps.
- `support_tickets`: support messages. Fields: `id`, `name`, `email`, `subject`, `message`, `status`, `created_at`.
- `audit_logs`: administrative activity. Fields: `id`, `actor`, `action`, `target`, `at`.
- `email_log`: transactional email delivery records.

## Legacy Collection Note

If a historical `subscriptions` collection exists from previous builds, it should be treated as deprecated migration data only. It must not control feature access.

## Indexes

Startup creates indexes for user email, user role, pet owner/microchip, pet photos, pet documents, emergency contacts, report status, sighting report linkage, notifications and queue status.
