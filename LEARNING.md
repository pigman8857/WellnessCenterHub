# MongoDB Learning Plan — Wellness Center Booking & Management System

### NestJS / TypeScript / Mongoose

> **How to use this guide**
> Each phase builds directly on the previous one. Read the concept explanation first, then implement the feature in the codebase. Every phase ends with a checkpoint — a list of things you should be able to do confidently before moving on. Do not skip checkpoints.

---

## Learning Contract

These are the agreed rules between you and your tutor (Claude Code) for this project.

| Rule                                            | Detail                                                                                                                                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **You write the code**                          | Claude will not generate implementation code unless you explicitly ask. Explanations use pseudocode outlines or commented examples to guide you, not complete solutions.                                  |
| **Project scaffold is provided**                | The initial folder structure and wiring (Phase 1.2) is scaffolded for you. Everything after that is yours to write.                                                                                       |
| **Production grade is the default target**      | Learning MongoDB in a toy way does not prepare you for real systems. Every pattern, index decision, and architectural choice is made as if this will go to production.                                    |
| **Clean Architecture is enforced from Phase 3** | Phases 1–2 use a flat, beginner-friendly layout. From Phase 3.3 onward, the codebase is refactored into a proper layered architecture (Domain → Application → Infrastructure → Presentation).             |
| **Ask for a code review any time**              | Claude will annotate your code with `// ⚠️ ISSUE:` and `// 💡 SUGGESTION:` comments. Code will not be rewritten — understanding the fix is your job.                                                      |
| **Unit tests are secondary — but intentional**  | Testing is not the main topic. However, you will learn how to mock Mongoose Models and Repository interfaces in NestJS TestBed. For each module type, one reference test is provided; you write the rest. |

---

## Clean Architecture — The Layered Structure

From Phase 3.3, all new code (and refactored old code) follows this layer model:

```
Presentation  ─── Controllers, Guards, Pipes, Interceptors
      │
Application   ─── Services (business logic), DTOs
      │
Domain        ─── Entity interfaces, Repository interfaces, business rules
      │                         (pure TypeScript — zero framework imports)
Infrastructure─── Mongoose Schemas, Repository implementations, external clients
```

**Dependency rule**: Outer layers import from inner layers. Inner layers never import from outer layers. The Application layer never imports Mongoose — only interfaces defined in Domain.

This is introduced gradually:

- **Phase 1–2**: Flat module layout (Controller → Service → Mongoose Model). Clean but not yet layered.
- **Phase 3.3**: Repository Pattern refactor introduces the Domain and Infrastructure layers formally.

---

---

## The Learning Stack

| Layer     | Tool                    | Why                                                                   |
| --------- | ----------------------- | --------------------------------------------------------------------- |
| Runtime   | Node.js + TypeScript    | Type safety surfaces MongoDB schema mismatches at compile time        |
| Framework | NestJS                  | Modular, opinionated — mirrors real enterprise backends               |
| ODM       | Mongoose                | Schema-on-application-side; the most common MongoDB companion in Node |
| Database  | MongoDB (local → Atlas) | What we are learning                                                  |

---

---

# PHASE 1 — Basic MongoDB: The Foundation

> Goal: Understand how MongoDB thinks about data — not tables and rows, but collections of flexible JSON documents. Learn to design, insert, query, and update those documents through NestJS.

---

## Phase 1.1 — What MongoDB Actually Is (Mindset Shift)

Before writing a single line of code, you must understand the mental model.

### Relational vs. Document

In SQL you model the world as normalized tables with foreign-key joins. MongoDB stores **documents** — self-describing JSON objects — inside **collections**. There are no joins forced on you, and documents within the same collection do not need to share an identical shape.

```
SQL                         MongoDB
─────────────────────────   ─────────────────────────
Database        →           Database
Table           →           Collection
Row             →           Document (BSON / JSON)
Column          →           Field
Primary Key     →           _id (auto-generated ObjectId)
JOIN            →           $lookup (aggregation) or embedded sub-document
```

### BSON — What MongoDB Actually Stores

BSON is Binary JSON. It adds types that plain JSON lacks:

- `ObjectId` — compact 12-byte unique identifier used as `_id`
- `Date` — true date type, not a string
- `Decimal128` — high-precision decimal for financial data (prices)
- `Int32 / Int64` — explicit integer sizes

You write JSON; Mongoose/the driver serialises it to BSON automatically.

### The Mongoose Layer in NestJS

```
NestJS Controller  →  Service  →  Mongoose Model  →  MongoDB
     (HTTP)          (business     (schema +            (data)
                       logic)       queries)
```

Mongoose gives you:

- **Schema** — the shape a document must have in your application code
- **Model** — a class that wraps a collection and gives you `.find()`, `.save()`, etc.
- **Document** — a single instance returned from the database

### Checkpoint 1.1

- [ ] You can explain what a document and a collection are.
- [ ] You can explain what `_id` / ObjectId is.
- [ ] You can explain why BSON has a `Date` type but JSON does not.

---

## Phase 1.2 — Project Scaffolding

### Initialize the NestJS project

```bash
npm i -g @nestjs/cli
nest new wellness-center-hub   # choose npm
cd wellness-center-hub

# Mongoose + NestJS integration
npm install @nestjs/mongoose mongoose

# Validation (used throughout all phases)
npm install class-validator class-transformer
npm install @nestjs/config
```

### Connect MongoDB to NestJS

In `app.module.ts`, add `MongooseModule.forRoot(...)`. Use an environment variable — never hard-code the connection string.

```typescript
// src/app.module.ts
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

Create a `.env` file (add to `.gitignore`):

```
MONGODB_URI=mongodb://localhost:27017/wellness_center
```

### Generate the first three modules

```bash
nest g module modules/services
nest g module modules/customers
nest g module modules/bookings

nest g controller modules/services
nest g controller modules/customers
nest g controller modules/bookings

nest g service modules/services
nest g service modules/customers
nest g service modules/bookings
```

### Checkpoint 1.2

- [ ] `npm run start:dev` runs without errors.
- [ ] MongoDB connects — you see no connection error in the terminal.
- [ ] You understand the NestJS module → controller → service flow.

---

## Phase 1.3 — Service Catalog: Your First Collection & CRUD

### Concept: Schema Design

Mongoose Schemas define the expected shape of a document. They live in your application — MongoDB itself does not enforce them (not yet; that comes in Phase 2). Think of them as TypeScript interfaces that also describe how data is stored.

### The Services Collection

Design thinking: A wellness service is a standalone entity. Nothing about it needs to be embedded inside another document — it is referenced by bookings.

```typescript
// src/modules/services/schemas/service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceDocument = WellnessService & Document;

