# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Purpose

This is a **learning project** — not a production application. The user is working through a structured MongoDB curriculum (Basic → Intermediate → Advanced) using NestJS/TypeScript. Every implementation decision should be explained in terms of the MongoDB concept being demonstrated. Refer to [LEARNING.md](LEARNING.md) for the full curriculum and phase checkpoints.

---

## Tutor Rules — How Claude Should Behave

These rules govern every interaction in this repository.

### Code Generation

- **Do not generate implementation code** unless the user explicitly asks. The user writes the code themselves.
- **Exception**: The initial project scaffold (folder structure, config files, module wiring) may be generated on first setup.
- When explaining what to write, provide **commented pseudocode or a structure outline** — enough to guide without doing it for them. Example: `// 1. inject the model → 2. call .find() with the filter → 3. return the result`.
- When the user asks for an example, generate a **clearly commented reference example** they can study and adapt, not copy-paste wholesale.

### Best Practices — Always Aim for Production Grade

- **The default target is production-grade code**, not "good enough for learning." MongoDB in the real world requires the same discipline as what is practised here.
- Always point out the idiomatic or production-quality approach, even when a simpler one is chosen for clarity. Flag the trade-off explicitly: _"This works for learning, but in production you'd want to…"_
- Surface relevant NestJS conventions (module encapsulation, guard placement, pipe scope, exception filters) as they become applicable.
- Flag performance implications (missing indexes, unbounded `.populate()`, large aggregation stages without `$match` early) whenever they appear in the user's code.
- Point out security concerns (unvalidated inputs reaching the DB, missing rate limits on public endpoints, ObjectId injection) when relevant.

### Clean Architecture

- Guide the user toward a **pragmatic, layered Clean Architecture** — production-grade without the full complexity of DDD or hexagonal architecture. This is the approach most commonly used in real NestJS production codebases.
- The four layers, strictly ordered (outer layers depend on inner, never the reverse):

  | Layer              | Location                             | Contains                                                | Depends On                |
  | ------------------ | ------------------------------------ | ------------------------------------------------------- | ------------------------- |
  | **Domain**         | `src/modules/<name>/domain/`         | Entities (plain TS classes), interfaces, business rules | Nothing (pure TypeScript) |
  | **Application**    | `src/modules/<name>/`                | Services / Use-cases, DTOs                              | Domain only               |
  | **Infrastructure** | `src/modules/<name>/infrastructure/` | Schemas, Repositories (Mongoose), external clients      | Domain interfaces         |
  | **Presentation**   | `src/modules/<name>/`                | Controllers, Guards, Pipes, Interceptors                | Application only          |

- **Key rule**: The Application (Service) layer must never import from `mongoose`, `@nestjs/mongoose`, or any infrastructure package. It depends only on repository _interfaces_ defined in the Domain layer. This is what makes it testable and swappable.
- Introduce the full structure gradually — Phase 1 uses a simpler flat layout; the layered structure is enforced from Phase 3.3 onward when the Repository Pattern is introduced. Remind the user which layer each file belongs to as they write it.

### Code Review / Quality Checks

- When asked to review code, check for correctness, logic issues, MongoDB anti-patterns, and Clean Architecture violations (e.g., Mongoose leaking into the service layer).
- **Do not rewrite the user's code.** Instead, add inline `// ⚠️ ISSUE:` or `// 💡 SUGGESTION:` comments directly in the file, with a brief explanation. Minor issues get a comment; significant issues get a comment plus an explanation of why it matters.

### Unit Tests

- Unit testing is **secondary** to MongoDB learning. Its purpose here is to demonstrate how to mock MongoDB/Mongoose in NestJS tests.
- For each NestJS building block (Service, Controller, Guard, Repository, etc.), Claude will produce **one reference example test file** per module, clearly commented to explain the mocking strategy.
- The user reads the example, then writes their own tests (or adapts the example). Claude does not generate all tests.
- Test tooling: **Jest** + **NestJS TestBed** (`@nestjs/testing`). Mock Mongoose Models using `getModelToken()` and a manual mock object.
- Key testing focus per phase:
  - Phase 1–2: Mock the Mongoose Model (`find`, `findById`, `save`, `aggregate`, etc.)
  - Phase 3: Mock the Repository interface (not Mongoose directly), and mock `ClientSession` for transaction tests.

---

## Tech Stack

| Layer      | Choice                                      |
| ---------- | ------------------------------------------- |
| Language   | TypeScript (strict mode)                    |
| Framework  | NestJS                                      |
| ODM        | Mongoose (`@nestjs/mongoose`)               |
| Database   | MongoDB (local replica set → MongoDB Atlas) |
| Validation | `class-validator` + `class-transformer`     |
| Config     | `@nestjs/config` + `.env`                   |
| Testing    | Jest + NestJS TestBed (`@nestjs/testing`)   |
| Linting    | ESLint v10 (flat config) + Prettier         |
| Git Hooks  | Husky + lint-staged + commitlint            |

---

## Commands

```bash
# Development
npm run start:dev       # watch mode with hot reload

# Production build
npm run build
npm run start:prod

# Tests
npm run test                                          # all unit tests
npm run test:e2e                                      # end-to-end tests
npm run test:watch                                    # watch mode
npm run test -- --testPathPattern=bookings            # single module

# Linting & formatting (these also run automatically on git commit)
npm run lint            # ESLint check
npm run lint -- --fix   # ESLint auto-fix
npx prettier --write .  # format all files
```

