/* eslint-disable */
// VS Code MongoDB Playground — seed test data for Phase 2.2 analytics pipelines.
//
// What this does:
//   1. Clears existing seed docs (matched by the fixed _ids below).
//   2. Inserts 3 services, 3 customers, and 12 bookings across 2025.
//      - 10 bookings are `completed` with totalPrice — these feed the revenue pipeline.
//      -  2 bookings are `pending` / `cancelled` — they MUST be filtered out by $match.
//   3. Prints a summary + the expected monthly totals so you can verify the pipeline.
//
// Run: right-click inside this file in VS Code → "MongoDB: Run Selected Lines From Playground"
//      or command palette → "MongoDB: Run Playground".

use('wellness_center');

// ─── Fixed ObjectIds so bookings can reference services/customers deterministically ──

const SVC_MASSAGE    = ObjectId('650000000000000000000001');
const SVC_HERBAL     = ObjectId('650000000000000000000002');
const SVC_MEDITATION = ObjectId('650000000000000000000003');

const CUST_SOMCHAI = ObjectId('660000000000000000000001');
const CUST_ALICE   = ObjectId('660000000000000000000002');
const CUST_YUKI    = ObjectId('660000000000000000000003');

// ─── Clean slate for re-runs (only removes the seeded _ids, not your own data) ──────

db.wellnessservices.deleteMany({ _id: { $in: [SVC_MASSAGE, SVC_HERBAL, SVC_MEDITATION] } });
// Also clear by email — the unique index from Phase 2.1 rejects inserts if the email
// already exists under a different _id (e.g. from earlier ad-hoc tests).
db.customers.deleteMany({
  $or: [
    { _id: { $in: [CUST_SOMCHAI, CUST_ALICE, CUST_YUKI] } },
    { email: { $in: ['somchai@example.com', 'alice@example.com', 'yuki@example.com'] } },
  ],
});
db.bookings.deleteMany({ customer: { $in: [CUST_SOMCHAI, CUST_ALICE, CUST_YUKI] } });

// ─── Services ────────────────────────────────────────────────────────────────────────

db.wellnessservices.insertMany([
  { _id: SVC_MASSAGE,    name: 'Thai Massage',      durationMinutes: 60, price: 1500, category: 'massage',    isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: SVC_HERBAL,     name: 'Herbal Steam Bath', durationMinutes: 45, price:  800, category: 'herbal',     isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: SVC_MEDITATION, name: 'Morning Meditation',durationMinutes: 45, price:  350, category: 'meditation', isActive: true, createdAt: new Date(), updatedAt: new Date() },
]);

// ─── Customers ───────────────────────────────────────────────────────────────────────

db.customers.insertMany([
  { _id: CUST_SOMCHAI, firstName: 'Somchai', lastName: 'Jaidee',  email: 'somchai@example.com', customerType: 'local',         preferredLanguages: ['th', 'en'], createdAt: new Date(), updatedAt: new Date() },
  { _id: CUST_ALICE,   firstName: 'Alice',   lastName: 'Walker',  email: 'alice@example.com',   customerType: 'international', preferredLanguages: ['en'],       createdAt: new Date(), updatedAt: new Date() },
  { _id: CUST_YUKI,    firstName: 'Yuki',    lastName: 'Tanaka',  email: 'yuki@example.com',    customerType: 'international', preferredLanguages: ['ja', 'en'], createdAt: new Date(), updatedAt: new Date() },
]);

// ─── Bookings (10 completed + 2 non-completed, spread across 2025) ──────────────────