@Schema({ timestamps: true }) // adds createdAt, updatedAt automatically
export class WellnessService {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  durationMinutes: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, enum: ['massage', 'meditation', 'herbal', 'beauty', 'retreat'] })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(WellnessService);
```

### CRUD Operations — Key Patterns

| Operation | Mongoose Method                                                    | SQL Equivalent        |
| --------- | ------------------------------------------------------------------ | --------------------- |
| Create    | `model.create(dto)`                                                | `INSERT INTO`         |
| Read all  | `model.find(filter)`                                               | `SELECT * WHERE`      |
| Read one  | `model.findById(id)`                                               | `SELECT * WHERE id =` |
| Update    | `model.findByIdAndUpdate(id, update, { returnDocument: 'after' })` | `UPDATE WHERE`        |
| Delete    | `model.findByIdAndDelete(id)`                                      | `DELETE WHERE`        |

**Key Option: `{ returnDocument: 'after' }`** — Without this, `findByIdAndUpdate` returns the document _before_ the update. Always pass `{ returnDocument: 'after' }` unless you specifically need the old version. (`{ new: true }` is the legacy equivalent — deprecated in Mongoose 7+.)

### Filtering — The Query Object

MongoDB queries are plain JavaScript objects. The field name is the key; the value is what you want to match.

```typescript
// Find all active massage services under 3000 THB
model.find({ category: 'massage', isActive: true, price: { $lte: 3000 } });
```

Common comparison operators:

- `$eq` — equals (default, rarely written explicitly)
- `$ne` — not equals
- `$gt / $gte` — greater than / greater than or equal
- `$lt / $lte` — less than / less than or equal
- `$in` — value is in an array: `{ category: { $in: ['massage', 'herbal'] } }`

### Pipes — Validating and Transforming Non-Body Input

`ValidationPipe` + DTO decorators handle **request body** data. For `@Query()` and `@Param()` values, the data arrives as raw strings with no DTO layer — pipes fill that gap.

#### Built-in pipes for query/route params

```typescript
// ParseEnumPipe — validates a single string against an enum
@Get('/filter/category')
async findByCategory(
  @Query('category', new ParseEnumPipe(ServiceCategory)) category: ServiceCategory,
)
// → rejects 'invalid' with 400, passes 'massage' as ServiceCategory.Massage

// ParseFloatPipe — coerces a query string to a number
@Get('/filter/price/min')
async findByMinPrice(
  @Query('min', new ParseFloatPipe()) min: number,
)
// → query strings are always string; without this pipe, min would be '100' not 100
```

#### Custom pipe — when built-ins aren't enough

When you need to split, trim, and validate a comma-separated query string into an enum array, write a `PipeTransform`:

```typescript
// PipeTransform<InputType, OutputType>
@Injectable()
export class ParseCategoryArrayPipe implements PipeTransform<string, ServiceCategory[]> {
  transform(value: string): ServiceCategory[] {
    // 1. split on comma
    // 2. trim whitespace
    // 3. filter empty strings
    // 4. validate each against the enum — throw BadRequestException if invalid
    // 5. return ServiceCategory[]
  }
}
```

#### When to use a pipe vs. DTO validation

| Input source | Validation approach                                 |
| ------------ | --------------------------------------------------- |
| `@Body()`    | `@IsEnum()` / other decorators in the DTO class     |
| `@Query()`   | `ParseEnumPipe`, `ParseFloatPipe`, or custom pipe   |
| `@Param()`   | `ParseEnumPipe`, `ParseIntPipe`, or `ParseUUIDPipe` |

> **Rule**: Pipes belong at the HTTP boundary for non-body inputs. DTOs belong at the body boundary. Never apply `ParseEnumPipe` to a `@Body()` field — use `@IsEnum()` in the DTO instead.

### Checkpoint 1.3 ✅ Complete

- [x] You can POST a new service and see it appear in MongoDB Compass.
- [x] You can GET all services filtered by `category`.
- [x] You can PATCH a service's price using `findByIdAndUpdate`.
- [x] You understand what `{ returnDocument: 'after' }` does and why you need it.
- [x] `ValidationPipe` with `whitelist: true` rejects invalid and missing fields with `400`.
- [x] `HydratedDocument<T>` used instead of the legacy `WellnessService & Document` intersection.
- [x] Comparison operator methods added to `ServicesService`: `$gt`, `$gte`, `$lte`, `$ne`, `$exists`, `$in`.
- [x] Custom `ParseCategoryArrayPipe` (`PipeTransform<string, ServiceCategory[]>`) — splits, trims, filters empty strings, validates enum membership, throws `BadRequestException` for invalid or missing input.
- [x] `ParseEnumPipe(ServiceCategory)` applied to single-category filter and exclude endpoints for consistent validation.
- [x] `ParseFloatPipe` applied to price query params — query strings are always `string`; a pipe is required to coerce to `number`.

---

## Phase 1.4 — Customer Profiles: Embedding

> **Scope note:** This phase covers the _embed_ side of the embed-vs-reference decision. You will learn the full decision rule here, but only practice embedding. Referencing (ObjectId links between collections) is practiced in Phase 1.5 when the Booking schema links to both Customer and WellnessService.

### Concept: Embed or Reference?

This is the most important schema design decision in MongoDB.

**Embed** when:

- The data is always read together with the parent.
- The embedded data belongs exclusively to one parent.
- The embedded array is bounded (will not grow without limit).

**Reference** (store just the ObjectId) when:

- The child document is shared by many parents.
- The child document is large and often queried independently.
- The child array could grow without a predictable limit.

### The Customers Collection — Embedding Preferred Languages

A customer's preferred languages are always small, always read with the customer, and belong to only that customer → **embed**.

```typescript
@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ enum: ['local', 'international'], default: 'local' })
  customerType: string;

  // Embedded array — the correct choice here
  @Prop({ type: [String], default: [] })
  preferredLanguages: string[];

  @Prop({ type: Date })
  dateOfBirth: Date;
}
```

### Querying an Embedded Array

MongoDB can filter documents based on values inside embedded arrays as if they were flat fields:

```typescript
// Find all customers who speak Thai
model.find({ preferredLanguages: 'th' });

// Find customers who speak EITHER English OR Japanese
model.find({ preferredLanguages: { $in: ['en', 'ja'] } });

