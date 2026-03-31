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
| **1 — Basic**        | CRUD, Schema Design, Embed vs. Reference                       | 🔲 Not started |
| **2 — Intermediate** | Indexes, Aggregation Pipeline, Geospatial, Validation, Reviews | 🔲 Not started |
| **3 — Advanced**     | Transactions, Change Streams, Clean Architecture, Atlas DevOps | 🔲 Not started |

Full curriculum with concept explanations, code guidance, and phase checkpoints: **[LEARNING.md](LEARNING.md)**

---

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **ODM**: Mongoose (`@nestjs/mongoose`)
- **Database**: MongoDB (local → MongoDB Atlas)
- **Validation**: `class-validator` + `class-transformer`
- **Testing**: Jest + NestJS TestBed
- **Linting**: ESLint v10 + Prettier
- **Git Hooks**: Husky + lint-staged + commitlint (Conventional Commits)

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB installed locally (or a free [MongoDB Atlas](https://www.mongodb.com/atlas) account)
- NestJS CLI: `npm i -g @nestjs/cli`

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env and set your MONGODB_URI
```

### Run

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build && npm run start:prod
```

### Test

```bash
npm run test                                          # all unit tests
npm run test -- --testPathPattern=services            # single module
npm run test:e2e                                      # end-to-end
```

---

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── config/
└── modules/
    ├── services/          # Wellness service catalog
    ├── customers/         # Customer profiles
    ├── bookings/          # Appointment bookings
    ├── wellness-centers/  # Geospatial center data
    ├── reviews/           # Customer reviews
    └── analytics/         # Aggregation pipeline reports
```

From Phase 3, each module adopts a layered Clean Architecture structure:
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
