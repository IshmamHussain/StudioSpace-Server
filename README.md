# StudioSpace Server API

> High-Performance Backend API for StudioSpace — The Peer-to-Peer Marketplace for Creators, Filmmakers, Photographers, Podcasters, and Audio Engineers.

- **Live Frontend URL:** `https://studiospace-client.vercel.app` *(Placeholder for deployment)*
- **Live API Endpoint:** `https://studiospace-server.onrender.com` *(Placeholder for deployment)*

---

## 🌟 Key Features

1. **HTTPOnly Cookie JWT Authentication (Challenge 1)**: Mutation routes (`POST /api/studios`, `DELETE /api/studios/:id`, `PUT /api/studios/:id`, `POST /api/bookings`) are protected against CSRF and token theft by enforcing signed JWT verification from HTTPOnly cookies, returning `401 Unauthorized` for unauthenticated requests.
2. **Double-Booking Prevention Engine (Challenge 2)**: Atomic interval collision detection ensures no two confirmed reservations can overlap on the same date and studio, rejecting conflicts with HTTP `409 Conflict`.
3. **High-Fidelity Studio Space Management**: Complete CRUD operations for photo studios, film stages, podcast lounges, music suites, and art workshops with ownership verification.
4. **Resilient MongoDB Atlas Connectivity**: Dual-mode data layer connecting to MongoDB Atlas with an in-memory fallback for offline/test environments, ensuring zero downtime for examiners.
5. **JSON Compression & Defensive Middleware**: Native Gzip/Brotli compression middleware, CORS origin whitelisting, strict request parsing, and unified error handling.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js (v24+), Express.js (v4.21), TypeScript (v5.6)
- **Database:** MongoDB (Native Driver v6.10), MongoDB Atlas
- **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **Performance:** `compression`, `cors`
- **Development Tooling:** `tsx`, `typescript`

---

## 🔑 Examiner Test Credentials

| Role | Email | Password | Pre-seeded Resources |
|---|---|---|---|
| **Studio Host** | `host.examiner@studiospace.io` | `StudioSpace2026!` | Owns 8 pre-seeded creative studios & confirmed bookings |
| **Creator / Renter** | `creator.examiner@studiospace.io` | `StudioSpace2026!` | Has active bookings and saved wishlist items |

*Note: All passwords satisfy the security criteria: at least 6 characters, at least 1 uppercase letter, and at least 1 lowercase letter.*

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` root (a template is provided in `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority
JWT_SECRET=studiospace_super_secure_jwt_secret_key_2026_tungsten_soundstage
CLIENT_URL=http://localhost:3000
```

### 4. Running the Server
```bash
# Development mode with hot-reloading
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new creator account
- `POST /api/auth/login` — Sign in and receive HTTPOnly session cookie
- `POST /api/auth/google` — Google OAuth credential handoff
- `GET /api/auth/me` — Verify and fetch active session (prevents redirect-on-reload)
- `POST /api/auth/logout` — Invalidate session and clear HTTPOnly cookie

### Studios (`/api/studios`)
- `GET /api/studios` — Explore studios (supports `category`, `search`, `sort`, `limit`)
- `GET /api/studios/my-listings` — View studios owned by the authenticated user `[Protected]`
- `GET /api/studios/:id` — Retrieve comprehensive studio specifications and gear list
- `POST /api/studios` — List a new studio space `[Protected]`
- `PUT /api/studios/:id` — Update studio specifications `[Protected - Owner Only]`
- `DELETE /api/studios/:id` — Remove studio from marketplace `[Protected - Owner Only]`

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Request a booking with double-booking collision prevention `[Protected]`
- `GET /api/bookings/my-bookings` — View user's reservations with status badges `[Protected]`
- `PATCH /api/bookings/:id/cancel` — Cancel a pending reservation `[Protected]`
- `GET /api/bookings/studio/:studioId` — Query reserved time slots for date-picker disablement

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` — View saved studio spaces `[Protected]`
- `POST /api/wishlist/toggle` — Add or remove studio from wishlist `[Protected]`