// Find customers who speak BOTH English AND Thai
model.find({ preferredLanguages: { $all: ['en', 'th'] } });
```

### Projection — Only Fetch What You Need

```typescript
// Return name and email only — exclude _id, __v, everything else
model.find({}, { firstName: 1, lastName: 1, email: 1, _id: 0 });
```

`1` = include, `0` = exclude. You cannot mix includes and excludes (except for `_id`).

### Checkpoint 1.4 ✅ Complete

- [x] `Customer` schema with embedded `Address` sub-document and `EmergencyContact[]` array of objects.
- [x] Embedded sub-document schemas use `@Schema({ _id: false })` — no auto-id on nested objects.
- [x] `create-customer.dto.ts` — `@ValidateNested()` + `@Type()` for nested objects, `@IsString({ each: true })` for arrays, `@IsDateString()` for dates.
- [x] `update-customer.dto.ts` — `PartialType(CreateCustomerDto)`.
- [x] Service implements CRUD + three array query methods using exact field match, `$in`, and `$all`.
- [x] Controller wired up with all endpoints (specific routes before `:id`).
- [x] `GET /customers/projection` uses MongoDB projection + `.lean()` + `ClassSerializerInterceptor` + `@Expose()` to return a shaped response DTO (`CustomerSummaryDto`).
- [x] You can POST a customer with an embedded address and see it in MongoDB Compass.
- [x] You can GET customers filtered by a value inside `preferredLanguages`.
- [x] You understand what a projection does and have called `findAllWithOnlyNameAndEmail`.

---

## Phase 1.5 — Basic Bookings: Referencing Between Collections

### Concept: References with ObjectId

A booking links a customer to a service. Both Customer and WellnessService are large, shared, independently queryable — they should be **referenced**, not embedded.

```typescript
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
  customer: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'WellnessService', required: true })
  service: mongoose.Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  startTime: string; // "14:00"

  @Prop({
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop()
  specialRequests: string;

  @Prop({ type: Number })
  totalPrice: number;
}
```

### The Two ObjectId Types — A Common Confusion

Mongoose uses two different `ObjectId` identifiers that look similar but serve different purposes:

| Identifier                       | Where used                    | What it is                                                       |
| -------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| `mongoose.Schema.Types.ObjectId` | Inside `@Prop({ type: ... })` | Schema-level instruction — tells Mongoose how to store the field |
| `mongoose.Types.ObjectId`        | TypeScript property type      | Runtime value type — the actual ObjectId instance in memory      |

```typescript
// Correct — schema type and TS type are different things
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
customer: mongoose.Types.ObjectId;  // ← runtime value type

// Wrong — do not use Schema.Types.ObjectId as the TS type
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
customer: mongoose.Schema.Types.ObjectId;  // ← this is a schema descriptor, not a value
```

Think of it this way: `Schema.Types.ObjectId` is the **instruction** ("store this as an ObjectId"), and `Types.ObjectId` is the **thing you actually hold** after a query.

### The `ref` String Must Match Exactly

The string you pass to `ref:` must exactly match the `name:` used when registering the model with `MongooseModule.forFeature()`:

```typescript
// bookings.schema.ts
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
//                                                   ↑ must match ↓

// customers.module.ts
MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }])
```

> **Silent bug**: If the strings do not match, `.populate('customer')` returns `null` — no error is thrown. This is one of the most common hard-to-diagnose bugs with Mongoose references.

### What Gets Stored in MongoDB

Only the ObjectId is written to the booking document — never the full object:

```json
{
  "_id": "664a1f...",
  "customer": "663f8b2a1c4e5f0012345678",
  "service": "663f8b2a1c4e5f0087654321",
  "appointmentDate": "2026-04-15T09:00:00Z",
  "startTime": "09:00",
  "status": "pending"
}
```

The full `Customer` and `WellnessService` documents stay in their own collections. The booking holds only a **pointer**.

### Populating References — `.populate()`

When you store a reference, you store only the ObjectId. To get the full document, use `.populate()`:

```typescript
// Without populate — you get the raw ObjectId back
const booking = await this.bookingModel.findById(id);
booking.customer; // → ObjectId('663f8b2a...')  ← not useful to a client

// With populate — Mongoose runs a second query and replaces the ObjectId
const booking = await this.bookingModel
  .findById(id)
  .populate('customer', 'firstName lastName email') // only these fields
  .populate('service', 'name price durationMinutes');
booking.customer; // → { firstName: 'Nadia', lastName: 'Lee', email: '...' }
```

**Important**: Population is a second database query behind the scenes — not a free JOIN. Do not over-populate. Only populate what the response actually needs, and always specify a projection (the second argument) to avoid fetching the entire document.

### Module Wiring — What to Import and Why

`BookingsModule` only needs to register its own schema:

```typescript
// bookings.module.ts
MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]);
```

It does **not** need to import `CustomersModule` or `ServicesModule`. Here is why.

#### NestJS `imports:[]` vs. Mongoose connection

These two things are completely separate:

|                                    | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| NestJS `imports: [OtherModule]`    | Makes another module's **services and providers** available for injection |
| `MongooseModule.forFeature([...])` | Registers a **Mongoose model** on the shared DB connection                |

`.populate()` is resolved by Mongoose at query time — it looks up the named model on the **connection**, not through the NestJS DI container. As long as `CustomerSchema` is registered somewhere in the app (inside `CustomersModule`), the `'Customer'` model exists on the connection and `.populate('customer')` will find it.

```
NestJS DI container                    Mongoose connection
─────────────────────                  ──────────────────────────────
BookingsModule                         models registered on connection:
  └─ BookingsService          ──────►    'Booking'         ← from BookingsModule
  └─ BookingsController                  'Customer'        ← from CustomersModule
                                         'WellnessService' ← from ServicesModule

.populate('customer') → asks the connection → finds 'Customer' model → runs query
```

#### When you would import another module

Only import `CustomersModule` into `BookingsModule` if you need to **inject `CustomersService`** — for example, to validate that a `customerId` actually exists before saving a booking. That kind of cross-service call requires DI, which requires the module import.

For Phase 1.5, that check is skipped. The ObjectId format is validated by the DTO, and existence validation becomes part of a transaction in Phase 3.

#### Making `ref:` rename-safe

The `ref:` string in a schema prop is still a hardcoded literal by default. To eliminate the silent mismatch bug entirely, import the referenced class and use its `.name` property:

```typescript
// Instead of a hardcoded string:
@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })

