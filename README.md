# Micro Marketplace App (Backend + Web + Mobile)

Demo Video (Unlisted): https://youtu.be/HZtWNHJgXqU  
Web App (Live): https://micro-marketplace-shw4.vercel.app/

Full Stack Developer Intern Assignment project:
- `backend` (Node.js + Express + MongoDB)
- `web-app` (React + Vite)
- `mobile-app` (React Native + Expo Router)

## Features

### Backend
- JWT auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me` (protected)
- Product APIs
  - `GET /products` (search + pagination)
  - `GET /products/:id`
  - `POST /products`
  - `PUT /products/:id`
  - `DELETE /products/:id`
- Favorites
  - `POST /products/favorite/:id` (protected add/remove toggle)
- Validation middleware for auth, product payloads, query params, and ids
- Centralized 404 + error response middleware
- Password hashing via `bcryptjs`
- Seed script with 10 products + 2 users

### Web App
- Login/Register
- Product list with search + pagination
- Product details page
- Favorite/unfavorite with heart icon
- Favorites page
- Responsive UI (laptop/tablet/mobile)
- Micro-interaction: heart icon states + badge counter

### Mobile App
- Login/Register
- Browse products with search + pagination
- Product details
- Favorite/unfavorite
- Favorites tab with badge count

---

## Project Structure

```text
micro-marketplace/
  backend/
  web-app/
  mobile-app/
```

---

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (Atlas or local)
- For mobile:
  - Expo Go app on phone OR Android emulator/iOS simulator

---

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

For mobile app (optional but recommended), create `mobile-app/.env`:

```env
# Use your laptop LAN IP for physical phone testing
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000

# Optional: force emulator URL behavior
# EXPO_PUBLIC_USE_EMULATOR=true
```

These `EXPO_PUBLIC_*` variables are consumed in:
- `mobile-app/context/app-context.tsx`

---

## Setup & Run

### 1) Backend

```bash
cd backend
npm install
node seed.js
node server.js
```

Backend runs at: `http://localhost:5000`

### 2) Web App

```bash
cd web-app
npm install
npm run dev
```

Web app runs on Vite dev server (typically `http://localhost:5173`).

### 3) Mobile App

```bash
cd mobile-app
npm install
npm start
```

Then:
- scan QR from Expo Go on phone, or
- run `npm run android` / `npm run ios` with emulator/simulator.

If phone cannot connect in LAN mode, use tunnel as fallback:

```bash
npx expo start --tunnel
```

---

## Seeded Test Credentials

After running `node seed.js`:

1. `demo1@example.com` / `Password@123`  
2. `demo2@example.com` / `Password@123`

---

## API Reference

Base URL: `http://localhost:5000`

### Auth

- `POST /auth/register`
  - Body: `{ "name": "User", "email": "user@example.com", "password": "secret123" }`
  - Response: `201`

- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "secret123" }`
  - Response: `200 { "token": "..." }`

- `GET /auth/me` (Bearer token required)
  - Response: `200 { "name": "...", "email": "...", "favorites": [...] }`

### Products

- `GET /products?page=1&limit=5&search=headphone`
  - Response: `200 { "products": [...], "total": 10 }`

- `GET /products/:id`
  - Response: `200` / `404`

- `POST /products`
  - Body: `{ "title": "...", "price": 100, "description": "...", "image": "..." }`
  - Response: `201`

- `PUT /products/:id`
  - Body (partial allowed): `{ "price": 120 }`
  - Response: `200` / `404`

- `DELETE /products/:id`
  - Response: `204` / `404`

### Favorites

- `POST /products/favorite/:id` (Bearer token required)
  - Toggles add/remove
  - Response: `200 { "favorites": [...] }`

---

## Validation & Status Codes

- `400` for validation errors (invalid payload/query/id)
- `401` for auth failures (invalid credentials/token)
- `404` for missing routes/resources
- `409` for duplicate registration email
- `500` for unhandled server errors

---

## Notes

- Backend validation enforces `limit` range: `1..100`.
- Mobile app defaults to LAN URL for physical device testing unless overridden by env vars.
- For physical phones, backend and phone must be on the same Wi-Fi network.

---

## Assignment Deliverables

- GitHub repo with all 3 apps: backend/web/mobile
- README with setup + API + seed credentials (this file)
- Seed script + test credentials (included)
- Demo video (3-5 minutes) or deployed link: **to be attached during submission**

