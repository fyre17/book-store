"""BookStore Pro — FastAPI backend
Books & Courses e-commerce with admin panel, checkout, and Telegram order notifications.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
from io import BytesIO
import os, uuid, logging, bcrypt, jwt, httpx, requests, cloudinary, cloudinary.uploader
from PIL import Image

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

JWT_SECRET = os.environ.get("JWT_SECRET", "bookstore-pro-secret-change-me")
JWT_ALG = "HS256"
JWT_EXP_HOURS = 24 * 7
def storage_put(path: str, data: bytes, content_type: str) -> dict:
    """Upload image to Cloudinary."""
    try:
        filename = os.path.splitext(os.path.basename(path))[0]

        result = cloudinary.uploader.upload(
            BytesIO(data),
            folder="bookstore-pro",
            public_id=filename,
            resource_type="image",
            format="webp",
        )

        return result

    except Exception as e:
        logger.exception(f"Cloudinary upload failed: {e}")
        raise HTTPException(500, f"Cloudinary upload failed: {str(e)}")

ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

def compress_image(data: bytes, content_type: str) -> tuple[bytes, str, str]:
    """Return (compressed_bytes, output_mime, extension). Converts to WEBP for optimal size."""
    try:
        img = Image.open(BytesIO(data))
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA") if content_type == "image/png" else img.convert("RGB")
        elif img.mode != "RGB":
            img = img.convert("RGB")
        # Cap dimensions to 1600px on the longest edge (retains crisp product cards + detail)
        img.thumbnail((1600, 1600), Image.LANCZOS)
        buf = BytesIO()
        img.save(buf, format="WEBP", quality=85, method=6)
        return buf.getvalue(), "image/webp", "webp"
    except Exception as e:
        logging.warning(f"Image compress failed, storing original: {e}")
        ext = {"image/png": "png", "image/webp": "webp"}.get(content_type, "jpg")
        return data, content_type, ext


mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="BookStore Pro API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bookstore")


# ---------- Helpers ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def make_token(admin_id: str) -> str:
    payload = {"sub": admin_id, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def require_admin(cred: HTTPAuthorizationCredentials = Depends(security)):
    if not cred:
        raise HTTPException(401, "Missing auth")
    try:
        data = jwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception:
        raise HTTPException(401, "Invalid token")
    admin = await db.admins.find_one({"id": data["sub"]}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(401, "Admin not found")
    return admin


# ---------- Models ----------
class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Book(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    author: str
    category: str
    description: str = ""
    image: str = ""
    price: float
    offer_price: Optional[float] = None
    rating: float = 4.5
    stock: int = 100
    featured: bool = False
    visible: bool = True
    created_at: str = Field(default_factory=now_iso)

class BookIn(BaseModel):
    title: str
    author: str
    category: str
    description: str = ""
    image: str = ""
    price: float
    offer_price: Optional[float] = None
    rating: float = 4.5
    stock: int = 100
    featured: bool = False
    visible: bool = True

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    image: str = ""
    duration: str = ""
    language: str = "English"
    price: float
    offer_price: Optional[float] = None
    featured: bool = False
    visible: bool = True
    created_at: str = Field(default_factory=now_iso)

class CourseIn(BaseModel):
    title: str
    description: str = ""
    image: str = ""
    duration: str = ""
    language: str = "English"
    price: float
    offer_price: Optional[float] = None
    featured: bool = False
    visible: bool = True

class OrderIn(BaseModel):
    item_type: str  # "book" | "course"
    item_id: str
    quantity: int = 1
    full_name: str
    whatsapp: str
    alt_mobile: Optional[str] = ""
    email: Optional[str] = ""
    address: str
    city: str
    state: str
    country: str
    pincode: str
    notes: Optional[str] = ""
    agreed: bool = False

class SettingsModel(BaseModel):
    site_name: str = "BookStore Pro"
    logo: str = ""
    footer: str = "© BookStore Pro. Books that build better minds."
    owner_name: str = "The BookStore Pro Team"
    email: str = "hello@bookstorepro.com"
    phone: str = "+91 90000 00000"
    whatsapp: str = "+91 90000 00000"
    address: str = "24, Ink Street, New Delhi, India 110001"
    hours: str = "Mon–Sat · 10:00 to 19:00 IST"
    map_embed: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83912635518!2d76.99999999!3d28.6448"
    telegram: str = "https://t.me/bookstorepro"
    instagram: str = "https://instagram.com/bookstorepro"
    facebook: str = "https://facebook.com/bookstorepro"
    youtube: str = "https://youtube.com/@bookstorepro"
    phonepe_qr: str = ""
    gpay_qr: str = ""
    paytm_qr: str = ""
    upi_id: str = "bookstorepro@upi"
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    payment_instructions: str = "Scan any QR code with your UPI app or send to our UPI ID. After paying, upload the payment screenshot and enter your transaction ID below."


# ---------- Startup: seed admin + settings ----------
@app.on_event("startup")
async def seed():
    init_storage()
    existing = await db.admins.find_one({"email": "admin@bookstore.com"})
    if not existing:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@bookstore.com",
            "password": hash_pw("Admin@123"),
            "name": "Store Owner",
            "created_at": now_iso(),
        })
        logger.info("Seeded default admin: admin@bookstore.com / Admin@123")

    if not await db.settings.find_one({"_id": "singleton"}):
        s = SettingsModel().model_dump()
        s["_id"] = "singleton"
        await db.settings.insert_one(s)

    # Seed a few sample books/courses so the storefront isn't empty
    if await db.books.count_documents({}) == 0:
        samples = [
            {"title": "The Quiet Craft", "author": "Anaya Kapoor", "category": "Self-Help",
             "description": "A grounded guide to building deep focus and calm in a noisy world.",
             "image": "https://images.unsplash.com/photo-1614983099486-fd0ef224a916?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxib29rJTIwbGF5aW5nJTIwZmxhdCUyMG9uJTIwdGFibGUlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzg2MTE1NDE5fDA&ixlib=rb-4.1.0&q=85",
             "price": 599, "offer_price": 449, "rating": 4.8, "stock": 40, "featured": True},
            {"title": "Systems That Sing", "author": "Ravi Mehra", "category": "Business",
             "description": "How the world's best product teams design operating rhythms that scale.",
             "image": "https://images.unsplash.com/photo-1746686240962-0dc260956ac4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxib29rJTIwbGF5aW5nJTIwZmxhdCUyMG9uJTIwdGFibGUlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzg2MTE1NDE5fDA&ixlib=rb-4.1.0&q=85",
             "price": 799, "offer_price": 599, "rating": 4.7, "stock": 25, "featured": True},
            {"title": "Letters to a Younger Self", "author": "Meera Iyer", "category": "Fiction",
             "description": "A hopeful epistolary novel about identity, courage, and coming home.",
             "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
             "price": 499, "offer_price": 349, "rating": 4.6, "stock": 60, "featured": False},
            {"title": "The Founder's Field Notes", "author": "K. Bansal", "category": "Business",
             "description": "Twelve years of scars, wins, and playbooks from a bootstrapped founder.",
             "image": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800",
             "price": 899, "offer_price": 699, "rating": 4.9, "stock": 15, "featured": True},
            {"title": "Slow Mornings", "author": "Ishita Rao", "category": "Lifestyle",
             "description": "An illustrated guide to reclaiming the first hour of your day.",
             "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
             "price": 349, "offer_price": 249, "rating": 4.5, "stock": 80, "featured": False},
            {"title": "The Poet's Arithmetic", "author": "Arjun Sen", "category": "Poetry",
             "description": "Verses on modern love, borrowed cities, and the math of missing home.",
             "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
             "price": 299, "offer_price": None, "rating": 4.4, "stock": 100, "featured": False},
        ]
        for b in samples:
            book = Book(**b).model_dump()
            await db.books.insert_one(book)

    if await db.courses.count_documents({}) == 0:
        samples = [
            {"title": "Write Non-Fiction That Sells", "description": "A 6-week studio for authors who want their first serious book out the door.",
             "image": "https://images.pexels.com/photos/29791620/pexels-photo-29791620.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
             "duration": "6 weeks", "language": "English", "price": 4999, "offer_price": 2999, "featured": True},
            {"title": "Deep Work Foundations", "description": "Rebuild attention, calendar, and rituals with a proven daily system.",
             "image": "https://images.unsplash.com/photo-1769794370990-614f765fa360?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxsYXB0b3AlMjBub3RlYm9vayUyMHN0dWR5aW5nJTIwd2FybSUyMGRlc2t8ZW58MHx8fHwxNzg2MTE1NDE5fDA&ixlib=rb-4.1.0&q=85",
             "duration": "4 weeks", "language": "English", "price": 3499, "offer_price": 1999, "featured": True},
            {"title": "The Storefront Playbook", "description": "Design, price, and launch a premium D2C shop that people brag about.",
             "image": "https://images.unsplash.com/photo-1585832770485-e68a5dbfad52?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBub3RlYm9vayUyMHN0dWR5aW5nJTIwd2FybSUyMGRlc2t8ZW58MHx8fHwxNzg2MTE1NDE5fDA&ixlib=rb-4.1.0&q=85",
             "duration": "8 weeks", "language": "English + Hindi", "price": 6999, "offer_price": 4499, "featured": True},
        ]
        for c in samples:
            course = Course(**c).model_dump()
            await db.courses.insert_one(course)


# ---------- Admin Auth ----------
@api.post("/admin/login")
async def admin_login(body: AdminLogin):
    admin = await db.admins.find_one({"email": body.email.lower()})
    if not admin or not verify_pw(body.password, admin["password"]):
        raise HTTPException(401, "Invalid email or password")
    return {"token": make_token(admin["id"]), "admin": {"email": admin["email"], "name": admin.get("name", "")}}

@api.get("/admin/me")
async def admin_me(admin=Depends(require_admin)):
    return admin


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str

@api.post("/admin/change-password")
async def change_password(body: ChangePasswordIn, admin=Depends(require_admin)):
    if len(body.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    doc = await db.admins.find_one({"id": admin["id"]})
    if not doc or not verify_pw(body.current_password, doc["password"]):
        raise HTTPException(401, "Current password is incorrect")
    await db.admins.update_one({"id": admin["id"]}, {"$set": {"password": hash_pw(body.new_password)}})
    return {"ok": True}


# ---------- Books ----------
@api.get("/books")
async def list_books(q: Optional[str] = None, search: Optional[str] = None,
                     category: Optional[str] = None,
                     min_price: Optional[float] = None, max_price: Optional[float] = None,
                     sort: str = "latest", visible_only: bool = True):
    query = {}
    if visible_only:
        query["visible"] = True
    term = q or search
    if term:
        query["$or"] = [{"title": {"$regex": term, "$options": "i"}},
                        {"author": {"$regex": term, "$options": "i"}}]
    if category and category != "All":
        query["category"] = category
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    cur = db.books.find(query, {"_id": 0})
    if sort == "popular":
        cur = cur.sort("rating", -1)
    elif sort == "price_asc":
        cur = cur.sort("price", 1)
    elif sort == "price_desc":
        cur = cur.sort("price", -1)
    else:
        cur = cur.sort("created_at", -1)
    return await cur.to_list(500)

@api.get("/books/categories")
async def book_categories():
    cats = await db.books.distinct("category", {"visible": True})
    return sorted(cats)

@api.get("/books/{book_id}")
async def get_book(book_id: str):
    b = await db.books.find_one({"id": book_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Book not found")
    return b

@api.post("/admin/books")
async def create_book(body: BookIn, admin=Depends(require_admin)):
    b = Book(**body.model_dump()).model_dump()
    await db.books.insert_one(b)
    b.pop("_id", None)
    return b

@api.put("/admin/books/{book_id}")
async def update_book(book_id: str, body: BookIn, admin=Depends(require_admin)):
    r = await db.books.update_one({"id": book_id}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Book not found")
    return await db.books.find_one({"id": book_id}, {"_id": 0})

@api.delete("/admin/books/{book_id}")
async def delete_book(book_id: str, admin=Depends(require_admin)):
    await db.books.delete_one({"id": book_id})
    return {"ok": True}


# ---------- Courses ----------
@api.get("/courses")
async def list_courses(q: Optional[str] = None, visible_only: bool = True):
    query = {}
    if visible_only:
        query["visible"] = True
    if q:
        query["title"] = {"$regex": q, "$options": "i"}
    cur = db.courses.find(query, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(500)

@api.get("/courses/{cid}")
async def get_course(cid: str):
    c = await db.courses.find_one({"id": cid}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Course not found")
    return c

@api.post("/admin/courses")
async def create_course(body: CourseIn, admin=Depends(require_admin)):
    c = Course(**body.model_dump()).model_dump()
    await db.courses.insert_one(c)
    c.pop("_id", None)
    return c

@api.put("/admin/courses/{cid}")
async def update_course(cid: str, body: CourseIn, admin=Depends(require_admin)):
    r = await db.courses.update_one({"id": cid}, {"$set": body.model_dump()})
    if r.matched_count == 0:
        raise HTTPException(404, "Course not found")
    return await db.courses.find_one({"id": cid}, {"_id": 0})

@api.delete("/admin/courses/{cid}")
async def delete_course(cid: str, admin=Depends(require_admin)):
    await db.courses.delete_one({"id": cid})
    return {"ok": True}


# ---------- Settings ----------
@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"_id": "singleton"})
    if not s:
        s = SettingsModel().model_dump()
    s.pop("_id", None)
    # Never expose bot token to public
    return s

@api.get("/settings/public")
async def public_settings():
    s = await db.settings.find_one({"_id": "singleton"}) or {}
    s.pop("_id", None)
    s.pop("telegram_bot_token", None)
    s.pop("telegram_chat_id", None)
    return s

@api.put("/admin/settings")
async def update_settings(body: SettingsModel, admin=Depends(require_admin)):
    doc = body.model_dump()
    await db.settings.update_one({"_id": "singleton"}, {"$set": doc}, upsert=True)
    return doc


# ---------- File Upload (Cloudinary) ----------

def _upload_image_to_storage(file: UploadFile, folder: str = "products") -> str:
    """Validate, compress, upload to Cloudinary. Returns permanent image URL."""
    content_type = (file.content_type or "").lower()

    if content_type not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(400, "Only JPG, PNG, or WEBP images are allowed")

    data = file.file.read()

    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Image must be under 10 MB")

    compressed, mime, ext = compress_image(data, content_type)

    try:
        result = cloudinary.uploader.upload(
            BytesIO(compressed),
            folder=f"bookstore-pro/{folder}",
            resource_type="image",
            format="webp",
        )

        return result["secure_url"]

    except Exception as e:
        logger.exception("Cloudinary upload failed")
        raise HTTPException(500, f"Image upload failed: {str(e)}")


@api.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("products"),
    admin=Depends(require_admin)
):
    """Admin-only image upload using Cloudinary."""

    if folder not in ("products", "qr"):
        folder = "products"

    url = _upload_image_to_storage(file, folder=folder)

    return {
        "path": url,
        "url": url
    }
# ---------- Orders ----------
async def send_telegram_order(order: dict, screenshot_url: Optional[str], base_url: str):
    s = await db.settings.find_one({"_id": "singleton"}) or {}
    token = s.get("telegram_bot_token", "").strip()
    chat_id = s.get("telegram_chat_id", "").strip()
    if not token or not chat_id:
        logger.info("Telegram not configured; skipping notification")
        return False, "not_configured"
    text = (
        f"🛒 *New Order Received*\n\n"
        f"👤 *Name:* {order['full_name']}\n"
        f"📱 *WhatsApp:* {order['whatsapp']}\n"
        f"📞 *Alt:* {order.get('alt_mobile') or '-'}\n"
        f"✉️ *Email:* {order.get('email') or '-'}\n"
        f"📍 *Address:* {order['address']}, {order['city']}, {order['state']}, {order['country']} - {order['pincode']}\n\n"
        f"📦 *Item:* {order['item_title']} ({order['item_type']})\n"
        f"🔢 *Qty:* {order['quantity']}\n"
        f"💰 *Total:* ₹{order['total']}\n"
        f"💳 *Txn ID:* {order.get('transaction_id') or '-'}\n"
        f"📝 *Notes:* {order.get('notes') or '-'}\n\n"
        f"🕒 {order['created_at']}\n"
        f"🌐 IP: {order.get('ip','-')} · {order.get('device','-')}"
    )
    async with httpx.AsyncClient(timeout=15) as c:
        try:
            await c.post(f"https://api.telegram.org/bot{token}/sendMessage",
                         json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"})
            if screenshot_url:
                full = screenshot_url if screenshot_url.startswith("http") else f"{base_url}{screenshot_url}"
                await c.post(f"https://api.telegram.org/bot{token}/sendMessage",
                             json={"chat_id": chat_id, "text": f"🖼 Payment Screenshot: {full}"})
            return True, "sent"
        except Exception as e:
            logger.exception("Telegram send failed")
            return False, str(e)


@api.post("/orders")
async def create_order(request: Request,
                       item_type: str = Form(...), item_id: str = Form(...),
                       quantity: int = Form(1), full_name: str = Form(...),
                       whatsapp: str = Form(...), alt_mobile: str = Form(""),
                       email: str = Form(""), address: str = Form(...),
                       city: str = Form(...), state: str = Form(...),
                       country: str = Form(...), pincode: str = Form(...),
                       notes: str = Form(""), agreed: bool = Form(False),
                       transaction_id: str = Form(""),
                       screenshot: Optional[UploadFile] = File(None)):
    if not agreed:
        raise HTTPException(400, "You must accept the Terms & Conditions")

    if item_type == "book":
        item = await db.books.find_one({"id": item_id}, {"_id": 0})
    elif item_type == "course":
        item = await db.courses.find_one({"id": item_id}, {"_id": 0})
    else:
        raise HTTPException(400, "Invalid item_type")
    if not item:
        raise HTTPException(404, "Item not found")

    unit = item.get("offer_price") or item["price"]
   total = float(unit) * int(quantity)

    screenshot_url = None
    if screenshot is not None:
        content_type = (screenshot.content_type or "").lower()

        if content_type in ALLOWED_IMAGE_MIMES:
            data = screenshot.file.read()

            if len(data) <= MAX_UPLOAD_BYTES:
                compressed, mime, ext = compress_image(data, content_type)

                try:
                    result = cloudinary.uploader.upload(
                        BytesIO(compressed),
                        folder="bookstore-pro/orders",
                        resource_type="image",
                        format="webp",
                    )
                    screenshot_url = result["secure_url"]
                except Exception as e:
                    logger.error(f"Screenshot upload failed: {e}")

    ua = request.headers.get("user-agent", "")
    ip = request.client.host if request.client else "-"

    order = {
        "id": str(uuid.uuid4()),
        "item_type": item_type,
        "item_id": item_id,
        "item_title": item.get("title"),
        "item_image": item.get("image", ""),
        "quantity": quantity,
        "unit_price": unit,
        "total": total,
        "full_name": full_name,
        "whatsapp": whatsapp,
        "alt_mobile": alt_mobile,
        "email": email,
        "address": address,
        "city": city,
        "state": state,
        "country": country,
        "pincode": pincode,
        "notes": notes,
        "transaction_id": transaction_id,
        "screenshot_url": screenshot_url,
        "status": "pending",
        "payment_status": "submitted",
        "ip": ip,
        "device": ua,
        "created_at": now_iso(),
    }

    await db.orders.insert_one(order)

    base_url = str(request.base_url).rstrip("/")
    sent, info = await send_telegram_order(order, screenshot_url, base_url)

    order["_id"] = None
    order.pop("_id", None)

    return {
        "ok": True,
        "order_id": order["id"],
        "telegram": sent,
        "telegram_info": info,
    }


@api.get("/admin/orders")
async def list_orders(q: Optional[str] = None, status: Optional[str] = None, admin=Depends(require_admin)):
    query = {}
    if status and status != "all":
        query["status"] = status
    if q:
        query["$or"] = [
            {"full_name": {"$regex": q, "$options": "i"}},
            {"whatsapp": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"item_title": {"$regex": q, "$options": "i"}},
            {"id": {"$regex": q, "$options": "i"}},
        ]
    cur = db.orders.find(query, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(1000)

@api.put("/admin/orders/{oid}/status")
async def set_order_status(oid: str, status: str = Form(...), admin=Depends(require_admin)):
    if status not in ("pending", "completed", "cancelled", "delivered"):
        raise HTTPException(400, "Invalid status")
    r = await db.orders.update_one({"id": oid}, {"$set": {"status": status}})
    if r.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


# ---------- Customers ----------
@api.get("/admin/customers")
async def list_customers(admin=Depends(require_admin)):
    pipeline = [
        {"$group": {
            "_id": "$whatsapp",
            "name": {"$last": "$full_name"},
            "email": {"$last": "$email"},
            "city": {"$last": "$city"},
            "state": {"$last": "$state"},
            "orders": {"$sum": 1},
            "spent": {"$sum": "$total"},
            "last_order": {"$max": "$created_at"},
        }},
        {"$sort": {"last_order": -1}},
    ]
    out = []
    async for row in db.orders.aggregate(pipeline):
        row["whatsapp"] = row.pop("_id")
        out.append(row)
    return out


# ---------- Dashboard ----------
@api.get("/admin/dashboard")
async def dashboard(admin=Depends(require_admin)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(5000)
    total_orders = len(all_orders)
    revenue = sum(o.get("total", 0) for o in all_orders)
    todays = [o for o in all_orders if o.get("created_at", "").startswith(today)]
    books_sold = sum(o["quantity"] for o in all_orders if o["item_type"] == "book")
    courses_sold = sum(o["quantity"] for o in all_orders if o["item_type"] == "course")

    # Monthly aggregation for last 6 months
    monthly = {}
    for o in all_orders:
        ym = o.get("created_at", "")[:7]
        if not ym:
            continue
        m = monthly.setdefault(ym, {"month": ym, "revenue": 0, "orders": 0, "books": 0, "courses": 0})
        m["revenue"] += o.get("total", 0)
        m["orders"] += 1
        if o["item_type"] == "book":
            m["books"] += o["quantity"]
        else:
            m["courses"] += o["quantity"]
    monthly_list = sorted(monthly.values(), key=lambda x: x["month"])[-6:]

    latest_customers = []
    seen = set()
    for o in sorted(all_orders, key=lambda x: x.get("created_at", ""), reverse=True):
        key = o.get("whatsapp")
        if key in seen:
            continue
        seen.add(key)
        latest_customers.append({
            "name": o.get("full_name"), "whatsapp": key,
            "email": o.get("email"), "city": o.get("city"),
            "created_at": o.get("created_at"),
        })
        if len(latest_customers) >= 8:
            break

    return {
        "today_orders": len(todays),
        "total_orders": total_orders,
        "revenue": revenue,
        "books_sold": books_sold,
        "courses_sold": courses_sold,
        "monthly": monthly_list,
        "latest_customers": latest_customers,
        "recent_orders": all_orders[:8] if all_orders else [],
    }


# ---------- Newsletter ----------
class NewsletterIn(BaseModel):
    email: EmailStr

@api.post("/newsletter")
async def subscribe(body: NewsletterIn):
    await db.newsletter.update_one(
        {"email": body.email.lower()},
        {"$set": {"email": body.email.lower(), "created_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}


# ---------- Contact form ----------
class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str

@api.post("/contact")
async def contact(body: ContactIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.messages.insert_one(doc)
    # Try Telegram notify
    s = await db.settings.find_one({"_id": "singleton"}) or {}
    token, chat_id = s.get("telegram_bot_token", ""), s.get("telegram_chat_id", "")
    if token and chat_id:
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(f"https://api.telegram.org/bot{token}/sendMessage",
                             json={"chat_id": chat_id,
                                   "text": f"📨 New contact\nFrom: {body.name} <{body.email}>\n\n{body.message}"})
        except Exception:
            pass
    return {"ok": True}


@api.get("/")
async def root():
    return {"service": "BookStore Pro", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.on_event("shutdown")
async def shutdown():
    client.close()