// Production pattern — rename-safe:
import { Customer } from '../../customers/schemas/customer.schema';
@Prop({ type: MongooseSchema.Types.ObjectId, ref: Customer.name, required: true })
```

`Customer.name` resolves to the string `'Customer'` at runtime — zero performance cost, but if the class is ever renamed the ref updates automatically. No circular dependency risk as long as the referenced schema does not import back from the booking schema.

### Checking for Conflicts — Availability Logic

Before confirming a booking, check that the time slot is not already taken:

```typescript
async isSlotAvailable(serviceId: string, date: Date, startTime: string): Promise<boolean> {
  const conflict = await this.bookingModel.findOne({
    service: serviceId,
    appointmentDate: date,
    startTime,
    status: { $nin: ['cancelled'] },  // $nin = "not in"
  });
  return conflict === null;
}
```

### Sorting and Pagination

Chain the query methods in this order: `find()` → `sort()` → `skip()` → `limit()`:

```typescript
// Page 2, 10 items per page, newest first
model
  .find({ status: 'confirmed' })
  .sort({ appointmentDate: -1 }) // -1 = descending, 1 = ascending
  .skip(10) // skip first page
  .limit(10); // take 10
```

**Pagination formula**: `skip = (page - 1) * limit`

| page | limit | skip | result      |
| ---- | ----- | ---- | ----------- |
| 1    | 10    | 0    | items 1–10  |
| 2    | 10    | 10   | items 11–20 |
| 3    | 10    | 20   | items 21–30 |

`find()` never returns `null` — it returns an empty array `[]` when nothing matches. Do not type the return as `Promise<T[] | null>`.

### Populate with Pagination — Query Cost

When `.populate()` is chained after a paginated `.find()`, Mongoose executes **three separate database queries**:

1. One query to fetch the matching bookings (sort + skip + limit applied here)
2. One query to fetch all referenced `Customer` documents for that page
3. One query to fetch all referenced `WellnessService` documents for that page

This is the cost of `.populate()` at scale. For Phase 1.5 this is acceptable. In Phase 2.2, the aggregation pipeline (`$lookup`) is introduced as a single-query alternative.

### Skip-Based Pagination — Limitations

`(page - 1) * limit` is the standard formula for offset pagination and is correct for Phase 1.5. However, it has two known production problems:

**1. Cursor drift** — data changes between page requests cause items to be skipped or duplicated:

```
User loads page 1 → sees bookings 1–10
Booking #3 is cancelled and deleted
User loads page 2 → .skip(10) now skips a shifted set
                  → booking #11 (now #10) is never seen
```

**2. Performance at depth** — `skip(10000)` makes MongoDB scan and discard 10,000 documents before returning results. Gets slower the deeper the page.

### The Production Alternative — Keyset Pagination

Instead of skipping, pass the last seen value as a filter cursor:

```typescript
// First page — no cursor
model.find().sort({ appointmentDate: 1 }).limit(10);

// Next page — pass the last appointmentDate from the previous response
model
  .find({ appointmentDate: { $gt: lastSeenDate } })
  .sort({ appointmentDate: 1 })
  .limit(10);
