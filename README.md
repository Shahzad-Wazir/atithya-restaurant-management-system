# Atithya — Restaurant Management System (MERN)

**Atithya** (*Atithi Devo Bhava* — Fine Dining & Hospitality) is a full-stack MERN restaurant management platform built to streamline end-to-end dining operations. It brings together a customer-facing ordering and table reservation storefront, a real-time Kitchen Display System (KDS), and an enterprise Admin Console with dynamic billing, sales analytics, and floor management.

---

## Key Features

### 1. Customer Storefront & Online Ordering
- **Menu Discovery:** Live search, category, dietary (Veg/Non-Veg), and spice-level filters, bestseller highlights, dish bookmarking, and verified guest reviews.
- **Slide-Over Cart & Multi-Mode Checkout:** Supports **Dine-In**, **Takeaway**, and **Delivery** workflows with promo/coupon validation, dynamic GST and configurable charges, and multiple payment modes (UPI, Card, COD, Pay at Table).
- **Order Tracking & Invoices:** Live status timeline from confirmation to delivery, one-click reorder, and printable GST Tax Invoices.

### 2. Table Reservations & Floor Management
- **Real-Time Slot Availability:** Instant table availability checks across dining zones (Indoor, Outdoor, Rooftop, VIP Lounge) with double-booking prevention.
- **Guest Booking Portal:** Instant booking confirmation codes and a dedicated **My Reservations** page for guests to view or manage reservations.

### 3. Kitchen Display System (KDS)
- **Live Kitchen Board (`/kitchen`):** Dedicated dark-mode interface for kitchen staff with automatic polling sync, FIFO order ticket queue, prep-time tracking, chef notes, and one-click order status transitions.

### 4. Enterprise Admin Console
- **Analytics & Dashboard (`/admin/dashboard`):** Live revenue metrics, 7-day sales trends (Recharts), and top-selling dish insights.
- **Operations Management:** Manage live orders, table reservations, visual floor map, menu catalog CRUD (with Cloudinary image uploads or direct image URLs), promo coupons, guest inquiries, and staff/user roles.
- **Billing & Reports:** Dynamic GST, convenience, and custom charge configuration along with date-filtered sales reports (CSV/PDF export).

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 (Vite), React Router v6, Tailwind CSS, Axios, Recharts |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Authentication & Security** | JWT (JSON Web Tokens), bcryptjs, Role-Based Access Control (`user`, `kitchen`, `admin`), strict CORS allowlist, NoSQL injection sanitization, API rate limiting, security headers |
| **Media & Uploads** | Multer + Cloudinary (with direct URL fallback) |

---

## Project Structure

```text
atithya-restaurant-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB & Cloudinary configuration
│   │   ├── controllers/     # Business logic for auth, menu, orders, tables, billing, etc.
│   │   ├── middleware/      # JWT auth, RBAC, upload, rate-limiting & sanitization
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express REST API routes
│   │   └── utils/           # Token generation helpers
│   ├── .env.example         # Backend environment variable template
│   ├── seed.js              # Optional catalog/tables/coupons & env-driven account seeder
│   └── server.js            # Express app entry point
└── frontend/
    ├── public/              # Brand logo & favicon assets
    ├── src/
    │   ├── components/      # Reusable UI components (Navbar, CartDrawer, ProtectedRoute, etc.)
    │   ├── context/         # Auth, Cart, and Toast contexts
    │   ├── layouts/         # Public and Admin layouts
    │   ├── pages/           # Public storefront, Kitchen Display, and Admin Console pages
    │   └── services/        # Axios API client & domain service modules
    ├── .env.example         # Frontend environment variable template
    └── vercel.json          # SPA rewrite configuration for deployment
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas cluster or local MongoDB instance

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Update `backend/.env` with your `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`, then start the API server:
```bash
npm run dev
```
*(Runs on `http://localhost:5000` by default; health check available at `GET /api/health`.)*

To populate sample menu items, tables, and coupons into your database, you can optionally run:
```bash
npm run seed
```
*(If you also want the seeder to create initial staff/customer accounts, configure `SEED_*` variables in your local `backend/.env` file before running it—never commit `.env` to version control.)*

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
```
Verify `VITE_API_URL=http://localhost:5000/api` in `frontend/.env`, then start the Vite dev server:
```bash
npm run dev
```
*(Runs on `http://localhost:5173` by default.)*

---

## Deployment Architecture

- **Backend (Render Web Service):** Root directory `backend`, build command `npm install`, start command `npm start`, health check path `/api/health`. Configure `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL` in Render's Environment Variables.
- **Frontend (Vercel or Render Static Site):** Root directory `frontend`, build command `npm run build`, publish/output directory `dist`. Set `VITE_API_URL` to your deployed backend URL (e.g., `https://<your-backend>.onrender.com/api`).
- **Database (MongoDB Atlas):** Ensure your Atlas Network Access allows connections from your hosting provider.

---

## Security Practices

- All credentials, API keys, and database URIs are managed strictly via environment variables (`.env` is gitignored).
- Passwords are hashed with `bcryptjs` and never logged or exposed in API responses.
- Protected endpoints enforce JWT verification and role-based access control (`user`, `kitchen`, `admin`).
- Strict CORS origin allowlisting (`CLIENT_URL` / `ALLOWED_ORIGINS`), request sanitization against NoSQL injection, and `/api` rate limiting are enabled by default.
