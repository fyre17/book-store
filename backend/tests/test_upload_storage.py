"""Backend tests for image upload/storage system + product detail image persistence."""
import io
import os
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://learning-store-13.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@bookstore.com"
ADMIN_PASSWORD = "Admin@123"


def _png_bytes(size=(200, 200), color=(200, 100, 50)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    tok = data.get("token") or data.get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------- /api/upload ----------

def test_upload_requires_auth():
    files = {"file": ("t.png", _png_bytes(), "image/png")}
    r = requests.post(f"{API}/upload", files=files, timeout=15)
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code} - {r.text}"


def test_upload_valid_png_returns_path_and_url(auth_headers):
    files = {"file": ("t.png", _png_bytes(), "image/png")}
    r = requests.post(f"{API}/upload", files=files, headers=auth_headers, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "path" in data and "url" in data
    assert data["url"].startswith("/api/files/"), data["url"]
    # Persist for next test
    pytest.uploaded_url = data["url"]
    pytest.uploaded_path = data["path"]


def test_uploaded_url_serves_webp():
    url = getattr(pytest, "uploaded_url", None)
    assert url, "prior upload test must succeed"
    r = requests.get(f"{BASE_URL}{url}", timeout=30)
    assert r.status_code == 200, r.text
    ct = r.headers.get("content-type", "")
    assert "image/webp" in ct.lower(), f"expected webp, got {ct}"
    assert len(r.content) > 0


def test_upload_rejects_non_image(auth_headers):
    files = {"file": ("bad.txt", b"hello world", "text/plain")}
    r = requests.post(f"{API}/upload", files=files, headers=auth_headers, timeout=15)
    assert r.status_code == 400, f"expected 400, got {r.status_code} - {r.text}"


def test_upload_rejects_pdf(auth_headers):
    files = {"file": ("bad.pdf", b"%PDF-1.4 fake", "application/pdf")}
    r = requests.post(f"{API}/upload", files=files, headers=auth_headers, timeout=15)
    assert r.status_code == 400


# ---------- Book create with uploaded image ----------

def test_create_book_with_uploaded_image_persists(auth_headers):
    url = getattr(pytest, "uploaded_url", None)
    assert url
    payload = {
        "title": "TEST_UploadBook",
        "author": "Tester",
        "price": 199,
        "category": "Business",
        "description": "test book",
        "image": url,
        "stock": 5,
        "rating": 4.5,
    }
    r = requests.post(f"{API}/admin/books", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code in (200, 201), r.text
    book = r.json()
    book_id = book.get("id") or book.get("_id")
    assert book_id
    pytest.created_book_id = book_id

    # GET back
    g = requests.get(f"{API}/books/{book_id}", timeout=15)
    assert g.status_code == 200, g.text
    fetched = g.json()
    # Some backends store as cover_image or image_url
    img = fetched.get("image") or fetched.get("cover_image") or fetched.get("image_url")
    assert img == url, f"stored image mismatch: {img} vs {url}"


def test_cleanup_book(auth_headers):
    bid = getattr(pytest, "created_book_id", None)
    if not bid:
        pytest.skip("no book created")
    r = requests.delete(f"{API}/admin/books/{bid}", headers=auth_headers, timeout=15)
    assert r.status_code in (200, 204)


# ---------- Order screenshot upload uses storage ----------

def test_order_screenshot_stored_via_storage():
    # need a valid book id
    r = requests.get(f"{API}/books", timeout=15)
    assert r.status_code == 200
    books = r.json()
    assert isinstance(books, list) and len(books) > 0
    book = books[0]
    bid = book.get("id") or book.get("_id")

    files = {"screenshot": ("s.png", _png_bytes((300, 300)), "image/png")}
    data = {
        "full_name": "TEST Buyer",
        "whatsapp": "9999999999",
        "email": "test_buyer@example.com",
        "address": "1 test street",
        "city": "TestCity",
        "state": "TestState",
        "country": "India",
        "pincode": "110001",
        "item_type": "book",
        "item_id": bid,
        "quantity": "1",
        "transaction_id": "TEST_TXN_UPLOAD_1",
        "agreed": "true",
    }
    r = requests.post(f"{API}/orders", data=data, files=files, timeout=30)
    assert r.status_code == 200, r.text
    resp = r.json()
    assert resp.get("ok") is True
    # Fetch the order via admin to see screenshot_url
    tok_r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    tok = tok_r.json().get("token") or tok_r.json().get("access_token")
    h = {"Authorization": f"Bearer {tok}"}
    o = requests.get(f"{API}/admin/orders", headers=h, timeout=15)
    assert o.status_code == 200
    orders = o.json()
    match = [x for x in orders if x.get("transaction_id") == "TEST_TXN_UPLOAD_1"]
    assert match, "created order not found"
    surl = match[0].get("screenshot_url") or match[0].get("payment_screenshot")
    assert surl and surl.startswith("/api/files/"), f"screenshot_url should start with /api/files/, got {surl}"

    # And it should be publicly fetchable
    g = requests.get(f"{BASE_URL}{surl}", timeout=30)
    assert g.status_code == 200
    assert "image/webp" in g.headers.get("content-type", "").lower()