```

No skip, no drift, constant performance regardless of depth. This is what production APIs use for infinite scroll and "load more" patterns.

| Scenario                                  | Recommended                                      |
| ----------------------------------------- | ------------------------------------------------ |
| Admin panel, small dataset, low traffic   | `skip()` — simpler                               |
| Public API, large dataset, real-time data | Keyset pagination                                |
| Infinite scroll / "load more"             | Keyset pagination                                |
| Numbered pages ("go to page 47")          | `skip()` — keyset cannot jump to arbitrary pages |

For Phase 1.5, `skip()` is the right starting point. Keyset pagination becomes relevant in Phase 2 when indexes and query performance are the focus.

### Checkpoint 1.5 ✅ Complete

- [x] A new booking correctly stores ObjectId references (not the full objects).
- [x] `.populate()` returns enriched booking data.
- [x] You can list upcoming bookings sorted by date.
- [x] Booking a slot that is already taken returns an appropriate error.
- [x] Conflict check uses `$nin: ['cancelled']` — cancelled bookings free the slot for rebooking.
- [x] `ParseIntPipe` applied to `page` and `limit` query params — query strings coerced to integers.
- [x] `ref: Customer.name` / `ref: WellnessService.name` used instead of hardcoded strings — rename-safe.

---

## Phase 1 — Summary

### MongoDB Concepts

**Schema Design — Embed vs. Reference**

- Embed when data is owned by one parent, always read together, bounded size (`Address`, `EmergencyContact[]` on Customer)
- Reference (ObjectId) when data is shared, large, or independently queryable (`Booking → Customer`, `Booking → WellnessService`)

**CRUD Operations**

- `create()`, `find()`, `findById()`, `findByIdAndUpdate()`, `findByIdAndDelete()`
- `{ returnDocument: 'after' }` — returns the updated document (Mongoose 7+; `{ new: true }` is deprecated)

**Query Operators**

- Comparison: `$gt`, `$gte`, `$lte`, `$ne`, `$in`, `$nin`, `$exists`
- Array queries: exact match, `$in` (any of), `$all` (all of)

**ObjectId References**

- `Schema.Types.ObjectId` (schema descriptor) vs. `Types.ObjectId` (runtime value) — different things, often confused
- `ref: Customer.name` instead of `ref: 'Customer'` — rename-safe, prevents silent `null` bug on populate mismatch
- `ref:` is resolved at the **connection level**, not the NestJS module level — no need to import other modules just for populate

**`.populate()`**

- Replaces stored ObjectIds with full documents at query time
- Always specify a projection (second argument) — avoids over-fetching and accidental sensitive field exposure
- Costs one extra DB round-trip per populated field (3 total with two populates)

**Pagination**

- `.sort()` → `.skip()` → `.limit()` chain
- Formula: `skip = (page - 1) * limit`
- `find()` never returns `null` — returns `[]` when nothing matches
- Limitation: cursor drift when data changes between pages → keyset pagination (`$gt: lastSeenValue`) is the production alternative for large/live datasets

**Conflict Check with `$nin`**

- `$nin: ['cancelled']` excludes cancelled bookings from slot availability checks
- Cancelled bookings free the slot; all other statuses (`pending`, `confirmed`, `in-progress`, `completed`) hold it
- `$nin` preferred over `$ne` — easy to extend with additional excluded values

---

### NestJS / Architecture Concepts

**Validation layers**

- `@Body()` → DTO + `class-validator` decorators (`@IsEnum`, `@IsMongoId`, `@IsDate`, `@IsNumber`)
- `@Query()` / `@Param()` → pipes (`ParseIntPipe`, `ParseEnumPipe`, custom `PipeTransform`)
- `@Type(() => Date)` from `class-transformer` required to coerce ISO strings to `Date` before `@IsDate()` validates

**NestJS module wiring**

- `MongooseModule.forFeature()` registers models on the **shared connection** — not scoped to a module
- `imports: [OtherModule]` is for DI (injecting services), not for making Mongoose models available to populate

**Pipe instantiation**

- No `new` when no constructor args needed (`ParseIntPipe`, `ParseCategoryArrayPipe`)
- `new` only when passing constructor args (`new ParseEnumPipe(ServiceCategory)`)

**Route ordering**

- Static routes (`GET /inactive`, `GET /projection`) must be declared **before** dynamic routes (`GET /:id`) — NestJS matches top to bottom; a dynamic route will swallow static ones below it
- `@Get()` and `@Get('')` are **identical routes** — both resolve to `GET /customers`. NestJS registers and matches the first one; the second handler is never reached. Use a distinct path (e.g. `@Get('search')`) or merge the query param into the existing `@Get()` handler as an optional `@Query()` param.

**`@Query()` param guards**

- A `@Query('email') email: string` param is `undefined` if the caller omits `?email=`. Passing `undefined` directly to `findOne({ email: undefined })` does not throw — Mongoose runs the query and may return unexpected results (e.g. the first document without that field).
- Always guard optional query params before using them: throw `BadRequestException` if the param is required, or branch on `undefined` if it is truly optional.

---

### Production Patterns Applied

| Pattern                                     | Why                                                             |
| ------------------------------------------- | --------------------------------------------------------------- |
| `ref: Customer.name`                        | Rename-safe — prevents silent `null` on populate mismatch       |
| `@IsMongoId()` on ID inputs                 | Rejects malformed ObjectId strings at the HTTP boundary         |
| `ParseIntPipe` on page/limit                | Query strings are always strings — pipes coerce at the boundary |
| `.populate()` with projection               | Avoids over-fetching and leaking sensitive fields               |
| `$nin` over `$ne` for exclusions            | Future-proof — easy to add more excluded statuses               |
| `private readonly` on injected dependencies | Prevents accidental reassignment after construction             |

---

## Phase 1 — Final Checkpoint

Before moving to Phase 2, you must be able to do all of the following without looking at notes:

- [x] Design a schema with embedded sub-documents and referenced ObjectIds.
- [x] Perform all five CRUD operations using Mongoose in a NestJS service.
- [x] Write a query using at least two comparison operators (`$gte`, `$in`, etc.).
- [x] Populate a referenced field in a single query.
- [x] Explain why you would embed `preferredLanguages` but reference `service` in a booking.
- [x] Apply `.sort()`, `.skip()`, and `.limit()` for paginated results.

---

---

# PHASE 2 — Intermediate MongoDB: Complexity & Performance

> Goal: Move beyond simple CRUD. Learn to make queries fast with indexes, transform data with the Aggregation Pipeline, query by geography, enforce data rules at the database level, and build a review system with dynamic computed fields.

---

## Phase 2.1 — Indexes: Making Queries Fast

### Concept: What an Index Is

Without an index, MongoDB reads every document in the collection to find matches — a **collection scan**. An index is a separate, sorted data structure that points MongoDB directly to the matching documents, like the index of a book.

Every collection has one index by default: `_id`. You must create all others.

### The Cost of Indexes

Indexes speed up reads but slow down writes, because every insert, update, and delete must also update every index on that collection. Only index fields you actually query on.

### Single Field Index

```typescript
// In your schema file, after SchemaFactory.createForClass(...)
CustomerSchema.index({ email: 1 }); // 1 = ascending
```

Or via Mongoose decorator:

```typescript
@Prop({ required: true, unique: true })
email: string;
```

`unique: true` creates a unique index — MongoDB will reject duplicate values.

> **`unique: true` vs `index: true`**: `unique: true` already implies an index — adding `index: true` alongside it is redundant. Mongoose merges them into one index, so no double-index bug, but it signals a misunderstanding of what `unique` does. Only add `index: true` on its own when you want a plain (non-unique) index via the decorator. If you also want `.index()` called explicitly at the bottom, remove `index: true` / `unique: true` from the `@Prop` to avoid defining the same index twice.

### Compound Index

A compound index covers queries that filter on multiple fields together. The **order** and **direction** of fields matters — it must match your most common query pattern.

```typescript
// Bookings: quickly find all bookings for a service on a specific date
BookingSchema.index({ appointmentDate: 1, service: 1 });

// This index supports:  find({ appointmentDate, service })
// This index supports:  find({ appointmentDate })         ← left-prefix rule
// This DOES NOT help:   find({ service })                 ← not the leftmost field
```

**Left-prefix rule**: A compound index on `(A, B, C)` also accelerates queries on `(A)` and `(A, B)`, but NOT on `(B)` or `(C)` alone.

### Verifying Index Usage — `explain()`

```typescript
// Run in MongoDB Shell or Compass
db.bookings
  .find({ appointmentDate: new Date('2026-04-01'), service: ObjectId('...') })
  .explain('executionStats');
