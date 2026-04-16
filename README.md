# Wellness Center Hub

A backend system for a premium wellness center — built as a hands-on MongoDB learning project using **NestJS** and **TypeScript**.

---

## What This Project Is

This is a structured, tutor-guided learning project. The goal is not just to build a working backend, but to deeply understand MongoDB from the ground up — from basic CRUD to aggregation pipelines, geospatial queries, ACID transactions, and production architecture patterns.

The wellness center domain (Thai massage, herbal treatments, retreat bookings, tourist management) provides realistic, interesting data problems that map directly to the MongoDB concepts being learned at each phase.

---

## Learning Roadmap

| Phase                | Topic                                                          | Status         |
| -------------------- | -------------------------------------------------------------- | -------------- |
| **1 — Basic**        | CRUD, Schema Design, Embed vs. Reference                       | ✅ Complete    |
| **2 — Intermediate** | Indexes, Aggregation Pipeline, Geospatial, Validation, Reviews | 🔄 In progress |
| **3 — Advanced**     | Transactions, Change Streams, Clean Architecture, Atlas DevOps | 🔲 Not started |

### Phase 1 Progress

| Sub-phase | Topic                        | Status      |
| --------- | ---------------------------- | ----------- |
| 1.1       | MongoDB mindset              | ✅ Complete |
| 1.2       | NestJS scaffold + MongoDB    | ✅ Complete |
| 1.3       | Service catalog (CRUD)       | ✅ Complete |
| 1.4       | Customer profiles (embedded) | ✅ Complete |
| 1.5       | Bookings (references)        | ✅ Complete |

### Phase 2 Progress

| Sub-phase | Topic                           | Status         |
| --------- | ------------------------------- | -------------- |
| 2.1       | Indexes + `explain()`           | ✅ Complete    |
| 2.2       | Aggregation Pipeline            | 🔄 In progress |
| 2.3       | Geospatial queries              | 🔲 Not started |
| 2.4       | MongoDB JSON Schema Validation  | 🔲 Not started |
| 2.5       | Review system (computed fields) | 🔲 Not started |

Full curriculum with concept explanations, code guidance, and phase checkpoints: **[LEARNING.md](LEARNING.md)**

---

## Business Domain

A premium wellness center in Thailand offering massage, herbal treatments, and retreat packages — primarily serving both local and international tourists.

### Core Entities

| Entity              | Description                                                                                                                                                                                                             | Depends On                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **WellnessService** | The service catalog — what the center offers (e.g. Thai Massage 60 min, Herbal Steam Bath). Has a name, category, duration, and price.                                                                                  | Nothing                            |
| **Customer**        | A guest profile with contact info, preferred languages, and customer type (local / international).                                                                                                                      | Nothing                            |
| **Booking**         | An appointment — links a customer to a service at a specific date and time. Tracks status from `pending` through `completed`. A slot conflict check prevents double-booking the same service at the same date and time. | Customer, WellnessService          |
| **WellnessCenter**  | A physical center location with a GeoJSON coordinate. Used for location-based search.                                                                                                                                   | Nothing                            |
| **Review**          | A customer's rating and comment for a completed booking. One review per booking.                                                                                                                                        | Customer, WellnessService, Booking |

### Booking — Slot Conflict Logic

A conflict exists when the **same service** is already booked at the **same date and start time**. Before saving a new booking, the service checks for an existing booking matching all three fields:

```
service + appointmentDate + startTime = unique slot
```

Only bookings with status `cancelled` are excluded from the check — a cancelled booking has freed its slot and should not block new reservations. All other statuses (`pending`, `confirmed`, `in-progress`, `completed`) are considered active and hold the slot.

| Status        | Holds the slot?                                   |
| ------------- | ------------------------------------------------- |
| `pending`     | Yes — awaiting confirmation, but slot is reserved |
| `confirmed`   | Yes                                               |
| `in-progress` | Yes                                               |
| `completed`   | Yes — historical record                           |
| `cancelled`   | **No** — slot is free                             |

> **Phase 1.5 scope**: This model assumes one booking per service per time slot. Real-world capacity (therapist count, room availability) is introduced in Phase 3 via the `Room` and `Inventory` collections.

### Collections introduced in Phase 3

| Entity        | Description                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **Room**      | A bookable VIP room or treatment suite. Reserved atomically as part of a retreat booking transaction. |
| **Inventory** | Consumable supplies (oils, herbs). Quantity is decremented atomically alongside a room reservation.   |
| **Invoice**   | Financial record created together with a booking in a single ACID transaction.                        |

---

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **ODM**: Mongoose (`@nestjs/mongoose`)
- **Database**: MongoDB (local → MongoDB Atlas)
- **Validation**: `class-validator` + `class-transformer`
- **Testing**: Jest + NestJS TestBed
- **Linting**: ESLint v9 + typescript-eslint + Prettier
- **Git Hooks**: Husky + lint-staged + commitlint (Conventional Commits)

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local MongoDB) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- NestJS CLI: `npm i -g @nestjs/cli`

### Start MongoDB (Docker)

```bash
docker compose up -d        # start in background
docker compose down         # stop and remove container
docker compose down -v      # stop and delete data volume (full reset)
```

> **Production note**: Change `restart: no` to `restart: unless-stopped` in `docker-compose.yml` so the database survives crashes and server reboots.

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env — set MONGODB_URI and PORT
```

### Run

```bash
npm run start:dev          # development with hot reload
npm run start:debug        # debug mode
npm run build              # compile to dist/
npm run start:prod         # run compiled output
```

### Test

```bash
npm run test                                     # all unit tests
npm run test:watch                               # watch mode
npm run test:cov                                 # with coverage
npm run test -- --testPathPattern=services       # single module
npm run test:e2e                                 # end-to-end
```

### Lint & Format

```bash
npm run lint       # ESLint + auto-fix (src/ and test/)
npm run format     # Prettier (src/ and test/)
```

---

## Project Structure

```
src/
├── app.module.ts          # Root module
├── main.ts                # Bootstrap
└── modules/               # Feature modules added per learning phase
    ├── services/          # Phase 1.3 — Wellness service catalog
    ├── customers/         # Phase 1.4 — Customer profiles
    ├── bookings/          # Phase 1.5 — Appointment bookings
    ├── wellness-centers/  # Phase 2.3 — Geospatial center data
    ├── reviews/           # Phase 2.5 — Customer reviews
    └── analytics/         # Phase 2.2 — Aggregation pipeline reports

test/
└── app.e2e-spec.ts        # End-to-end tests
```

From Phase 3.3, each module adopts a layered Clean Architecture structure:
`Presentation → Application → Domain ← Infrastructure`

---

## Environment Variables

| Variable      | Description               | Example                                     |
| ------------- | ------------------------- | ------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/wellness_center` |
| `PORT`        | HTTP port                 | `3000`                                      |

See `.env.example` for the full list.

---

## Git Workflow

Commits are enforced to follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add customer booking endpoint"
git commit -m "fix(bookings): resolve slot conflict check"
git commit -m "docs: update phase 1 checkpoint"
```

The pre-commit hook auto-formats staged files with ESLint and Prettier before every commit.
