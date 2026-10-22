# KindLoop – Donation Management Platform

A full-stack web platform that connects **donors**, **people in need**, and **volunteer couriers** to
manage donations end to end: from posting a donation, to requesting it, to delivering it.

Group project (full-stack web development, B.Sc. Computer Science). **Final grade: 100.**

## Features

- **Donations & requests** – donors publish donations, recipients request them, with approval flow and status tracking.
- **Deliveries** – volunteers pick up deliveries and see the route on an interactive map.
- **Payments** – monetary donations through Stripe (test mode), with transaction history and system balance.
- **Real-time notifications** – live updates over WebSockets (Socket.IO) plus email notifications.
- **Roles & permissions** – dynamic role-based access control with per-user permission overrides.
- **User verification** – email verification and admin approval of user documents (image upload and processing).
- **Ratings** – users rate each other after a completed donation.
- **Admin panel** – manage users, roles, permissions, donations, activities, and view platform statistics.
- **AI helpers** – generate donation descriptions, speech-to-text, and text-to-speech through an AI microservice.
- **Multi-language** – i18n on the frontend and a translation endpoint on the backend.
- **Dashboard** – impact and activity statistics per user.

## Tech stack

| Layer    | Technologies                                                                                    |
|----------|-------------------------------------------------------------------------------------------------|
| Frontend | React 18, TypeScript, Vite, Material UI, React Query, React Hook Form + Zod, Zustand, i18next, Leaflet, Framer Motion |
| Backend  | Node.js, Express, TypeScript, Mongoose, JWT auth, Socket.IO, Stripe, Winston, Multer + Sharp, Nodemailer |
| Database | MongoDB                                                                                         |
| DevOps   | Docker, Docker Compose, ESLint, Jest (backend), Vitest (frontend)                               |

## Project structure

```
.
├── backend/                 # REST API + WebSocket server
│   └── src/
│       ├── config/          # DB, logger, Stripe, socket, permission seeding
│       ├── features/        # activities, address, admin, ai, auth, donations, notifications,
│       │                    # payments, permissions, ratings, requests, roles, statistics,
│       │                    # translate, tts, users
│       └── shared/          # middleware (auth, permissions, rate limit, validation, upload), utils, types
├── frontend/                # React SPA, organized by feature
│   └── src/features/        # admin, auth, dashboard, deliveries, donations, home,
│                            # notifications, payments, ratings, requests, user-profile
├── docker-compose.yml       # MongoDB + backend + frontend
└── mongo-init.js
```

---

## Setup & running guide

### Prerequisites

- **Docker Desktop** installed and running – [Download here](https://www.docker.com/products/docker-desktop/)

### 1. Configure environment

Create `backend/.env` with your Stripe test keys (get them from <https://dashboard.stripe.com/test/apikeys>):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Start the system

From the project root:

```bash
docker-compose up -d
```

This builds and starts three services:

| Service  | Container Name    | Port  |
|----------|-------------------|-------|
| MongoDB  | kindloop-mongodb  | 27017 |
| Backend  | kindloop-backend  | 5000  |
| Frontend | kindloop-frontend | 5173  |

The first run may take a few minutes while Docker builds the images.

### 3. Verify

```bash
docker ps
```

All three containers should show status **Up**.

### 4. Open the app

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000/api**

### Default admin

Seeded automatically on first startup:

| Field    | Value                |
|----------|----------------------|
| Email    | `admin@kindloop.com` |
| Password | `admin@kindloop.com` |

### Registering new users

After registering, the app asks for an email verification code. Use `000000`.

### Test payments

The Donate button uses Stripe in test mode:

| Field       | Value                 |
|-------------|-----------------------|
| Card Number | `4242 4242 4242 4242` |
| Expiry Date | Any future date       |
| CVC         | Any 3 digits          |

### Note on default filters

Many pages default to a status filter (e.g. "Approved" or "Pending"). If a newly created item doesn't
appear, switch the status tab at the top of the page to "All".

### Useful commands

```bash
docker-compose down            # stop the system
docker-compose logs -f         # view logs
docker-compose up -d --build   # rebuild after code changes
```