```

Look for `"winningPlan"` → `"IXSCAN"` (index scan). If you see `"COLLSCAN"` (collection scan), your index is not being used.

### Checkpoint 2.1 ✅ Complete

- [x] You have a unique index on `Customer.email` — `unique: true` on `@Prop()` creates it implicitly; `index: true` alongside it is redundant.
- [x] You have a compound index on `Booking` for `(appointmentDate, service)` — declared via `BookingSchema.index({ appointmentDate: 1, service: 1 })` after `SchemaFactory.createForClass()`.
- [x] `explain('executionStats')` confirmed `IXSCAN` on `appointmentDate_1_service_1` for both-field and date-only queries; `COLLSCAN` for service-only query (left-prefix violation).
- [x] Left-prefix rule verified: `find({ appointmentDate, service })` → `IXSCAN`; `find({ appointmentDate })` → `IXSCAN` with open `service` bounds `[MinKey, MaxKey]`; `find({ service })` → `COLLSCAN`, `totalKeysExamined: 0`.
- [x] `explain()` implemented as a dedicated NestJS service method + controller endpoint (`GET /bookings/by-date/explain`) — not mixed into the real query method.
- [x] Left-prefix violation tested via VS Code MongoDB Playground (`use('wellness_center')`) — API layer correctly rejects the query (missing required `date` param), so DB-level proof requires going direct.

---

## Phase 2.2 — The Aggregation Pipeline: Transforming Data

### Concept: What the Pipeline Is

The Aggregation Pipeline is MongoDB's data transformation engine. It processes documents through a sequence of **stages**, where each stage's output becomes the next stage's input. Think of it as a Unix pipe `|` for your database.

```
Collection → [ $match ] → [ $group ] → [ $sort ] → [ $project ] → Result
```

Each stage is an object inside an array. Order matters.

### Core Stages

| Stage        | Purpose                                     | SQL Analogy                |
| ------------ | ------------------------------------------- | -------------------------- |
| `$match`     | Filter documents                            | `WHERE`                    |
| `$group`     | Group + accumulate                          | `GROUP BY` + aggregates    |
| `$sort`      | Order the results                           | `ORDER BY`                 |
| `$project`   | Shape the output fields                     | `SELECT`                   |
| `$limit`     | Take first N                                | `LIMIT`                    |
| `$skip`      | Skip first N                                | `OFFSET`                   |
| `$lookup`    | Join another collection                     | `JOIN`                     |
| `$unwind`    | Flatten an array field into individual docs | (no direct SQL equivalent) |
| `$addFields` | Add computed fields                         | Computed columns           |

### Pipeline 1: Monthly Revenue Report

```typescript
async getMonthlyRevenue(year: number) {
  return this.bookingModel.aggregate([
    // Stage 1: Only completed bookings in the given year
    {
      $match: {
        status: 'completed',
        appointmentDate: {
          $gte: new Date(`${year}-01-01`),
          $lt:  new Date(`${year + 1}-01-01`),
        },
      },
    },
    // Stage 2: Group by month, sum totalPrice
    {
      $group: {
        _id: { $month: '$appointmentDate' },   // extract month number 1–12
        totalRevenue: { $sum: '$totalPrice' },
        bookingCount: { $sum: 1 },
      },
    },
    // Stage 3: Sort by month ascending
    { $sort: { _id: 1 } },
    // Stage 4: Rename _id to month for readability
    {
      $project: {
        _id: 0,
        month: '$_id',
        totalRevenue: 1,
        bookingCount: 1,
      },
    },
  ]);
}
```

**Key accumulator operators in `$group`:**

- `$sum` — add values (use `1` to count documents)
- `$avg` — average
- `$min / $max` — minimum/maximum
- `$push` — collect values into an array
- `$first / $last` — first/last value in each group

### Pipeline 2: Top 3 Most Popular Services

```typescript
async getTopServices(limit = 3) {
  return this.bookingModel.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $group: {
        _id: '$service',             // group by service ObjectId
        bookingCount: { $sum: 1 },
      },
    },
    { $sort: { bookingCount: -1 } },
    { $limit: limit },
    // Join with the services collection to get service name
    {
      $lookup: {
        from: 'wellnessservices',    // MongoDB collection name (lowercase plural)
        localField: '_id',
        foreignField: '_id',
        as: 'serviceDetails',
      },
    },
    { $unwind: '$serviceDetails' },  // flatten the array from $lookup
    {
      $project: {
        _id: 0,
        serviceName: '$serviceDetails.name',
        category: '$serviceDetails.category',
        bookingCount: 1,
      },
    },
  ]);
}
```

### Pipeline 3: Average Duration by Customer Type

```typescript
async getAvgDurationByCustomerType() {
  return this.bookingModel.aggregate([
    { $match: { status: 'completed' } },
    // Join customers
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerData',
      },
    },
    { $unwind: '$customerData' },
    // Join services to get duration
    {
      $lookup: {
        from: 'wellnessservices',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceData',
      },
    },
    { $unwind: '$serviceData' },
    {
      $group: {
        _id: '$customerData.customerType',
        avgDurationMinutes: { $avg: '$serviceData.durationMinutes' },
        totalBookings: { $sum: 1 },
      },
    },
    {
      $project: {
        customerType: '$_id',
        avgDurationMinutes: { $round: ['$avgDurationMinutes', 1] },
        totalBookings: 1,
        _id: 0,
      },
    },
  ]);
}
```

### Checkpoint 2.2

- [ ] You can explain what each stage in a pipeline does before running it.
- [ ] The monthly revenue pipeline returns correct data (verify manually with a few test bookings).
- [ ] You understand why `$unwind` is needed after `$lookup`.
- [ ] You understand the difference between `$project` in the aggregation pipeline vs. Mongoose projection.

---

## Phase 2.3 — Geospatial Queries: Location-Based Search

### Concept: GeoJSON and 2dsphere Index

MongoDB understands geographic coordinates natively via **GeoJSON**. A GeoJSON `Point` stores longitude first, then latitude (the opposite of most mapping apps — be careful).

```json
{ "type": "Point", "coordinates": [100.5018, 13.7563] }
//                                  ↑ longitude  ↑ latitude
//                                  Bangkok
```

To run geospatial queries, you **must** create a `2dsphere` index on the location field.

### Adding Location to Wellness Centers

Create a `WellnessCenter` collection (or add to an existing one):

```typescript
@Schema()
class GeoPoint {
  @Prop({ type: String, enum: ['Point'], required: true })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[]; // [longitude, latitude]
}

const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ timestamps: true })
export class WellnessCenter {
  @Prop({ required: true })
  name: string;

  @Prop({ type: GeoPointSchema, index: '2dsphere' })
  location: GeoPoint;

  // ... other fields
}
```

### Near Query — Find Centers Within X km

```typescript
async findNearby(longitude: number, latitude: number, radiusKm: number) {
  return this.centerModel.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusKm * 1000,  // MongoDB uses meters
      },
    },
  });
}
```

`$near` returns results sorted closest-first automatically.

### Within a Shape — `$geoWithin`

```typescript
// Find all centers within a geographic bounding box (useful for map views)
model.find({
  location: {
    $geoWithin: {
      $box: [
        [100.4, 13.6], // bottom-left [lon, lat]
        [100.6, 13.9], // top-right   [lon, lat]
      ],
    },
  },
});
```

### Checkpoint 2.3

- [ ] You can insert a wellness center with a GeoJSON Point location.
- [ ] The `2dsphere` index is confirmed in Compass under Indexes.
- [ ] A GET request with `?lat=13.7563&lng=100.5018&radius=5` returns correctly ordered results.
- [ ] You remember that GeoJSON uses `[longitude, latitude]` order.

---

## Phase 2.4 — Schema Validation: Enforcing Rules at the Database Level

### Concept: Why Database-Level Validation?

Mongoose schemas enforce structure at the _application_ layer. If someone bypasses your API and writes directly to MongoDB, those rules are skipped. MongoDB's native **JSON Schema Validation** enforces rules at the _database_ layer — no write can violate them, regardless of source.

### Applying Validation in Mongoose

```typescript
// In your module's MongooseModule.forFeature([...])
{
  name: WellnessService.name,
  schema: ServiceSchema,
  collection: 'wellnessservices',
}

