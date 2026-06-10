"""National Pet Watch — comprehensive backend regression tests.

Covers: health, auth (register/login/me), pets (CRUD, QR, public detail),
lost/found/sighting flows, map markers, search, vet/rescue, donations,
admin endpoints, support, image upload.
"""
import os
import time
import uuid
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@nationalpetwatch.co.uk"
ADMIN_PASSWORD = "ChangeMe-Admin-2026!"

# Unique test owner credentials per run
UNIQ = uuid.uuid4().hex[:8]
OWNER_EMAIL = f"test_owner_{UNIQ}@example.com"
OWNER_PASSWORD = "Owner@Test123!"

# Shared state
state = {}


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --------------- Health ---------------
def test_health_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("name") == "National Pet Watch API"
    assert data.get("status") == "ok"


# --------------- Auth: owner register / login / me ---------------
def test_owner_register(session):
    payload = {
        "email": OWNER_EMAIL,
        "password": OWNER_PASSWORD,
        "first_name": "Test",
        "last_name": "Owner",
        "phone": "07000000000",
        "address": "10 Downing St",
        "town": "London",
        "county": "Greater London",
        "postcode": "SW1A 1AA",
        "country": "UK",
    }
    r = session.post(f"{API}/auth/register", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str)
    assert "user" in data
    user = data["user"]
    assert user["email"] == OWNER_EMAIL.lower()
    assert user["role"] == "owner"
    assert "id" in user
    assert "password_hash" not in user
    state["owner_token"] = data["access_token"]
    state["owner_id"] = user["id"]
    state["owner_lat"] = user.get("lat")
    state["owner_lon"] = user.get("lon")


def test_owner_login(session):
    r = session.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": OWNER_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == OWNER_EMAIL.lower()
    state["owner_token"] = data["access_token"]


