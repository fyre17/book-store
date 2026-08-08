# BookStore Pro — Product Requirements

## Original Problem Statement
Production-ready Book & Course selling website + Admin Panel. Modern, premium UI (Amazon/Apple/Gumroad/Notion vibes). Buy flow: checkout form → payment (QR + upload screenshot + txn ID) → order sent to owner's Telegram. Admin: dashboard, book/course/order/customer management, settings (QRs, Telegram, business info).

## Architecture
- **Frontend**: React 19 + React Router v7 + Tailwind + shadcn/ui + framer-motion + recharts + sonner
- **Backend**: FastAPI + Motor (MongoDB) + PyJWT + bcrypt + httpx (for Telegram)
- **DB**: MongoDB (collections: admins, books, courses, orders, settings, messages, newsletter)
- **Auth**: JWT bearer for admin routes
- **File Upload**: Local `uploads/` served at `/uploads/*`
- **Telegram**: Dynamic bot token + chat_id from settings (admin-configurable)

## User Personas
- **Reader**: Browses books/courses, filters, buys via UPI, gets WhatsApp confirmation
- **Store Owner (Admin)**: Manages catalog, orders, customers, receives Telegram order alerts

## Core Requirements — Implemented (2026-02)
- Home: hero, features, benefits (Why Read), popular books, reviews, FAQ, newsletter
- Books page: search, category filter, price range, sort, wishlist heart, buy now
- Courses page: search, cards with duration/language
- Contact page: owner info, google map embed, contact form
- Checkout: 2-step (form → payment) with agreement gate, order summary, quantity picker
- Payment: QR grid + UPI ID copy + screenshot upload + txn id → creates order + sends Telegram
- Wishlist page (localStorage)
- Admin login (seeded: admin@bookstore.com / Admin@123)
- Admin Dashboard: 5 stat cards + monthly revenue line chart + books/courses bar chart + latest customers
- Admin Books/Courses CRUD (image upload or URL)
- Admin Orders: search, status filter tabs, status update (pending/completed/delivered/cancelled), screenshot viewer
- Admin Customers: aggregated view + CSV export
- Admin Settings: PhonePe/GPay/Paytm QR upload, UPI ID, Telegram token+chat, business info, social links
- Dark/Light mode toggle (both public + admin), sticky glass navbar, sonner toasts

## Backlog / Next
- **P1**: Order invoice PDF download
- **P1**: Real Telegram bot end-to-end verification (needs user's bot token)
- **P2**: Full-text search across books & courses combined
- **P2**: Bulk import via CSV in admin
- **P2**: Email order confirmation to customer
- **P2**: Recently viewed section on home
- **P3**: SEO meta tags per book/course page, XML sitemap
- **P3**: Coupon codes