// After schema creation, add native MongoDB validation
ServiceSchema.set('validateBeforeSave', true);
```

Or apply directly in MongoDB shell / Compass:

```javascript
db.runCommand({
  collMod: 'bookings',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customer', 'service', 'appointmentDate', 'status'],
      properties: {
        totalPrice: {
          bsonType: 'number',
          minimum: 0,
          description: 'Price must be a non-negative number',
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        },
      },
    },
  },
  validationLevel: 'strict', // enforce on all inserts and updates
  validationAction: 'error', // reject invalid documents (vs. 'warn')
});
```

### Checkpoint 2.4

- [ ] Attempting to insert a booking with a negative `totalPrice` is rejected by MongoDB.
- [ ] You can explain the difference between `validationLevel: 'strict'` and `'moderate'`.
- [ ] You understand why application-level (Mongoose) and database-level validation serve different purposes.

---

## Phase 2.5 — Review System: Computed Fields with Aggregation

### Concept: Don't Store What You Can Compute

Storing a precomputed average rating in the service document creates a **synchronization problem** — every new review must update it, and if that update fails, the stored average is wrong. Instead, compute it fresh using the aggregation pipeline each time it is needed.

### Reviews Collection

Reviews are tied to one service and one customer → **reference both**.

```typescript
@Schema({ timestamps: true })
export class Review {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true })
  customer: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'WellnessService', required: true })
  service: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, minlength: 10, maxlength: 500 })
  comment: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true })
  booking: mongoose.Types.ObjectId; // ensure one review per booking
}

// Prevent duplicate reviews for the same booking
ReviewSchema.index({ booking: 1 }, { unique: true });
```

### Aggregation: Dynamic Average Rating in Service Catalog

When returning the service catalog, compute ratings on the fly:

```typescript
async getServicesWithRatings() {
  return this.serviceModel.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'service',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    // Don't send the full reviews array to the client
    { $project: { reviews: 0 } },
    { $sort: { averageRating: -1 } },
  ]);
}
```

### Checkpoint 2.5

- [ ] A customer cannot submit two reviews for the same booking (unique index enforces this).
- [ ] The service catalog endpoint includes `averageRating` and `reviewCount`.
- [ ] Adding a new review immediately reflects in the average (no stale cache).
- [ ] You can explain why you don't store the average in the Service document.

---

## Phase 2 — Final Checkpoint

- [ ] You can write an aggregation pipeline from memory using at least: `$match`, `$group`, `$lookup`, `$unwind`, `$project`.
- [ ] You know when to use `$near` vs `$geoWithin`.
- [ ] You can design a compound index for a given query pattern and explain the left-prefix rule.
- [ ] You understand the difference between Mongoose schema validation and MongoDB JSON Schema Validation.
- [ ] You can use `.explain()` to verify whether a query uses an index.

---

---

# PHASE 3 — Advanced MongoDB: Enterprise & Architecture

> Goal: Handle scenarios where data consistency, real-time reactivity, scalability, and clean architecture become non-negotiable. This phase mirrors how production systems at scale actually work.

---

## Phase 3.1 — ACID Transactions: Multi-Document Atomicity

### Concept: Why Transactions

MongoDB is atomic at the single-document level by default. If you need to update multiple documents and guarantee that either _all_ succeed or _none_ do, you need a **multi-document ACID transaction**.

ACID means:

- **Atomic** — all operations commit or all roll back
- **Consistent** — the database moves from one valid state to another
- **Isolated** — concurrent transactions do not interfere
- **Durable** — committed data survives crashes

**Requirement**: Transactions require a MongoDB **Replica Set** or **Atlas** cluster. Standalone MongoDB does not support them.

### Implementing the Full-Day Retreat Booking

```typescript
async bookFullDayRetreat(dto: RetreatBookingDto) {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    // 1. Reserve the VIP room — will fail if already reserved
    const room = await this.roomModel.findOneAndUpdate(
      { _id: dto.roomId, isAvailable: true },
      { isAvailable: false, reservedBy: dto.customerId },
      { new: true, session },           // ← pass session to every operation
    );
    if (!room) throw new ConflictException('Room is not available');

    // 2. Deduct inventory
    const inventory = await this.inventoryModel.findOneAndUpdate(
      {
        _id: dto.inventoryId,
        quantity: { $gte: dto.requiredQuantity },  // atomic check + deduct
      },
      { $inc: { quantity: -dto.requiredQuantity } },
      { new: true, session },
    );
    if (!inventory) throw new ConflictException('Insufficient inventory');

    // 3. Create the booking
    const [booking] = await this.bookingModel.create(
      [{ customer: dto.customerId, service: dto.serviceId, /* ... */ }],
      { session },
    );

    // 4. Create the invoice
    await this.invoiceModel.create(
      [{ booking: booking._id, amount: dto.totalPrice, /* ... */ }],
      { session },
    );

    await session.commitTransaction();
    return booking;

  } catch (error) {
    await session.abortTransaction();  // rolls back ALL four operations
    throw error;

  } finally {
    session.endSession();
  }
}
```

**Critical**: Every Mongoose operation inside a transaction must receive `{ session }`. Without it, the operation runs outside the transaction and will not be rolled back.

### Checkpoint 3.1

- [ ] You are running MongoDB as a replica set (or using Atlas).
- [ ] When inventory is insufficient, no room is left reserved and no booking is created.
- [ ] You can explain ACID in the context of this booking example.

---

## Phase 3.2 — Change Streams: Real-Time Database Events

### Concept: What Change Streams Are

Change Streams let your application subscribe to a stream of changes on a collection (or the entire database). Every insert, update, delete, or replace emits an event. This is built on MongoDB's replication oplog.

**Requirement**: Same as transactions — requires a Replica Set or Atlas.

### Watching the Bookings Collection

```typescript
// src/modules/bookings/booking-watcher.service.ts
@Injectable()
export class BookingWatcherService implements OnModuleInit, OnModuleDestroy {
  private changeStream: mongoose.mongo.ChangeStream;

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private notificationService: NotificationService,
  ) {}

  onModuleInit() {
    this.changeStream = this.bookingModel.watch(
      [
        // Filter: only react to inserts and updates that change status
        {
          $match: {
            $or: [
              { operationType: 'insert' },
              {
                operationType: 'update',
                'updateDescription.updatedFields.status': { $exists: true },
              },
            ],
          },
        },
      ],
      { fullDocument: 'updateLookup' }, // include full doc on updates
    );

    this.changeStream.on('change', (event) => {
      if (event.operationType === 'insert') {
        this.notificationService.sendBookingConfirmation(event.fullDocument);
      }
      if (event.operationType === 'update') {
        const newStatus = event.updateDescription.updatedFields?.status;
        if (newStatus === 'cancelled') {
          this.notificationService.sendCancellationAlert(event.fullDocument);
        }
      }
    });
  }

  onModuleDestroy() {
    this.changeStream.close();
  }
}
```

### Checkpoint 3.2

- [ ] Creating a new booking triggers a log (or mock notification) via the change stream.
- [ ] Cancelling a booking triggers the cancellation handler.
- [ ] The change stream closes cleanly when the application shuts down.

---

## Phase 3.3 — Repository Pattern: Separating Business Logic from Database

### Concept: Why This Matters

Controllers should not know about Mongoose. Services should express business rules, not database syntax. The Repository Pattern places all database interaction in a dedicated class that implements a technology-agnostic interface.

Benefits:

- You can swap Mongoose for the native MongoDB driver (or PostgreSQL) without changing your service logic.
- Unit tests can use a mock repository instead of a real database.
- Database query complexity is hidden from business code.

### Implementation

```typescript
// src/modules/bookings/interfaces/booking.repository.interface.ts
export interface IBookingRepository {
  create(dto: CreateBookingDto): Promise<BookingDocument>;
  findById(id: string): Promise<BookingDocument | null>;
  findUpcoming(customerId: string): Promise<BookingDocument[]>;
  updateStatus(id: string, status: string): Promise<BookingDocument>;
  isSlotAvailable(serviceId: string, date: Date, startTime: string): Promise<boolean>;
}