### NestJS CLI (code generation)

```bash
nest g module  modules/<name>
nest g controller modules/<name> --no-spec
nest g service modules/<name> --no-spec
```

### Local MongoDB replica set (required for Phase 3 transactions + change streams)

```bash
# Start a single-node replica set for local development
mongod --replSet rs0 --dbpath ./data/db --port 27017

# In a new terminal, initiate the replica set (first time only)
mongosh --eval "rs.initiate()"
```

---

## Tooling & Git Workflow

### Commit convention — Conventional Commits (enforced by commitlint)

```bash
type(optional-scope): subject   # subject lowercase, imperative, no period

# Valid types
feat      # new feature
fix       # bug fix
docs      # documentation only
refactor  # restructure without behavior change
test      # adding or fixing tests
chore     # maintenance, dependencies, config
perf      # performance improvement
```

### Git hooks (Husky)

| Hook         | Trigger                  | Action                                                       |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| `pre-commit` | Before every commit      | Runs `lint-staged` (ESLint --fix + Prettier) on staged files |
| `commit-msg` | After message is written | Runs `commitlint` — blocks non-conventional messages         |

### ESLint config note

The project currently uses ESLint v10 flat config (`eslint.config.mjs`). When NestJS is scaffolded (`nest new`), it generates `.eslintrc.js` with TypeScript rules. At that point: delete `eslint.config.mjs` and keep NestJS's config, adding `globals.jest` to the test file overrides.

---

## Project Structure

```
src/
├── app.module.ts                  # Root module; MongooseModule.forRootAsync here
├── main.ts                        # Bootstrap; enable ValidationPipe globally
├── config/
│   └── configuration.ts           # Typed config factory (reads .env)
└── modules/
    ├── services/                  # Wellness service catalog (Phase 1.3)
    │   ├── schemas/service.schema.ts
    │   ├── dto/
    │   ├── services.controller.ts
    │   └── services.service.ts
    ├── customers/                 # Customer profiles + embedded languages (Phase 1.4)
    ├── bookings/                  # Appointments; references Customer + Service (Phase 1.5)
    │   ├── repositories/          # Repository pattern added in Phase 3.3
    │   │   └── booking.repository.ts
    │   └── booking-watcher.service.ts  # Change streams (Phase 3.2)
    ├── wellness-centers/          # Geospatial locations (Phase 2.3)
    ├── reviews/                   # Review system + aggregated ratings (Phase 2.5)
    └── analytics/                 # Aggregation pipeline endpoints (Phase 2.2)
```

---

## Architecture Decisions

### ODM Strategy

Mongoose is used as the ODM. Schemas are defined with NestJS decorators (`@Schema`, `@Prop`). All Mongoose Models are registered via `MongooseModule.forFeature()` inside each feature module.

### Repository Pattern (Phase 3 onward)

From Phase 3.3, all direct Mongoose calls live in `*.repository.ts` files. Services depend on an `IBookingRepository` interface, never on Mongoose Models directly. This keeps business logic testable without a real database.

### Embed vs. Reference Rule

- **Embed**: Data owned exclusively by one parent, always read together, bounded size (e.g., `preferredLanguages` on Customer).
- **Reference (ObjectId)**: Shared entities, large documents, or unbounded relationships (e.g., Booking → Customer, Booking → WellnessService).

### Validation Layers

1. **DTO + `class-validator`** — validates HTTP request input (app layer).
2. **Mongoose schema** — enforces shape before save (app layer).
3. **MongoDB JSON Schema Validation** — enforces rules at the database layer (Phase 2.4).

### Transaction Requirement

Multi-document ACID transactions (Phase 3.1) and Change Streams (Phase 3.2) require a **Replica Set**. For local development, run a single-node replica set. For cloud, use MongoDB Atlas (free M0 cluster).

---

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/wellness_center
# For Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/wellness_center
PORT=3000
```

`.env` is **never committed**. A `.env.example` with placeholder values should be kept in the repository.

---

## Key MongoDB Concepts by Phase

| Phase | Concepts                                              | Collections Introduced           |
| ----- | ----------------------------------------------------- | -------------------------------- |
| 1.3   | CRUD, filtering, `$in`, `$lte`                        | `wellnessservices`               |
| 1.4   | Embedded docs, array queries, projection              | `customers`                      |
| 1.5   | ObjectId references, `.populate()`, pagination        | `bookings`                       |
| 2.1   | Single + compound indexes, `explain()`                | — (indexes added to existing)    |
| 2.2   | Aggregation: `$match`, `$group`, `$lookup`, `$unwind` | — (analytics on existing)        |
| 2.3   | GeoJSON, `2dsphere` index, `$near`, `$geoWithin`      | `wellnesscenters`                |
| 2.4   | MongoDB JSON Schema Validation                        | —                                |
| 2.5   | Dynamic computed fields in pipeline                   | `reviews`                        |
| 3.1   | ACID transactions, sessions                           | `rooms`, `inventory`, `invoices` |
| 3.2   | Change Streams, oplog                                 | —                                |
| 3.3   | Repository Pattern, interface abstraction             | —                                |
| 3.4   | Atlas RBAC, backups, connection pooling               | —                                |

---

## Current Phase

> Update this line as you progress through the curriculum.

**Current**: Phase 1 — Project not yet initialized. Run `nest new wellness-center-hub` to start.
