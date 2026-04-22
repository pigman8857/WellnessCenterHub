# Pipeline 2 Guide — Top 3 Most Popular Services

**Phase 2.2 | New stages: `$lookup`, `$unwind`, `$limit`**

**Business question**: Which 3 services have the most confirmed or completed bookings?

---

## The Full Pipeline (overview)

```
bookings collection
        │
     $match   ← keep only confirmed + completed bookings
        ▼
     $group   ← one doc per service ObjectId, count bookings
        ▼
     $sort    ← rank by bookingCount descending
        ▼
     $limit   ← keep top 3  ← MUST come before $lookup (see Day 1 notes)
        ▼
     $lookup  ← join wellnessservices to get name + category
        ▼
     $unwind  ← flatten the array $lookup produces  (Day 2)
        ▼
     $project ← shape output: serviceName, category, bookingCount  (Day 2)
        ▼
      result
```

---

## Day 1 — `$lookup` ✅ Complete (2026-04-22)

### Step 1 — Add `TopService` interface to `types.ts`

```typescript
import { ServiceCategory } from '../services/types';

export interface TopService {
  serviceName: string; // ← from $lookup joining wellnessservices
  category: ServiceCategory; // ← also from the joined service document
  bookingCount: number; // ← from $group counting bookings
}
```

> **Note**: `ServiceCategory` is defined in `src/modules/services/types.ts`. MongoDB stores the value as a plain string (e.g. `'massage'`) — TypeScript accepts it as `ServiceCategory` because the enum values are strings. In a larger codebase, shared enums like this would move to a `shared/` module so neither feature module owns it.

### Step 2 — Add the private pipeline method to `analytics.service.ts`

Follow the same pattern as `getPipelineMonthlyRevenue`. Stop after `$lookup` for now — no `$unwind` or `$project` yet. This lets you see the raw array output.

```
// 1. $match  → status: { $in: ['confirmed', 'completed'] }
// 2. $group  → _id: '$service',  bookingCount: { $sum: 1 }
// 3. $sort   → bookingCount: -1
// 4. $limit  → 3
// 5. $lookup → from, localField, foreignField, as  (see reference below)
```

**`$lookup` field reference:**

```typescript
{
  $lookup: {
    from: 'wellnessservices', // raw MongoDB collection name — lowercase plural, NOT the class name
    localField: '_id',        // the grouped doc's _id IS the service ObjectId (from $group _id: '$service')
    foreignField: '_id',      // match against _id on the wellnessservices side
    as: 'serviceDetails',     // name of the array field added to the output
  },
}
```

> **Common gotcha**: `from:` must be the MongoDB collection name (`'wellnessservices'`), not the
> Mongoose model class name (`'WellnessService'`). Using the class name silently returns `[]` — no error.

**Why `$limit` before `$lookup`:**

`$lookup` runs one join query per document at that point in the pipeline.

```
// ❌ Expensive — joins ALL unique services, then discards most
$group → $sort → $lookup → $limit

// ✅ Correct — limits to 3 first, then only 3 joins happen
$group → $sort → $limit → $lookup
```

Rule: reduce document count as early as possible before any expensive stage.

### Step 3 — Public service method

```typescript
// Use Promise<any[]> today so TypeScript doesn't block you from seeing the raw output
async getTopServices(): Promise<any[]> {
  // call this.bookingModel.aggregate with the pipeline
}
```

### Step 4 — Controller endpoint

```
GET /analytics/top-services
// no query params needed
```

### Step 5 — Test and observe ✅

Hit `GET /analytics/top-services`. **Actual response (2026-04-22)**:

```json
[
  {
    "_id": "650000000000000000000001",
    "bookingCount": 5,
    "serviceDetails": [
      {
        "_id": "650000000000000000000001",
        "name": "Thai Massage",
        "durationMinutes": 60,
        "price": 1500,
        "category": "massage",
        "isActive": true,
        "createdAt": "2026-04-17T10:25:53.917Z",
        "updatedAt": "2026-04-17T10:25:53.917Z"
      }
    ]
  },
  {
    "_id": "650000000000000000000002",
    "bookingCount": 3,
    "serviceDetails": [
      {
        "_id": "650000000000000000000002",
        "name": "Herbal Steam Bath",
        "durationMinutes": 45,
        "price": 800,
        "category": "herbal",
        "isActive": true
      }
    ]
  },
  {
    "_id": "650000000000000000000003",
    "bookingCount": 2,
    "serviceDetails": [
      {
        "_id": "650000000000000000000003",
        "name": "Morning Meditation",
        "durationMinutes": 45,
        "price": 350,
        "category": "meditation",
        "isActive": true
      }
    ]
  }
]
```

`serviceDetails` is an **array** with one element — exactly what `$lookup` always produces. This is the problem `$unwind` solves tomorrow: `'$serviceDetails.name'` in `$project` would return `null` right now because you cannot dot-navigate into an array.

- If `serviceDetails` is `[]` → `from:` collection name is wrong.
- If `serviceDetails` field is missing entirely → the `$lookup` stage has a syntax error.

---

## Day 2 — `$unwind` + `$project`

### Why `$unwind` is needed

`$lookup` always returns an array, even for a one-to-one join. You cannot dot-navigate into an array:

```
// After $lookup:
{ bookingCount: 8, serviceDetails: [ { name: 'Thai Massage' } ] }
                                    ↑ array

// '$serviceDetails.name' in $project returns null — dot-nav into array does not work
```

`$unwind` replaces the array with its single element:

```
// After $unwind:
{ bookingCount: 8, serviceDetails: { name: 'Thai Massage' } }
                                   ↑ plain object — dot-nav works
```

### Step 1 — Add `$unwind` after `$lookup`

```typescript
{
  $unwind: '$serviceDetails';
}
// the string must match the `as` field name you chose in $lookup
```

### Step 2 — Add `$project` to shape the output

```typescript
{
  $project: {
    _id: 0,
    serviceName: '$serviceDetails.name',
    category: '$serviceDetails.category',
    bookingCount: 1,
  },
}
```

### Step 3 — Update the return type

Change `Promise<any[]>` → `Promise<TopService[]>` on both the service method and controller.

### Step 4 — Test and compare

Before `$unwind` (Day 1):

```json
{ "_id": "...", "bookingCount": 8, "serviceDetails": [{ "name": "Thai Massage" }] }
```

After `$unwind` + `$project` (Day 2):

```json
{ "serviceName": "Thai Massage", "category": "massage", "bookingCount": 8 }
```

---

## Checkpoint Questions

Answer these before moving to Pipeline 3:

- [ ] Why does `$lookup` always produce an array, even for a one-to-one join?
- [ ] What happens if you try to use `'$serviceDetails.name'` in `$project` without `$unwind`?
- [ ] Why must `$limit` come before `$lookup`?
- [ ] What does `from:` refer to — the Mongoose model name or the MongoDB collection name?
- [ ] What `$unwind` syntax mistake would cause a silent failure (wrong field name)?