// src/modules/bookings/repositories/booking.repository.ts
@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(@InjectModel(Booking.name) private model: Model<BookingDocument>) {}

  async create(dto: CreateBookingDto) {
    return this.model.create(dto);
  }

  async isSlotAvailable(serviceId: string, date: Date, startTime: string) {
    const conflict = await this.model.findOne({
      service: serviceId,
      appointmentDate: date,
      startTime,
      status: { $nin: ['cancelled'] },
    });
    return conflict === null;
  }
  // ...
}

// src/modules/bookings/bookings.service.ts
@Injectable()
export class BookingsService {
  constructor(private readonly bookingRepo: IBookingRepository) {}

  async createBooking(dto: CreateBookingDto) {
    const available = await this.bookingRepo.isSlotAvailable(
      dto.serviceId,
      dto.appointmentDate,
      dto.startTime,
    );
    if (!available) throw new ConflictException('Time slot is already booked');

    return this.bookingRepo.create(dto);
    // Notice: zero Mongoose-specific code here
  }
}
```

### Checkpoint 3.3

- [ ] `BookingsService` contains no Mongoose imports.
- [ ] You can write a unit test for `createBooking` using a mock `IBookingRepository`.
- [ ] You can explain what you would need to change to switch from Mongoose to the native MongoDB driver.

---

## Phase 3.4 — Atlas, RBAC, and Backups

### MongoDB Atlas Setup

1. Create a free M0 cluster at cloud.mongodb.com.
2. In **Network Access**, restrict to your application's IP (not `0.0.0.0/0` in production).
3. Replace `MONGODB_URI` in `.env` with the Atlas connection string.

### Role-Based Access Control

In Atlas → **Database Access**, create separate database users:

| User               | Role                             | Purpose                |
| ------------------ | -------------------------------- | ---------------------- |
| `app_readwrite`    | `readWrite` on `wellness_center` | Application user       |
| `analytics_reader` | `read` on `wellness_center`      | Analytics queries only |
| `backup_agent`     | `backup`                         | Automated backups      |

Never use the Atlas admin user in your application connection string.

### Automated Backups

In Atlas, enable **Continuous Cloud Backup**:

- Snapshots every 24 hours
- Point-in-time restore for the last 7 days (free tier: basic snapshots only)

### Checkpoint 3.4

- [ ] Application connects to Atlas using the `app_readwrite` user.
- [ ] The `app_readwrite` user cannot drop collections (test this in Atlas shell).
- [ ] Automated snapshots are enabled.

---

## Phase 3 — Final Checkpoint

- [ ] A failed inventory check causes the entire retreat booking to roll back — verified by checking the database.
- [ ] Change streams close without errors on `Ctrl+C`.
- [ ] `BookingsService` has zero Mongoose imports.
- [ ] The application connects to Atlas with a least-privilege user.
- [ ] You can explain replication in one sentence: "A replica set is a group of MongoDB servers that hold the same data; if the primary fails, a secondary is automatically elected."

---

## Appendix: Quick Reference

### Mongoose Query Cheat Sheet

```typescript
Model.find(filter); // many documents
Model.findOne(filter); // first match
Model.findById(id); // by _id
Model.findByIdAndUpdate(id, update, { new: true });
Model.findByIdAndDelete(id);
Model.countDocuments(filter);
Model.exists(filter); // returns _id if found, null if not
Model.aggregate([...stages]);
```

### Common Update Operators

```typescript
{
  $set: {
    field: value;
  }
} // set field value
{
  $unset: {
    field: '';
  }
} // remove field
{
  $inc: {
    field: n;
  }
} // increment by n
{
  $push: {
    array: value;
  }
} // append to array
{
  $pull: {
    array: value;
  }
} // remove from array
{
  $addToSet: {
    array: value;
  }
} // push only if not already in array
```

### Common Query Operators

```typescript
{ field: { $eq: v } }        // equals
{ field: { $ne: v } }        // not equals
{ field: { $gt: v } }        // greater than
{ field: { $gte: v } }       // greater than or equal
{ field: { $lt: v } }        // less than
{ field: { $lte: v } }       // less than or equal
{ field: { $in: [a,b,c] } }  // matches any value in array
{ field: { $nin: [a,b] } }   // matches no value in array
{ field: { $exists: true } } // field exists in document
{ $and: [{...}, {...}] }      // all conditions must match
{ $or:  [{...}, {...}] }      // any condition must match
{ $not: { field: {...} } }   // negate condition
```