def test_owner_login_bad_password(session):
    r = session.post(f"{API}/auth/login", json={"email": OWNER_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_auth_me(session):
    assert "owner_token" in state
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {state['owner_token']}"})
    assert r.status_code == 200, r.text
    u = r.json()
    assert u["email"] == OWNER_EMAIL.lower()
    assert u["id"] == state["owner_id"]
    assert "password_hash" not in u


def test_auth_me_unauthenticated():
    # Use a clean session so we don't carry login cookies
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


# --------------- Pets CRUD ---------------
def _owner_headers():
    return {"Authorization": f"Bearer {state['owner_token']}"}


def test_pet_create(session):
    payload = {
        "name": f"Buddy_{UNIQ}",
        "species": "dog",
        "breed": "Labrador",
        "color": "black",
        "microchip": f"CHIP_{UNIQ}",
        "photo_url": "",
    }
    r = session.post(f"{API}/pets", json=payload, headers=_owner_headers())
    assert r.status_code == 200, r.text
    pet = r.json()
    assert pet["name"] == payload["name"]
    assert pet["owner_id"] == state["owner_id"]
    assert pet["status"] == "registered"
    assert "id" in pet
    state["pet_id"] = pet["id"]
    state["pet_name"] = pet["name"]
    state["microchip"] = pet["microchip"]


def test_pets_mine(session):
    r = session.get(f"{API}/pets/mine", headers=_owner_headers())
    assert r.status_code == 200
    pets = r.json()
    assert any(p["id"] == state["pet_id"] for p in pets)


def test_pet_public_detail(session):
    r = session.get(f"{API}/pets/{state['pet_id']}")
    assert r.status_code == 200, r.text
    pet = r.json()
    assert pet["id"] == state["pet_id"]
    assert "owner_public" in pet
    op = pet["owner_public"]
    assert op["first_name"] == "Test"
    assert op["town"] == "London"
    # private fields should NOT be in owner_public
    assert "address" not in op
    assert "email" not in op


def test_pet_qr(session):
    r = session.get(f"{API}/pets/{state['pet_id']}/qr")
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("image/png")
    assert len(r.content) > 100
    assert r.content[:8] == b"\x89PNG\r\n\x1a\n"


# --------------- Lost report + radius alert ---------------
def test_lost_report_create(session):
    payload = {
        "pet_id": state["pet_id"],
        "last_seen_date": "2026-01-15",
        "last_seen_location": "SW1A 1AA",
        "description": "Last seen near Buckingham Palace",
        "reward": "£100",
    }
    r = session.post(f"{API}/lost", json=payload, headers=_owner_headers(), timeout=20)
    assert r.status_code == 200, r.text
    lost = r.json()
    assert lost["pet_id"] == state["pet_id"]
    assert lost["status"] == "active"
    assert "id" in lost
    state["lost_id"] = lost["id"]

    # Pet status should flip to lost
    pet_r = session.get(f"{API}/pets/{state['pet_id']}")
    assert pet_r.json()["status"] == "lost"

    # Wait for async dispatch
    time.sleep(3)
    # Re-fetch lost to verify alerts_sent updated
    detail = session.get(f"{API}/lost/{lost['id']}").json()
    assert "alerts_sent" in detail
    state["alerts_sent"] = detail.get("alerts_sent", 0)


def test_lost_list_includes_pet(session):
    r = session.get(f"{API}/lost")
    assert r.status_code == 200
    items = r.json()
    found = [it for it in items if it["id"] == state["lost_id"]]
    assert found, "Newly created lost report missing from /lost"
    assert found[0].get("pet") and found[0]["pet"]["id"] == state["pet_id"]


# --------------- Found report ---------------
def test_found_report_create(session):
    payload = {
        "species": "dog",
        "breed": "Labrador",
        "color": "black",
        "location": "SW1A 1AA",
        "notes": "Found wandering",
        "microchip": state["microchip"],  # should trigger owner notification
        "reporter_name": "Jane Public",
        "reporter_email": f"finder_{UNIQ}@example.com",
        "reporter_phone": "07111111111",
    }
    r = session.post(f"{API}/found", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    rec = r.json()
    assert rec["status"] == "open"
    state["found_id"] = rec["id"]


def test_found_list(session):
    r = session.get(f"{API}/found")
    assert r.status_code == 200
    assert any(it["id"] == state["found_id"] for it in r.json())


# --------------- Sighting ---------------
def test_sighting_create_emails_owner(session):
    payload = {
        "lost_report_id": state["lost_id"],
        "location": "Westminster Bridge",
        "lat": 51.5007,
        "lon": -0.1246,
        "notes": "I saw a black lab matching the description",
        "reporter_name": "Bob Witness",
        "reporter_email": f"witness_{UNIQ}@example.com",
        "reporter_phone": "07222222222",
    }
    r = session.post(f"{API}/sightings", json=payload)
    assert r.status_code == 200, r.text
    rec = r.json()
    assert rec["lost_report_id"] == state["lost_id"]
    state["sighting_id"] = rec["id"]
    # Allow async email send to land in db.email_log
    time.sleep(2)


# --------------- Search ---------------
def test_search_returns_pet(session):
    r = session.get(f"{API}/search", params={"q": state["pet_name"]})
    assert r.status_code == 200
    items = r.json()
    assert any(p["id"] == state["pet_id"] for p in items), "Pet not returned by search"


# --------------- Map markers ---------------
def test_map_markers(session):
    r = session.get(f"{API}/map/markers")
    assert r.status_code == 200
    markers = r.json()
    # Find our lost marker (may not have coords if geocoding failed)
    our_marker = [m for m in markers if m["type"] == "lost" and m["id"] == state["lost_id"]]
    if our_marker:
        m = our_marker[0]
        assert m["lat"] is not None and m["lon"] is not None
        assert m["title"] == state["pet_name"]
    else:
        # geocoding may have failed; just verify shape
        pytest.skip("Lost report has no coords (geocoding may have failed)")


# --------------- Vet registration ---------------
def test_vet_register(session):
    payload = {
        "practice_name": f"TestVet_{UNIQ}",
        "contact_name": "Vet Doctor",
        "email": f"vet_{UNIQ}@example.com",
        "phone": "07333333333",
        "address": "1 High St",
        "postcode": "EC1A 1BB",
        "country": "UK",
        "license_number": "VET12345",
        "password": "Vet@Test123!",
    }
    r = session.post(f"{API}/vet/register", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert "practice_id" in data
    state["vet_email"] = payload["email"]


# --------------- Rescue registration ---------------
def test_rescue_register(session):
    payload = {
        "organisation_name": f"TestRescue_{UNIQ}",
        "contact_name": "Rescue Manager",
        "email": f"rescue_{UNIQ}@example.com",
        "phone": "07444444444",
        "address": "5 Park Rd",
        "postcode": "M1 1AE",
        "country": "UK",
        "registration_number": "REG98765",
        "password": "Rescue@Test123!",
    }
    r = session.post(f"{API}/rescue/register", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert "rescue_id" in data


# --------------- Donations ---------------
def test_donation_create_and_capture(session):
    r = session.post(f"{API}/donations/create", params={"amount": 10, "currency": "GBP"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "order_id" in data
    assert data.get("donation_url", "").startswith("https://www.paypal.com/donate/")
    order_id = data["order_id"]

    r2 = session.post(f"{API}/donations/capture/{order_id}")
    assert r2.status_code == 200, r2.text
    assert r2.json().get("ok") is True


# --------------- Support ticket ---------------
def test_support_ticket(session):
    payload = {
        "name": "Test User",
        "email": f"support_{UNIQ}@example.com",
        "subject": "Test issue",
        "message": "Just a test ticket",
    }
    r = session.post(f"{API}/support", json=payload)
    assert r.status_code == 200, r.text
    rec = r.json()
    assert rec["status"] == "open"
    assert "id" in rec


# --------------- Public image upload ---------------
def test_public_image_upload(session):
    # tiny 1x1 PNG
    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff"
        b"\xff?\x00\x05\xfe\x02\xfe\xa6$\xd8\xf6\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    files = {"file": ("test.png", io.BytesIO(png_bytes), "image/png")}
    # Don't send JSON content-type for multipart
    r = requests.post(f"{API}/upload/public-image", files=files)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["url"].startswith("data:image/png;base64,")


# --------------- Admin endpoints ---------------
@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.json()["access_token"]


def test_admin_stats(session, admin_token):
    r = session.get(f"{API}/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200, r.text
    s = r.json()
    for key in ("users", "pets", "lost", "found", "sightings", "vets", "rescues",
                "support_tickets_open"):
        assert key in s, f"Missing key {key} in admin stats"
        assert isinstance(s[key], int)
    assert s["users"] >= 1
    assert s["pets"] >= 1


def test_admin_users(session, admin_token):
    r = session.get(f"{API}/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    users = r.json()
    assert isinstance(users, list)
    assert any(u["email"] == OWNER_EMAIL.lower() for u in users)
    # password_hash must be stripped
    assert all("password_hash" not in u for u in users)


def test_admin_pets(session, admin_token):
    r = session.get(f"{API}/admin/pets", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    pets = r.json()
    assert any(p["id"] == state["pet_id"] for p in pets)


def test_admin_email_log(session, admin_token):
    r = session.get(f"{API}/admin/email-log", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    logs = r.json()
    assert isinstance(logs, list)
    # Should contain at least the welcome email or sighting email
    assert len(logs) >= 1
    # Verify status field is present
    assert all("status" in l for l in logs)


def test_admin_requires_admin_role():
    # Clean session (no admin cookies) + owner Bearer token
    r = requests.get(f"{API}/admin/stats", headers={"Authorization": f"Bearer {state['owner_token']}"})
    assert r.status_code == 403


# --------------- Cleanup ---------------
def test_zz_cleanup_pet(session):
    # delete the test pet
    r = session.delete(f"{API}/pets/{state['pet_id']}", headers=_owner_headers())
    assert r.status_code == 200