db.bookings.insertMany([
  // Jan — 1500
  { customer: CUST_SOMCHAI, service: SVC_MASSAGE,    appointmentDate: new Date('2025-01-15T00:00:00Z'), startTime: '10:00', status: 'completed', totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },

  // Feb — 800 + 1500 = 2300
  { customer: CUST_ALICE,   service: SVC_HERBAL,     appointmentDate: new Date('2025-02-03T00:00:00Z'), startTime: '09:00', status: 'completed', totalPrice:  800, createdAt: new Date(), updatedAt: new Date() },
  { customer: CUST_YUKI,    service: SVC_MASSAGE,    appointmentDate: new Date('2025-02-20T00:00:00Z'), startTime: '14:00', status: 'completed', totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },

  // Mar — 350 + 1500 = 1850
  { customer: CUST_SOMCHAI, service: SVC_MEDITATION, appointmentDate: new Date('2025-03-10T00:00:00Z'), startTime: '07:00', status: 'completed', totalPrice:  350, createdAt: new Date(), updatedAt: new Date() },
  { customer: CUST_ALICE,   service: SVC_MASSAGE,    appointmentDate: new Date('2025-03-25T00:00:00Z'), startTime: '11:00', status: 'completed', totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },

  // Apr — 800 + 1500 = 2300
  { customer: CUST_YUKI,    service: SVC_HERBAL,     appointmentDate: new Date('2025-04-12T00:00:00Z'), startTime: '13:00', status: 'completed', totalPrice:  800, createdAt: new Date(), updatedAt: new Date() },
  { customer: CUST_SOMCHAI, service: SVC_MASSAGE,    appointmentDate: new Date('2025-04-28T00:00:00Z'), startTime: '15:00', status: 'completed', totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },

  // Jun — 350
  { customer: CUST_ALICE,   service: SVC_MEDITATION, appointmentDate: new Date('2025-06-05T00:00:00Z'), startTime: '07:00', status: 'completed', totalPrice:  350, createdAt: new Date(), updatedAt: new Date() },

  // Jul — 1500
  { customer: CUST_YUKI,    service: SVC_MASSAGE,    appointmentDate: new Date('2025-07-15T00:00:00Z'), startTime: '10:00', status: 'completed', totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },

  // Aug — 800
  { customer: CUST_SOMCHAI, service: SVC_HERBAL,     appointmentDate: new Date('2025-08-22T00:00:00Z'), startTime: '16:00', status: 'completed', totalPrice:  800, createdAt: new Date(), updatedAt: new Date() },

  // ─── These two should NOT appear in the revenue report ($match filters them) ─────
  { customer: CUST_ALICE,   service: SVC_MASSAGE,    appointmentDate: new Date('2025-09-10T00:00:00Z'), startTime: '10:00', status: 'pending',   totalPrice: 1500, createdAt: new Date(), updatedAt: new Date() },
  { customer: CUST_YUKI,    service: SVC_MEDITATION, appointmentDate: new Date('2025-10-05T00:00:00Z'), startTime: '07:00', status: 'cancelled', totalPrice:  350, createdAt: new Date(), updatedAt: new Date() },
]);

// ─── Summary ────────────────────────────────────────────────────────────────────────

print('\n✔ Seed complete');
print('  services :', db.wellnessservices.countDocuments({ _id: { $in: [SVC_MASSAGE, SVC_HERBAL, SVC_MEDITATION] } }));
print('  customers:', db.customers.countDocuments({ _id: { $in: [CUST_SOMCHAI, CUST_ALICE, CUST_YUKI] } }));
print('  bookings :', db.bookings.countDocuments({ customer: { $in: [CUST_SOMCHAI, CUST_ALICE, CUST_YUKI] } }));

print('\nExpected GET /analytics/monthly-revenue?year=2025 :');
print('  [ { month: 1, totalRevenue: 1500, bookingCount: 1 },');
print('    { month: 2, totalRevenue: 2300, bookingCount: 2 },');
print('    { month: 3, totalRevenue: 1850, bookingCount: 2 },');
print('    { month: 4, totalRevenue: 2300, bookingCount: 2 },');
print('    { month: 6, totalRevenue:  350, bookingCount: 1 },');
print('    { month: 7, totalRevenue: 1500, bookingCount: 1 },');
print('    { month: 8, totalRevenue:  800, bookingCount: 1 } ]');
print('  (months 5, 9, 10, 11, 12 skipped — no completed bookings)');
print('  (Sep pending + Oct cancelled should NOT appear — $match filters them)');
