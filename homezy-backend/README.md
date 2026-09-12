# Homezy Backend

Shared **NestJS + Prisma + PostgreSQL** API for the Homezy consumer app,
Homezy Provider app, and admin panel. One backend, three clients — every
endpoint below is already called by name from `homezy-consumer` or
`homezy-provider`'s `src/services/*.ts` files, so the mobile apps should
work against this with zero code changes once it's deployed and seeded.

---

## 1. Stack

- **NestJS 10** (TypeScript) — modular REST API
- **Prisma + PostgreSQL** — schema in `prisma/schema.prisma`
- **JWT auth** (via `@nestjs/passport` + `passport-jwt`) — one shared
  strategy, three roles: `customer`, `provider`, `admin`
- **Swagger** — auto-generated docs at `/docs` once running
- **Razorpay** SDK (stubbed), **Firebase Admin** (stubbed for FCM push)

## 2. Project layout

```
homezy-backend/
├─ prisma/
│  ├─ schema.prisma      # full data model — read this first
│  └─ seed.ts            # creates first admin user + sample categories/services
└─ src/
   ├─ main.ts             # bootstrap, CORS, global prefix "v1", Swagger
   ├─ app.module.ts        # wires every module + global guards
   ├─ common/               # @Public(), @Roles(), @CurrentUser(), guards, filters
   ├─ database/              # PrismaService (injectable client)
   ├─ auth/                   # OTP + password auth for all 3 roles, JWT strategy
   ├─ users/                   # customer profile + address book
   ├─ providers/                # provider profile, duty toggle, KYC, bank details
   ├─ categories/ & catalog/     # public service catalog browsing
   ├─ bookings/                   # THE core module — booking engine + provider job flow
   ├─ payments/                    # Razorpay order + webhook (stubbed)
   ├─ notifications/                 # FCM push (stubbed, see TODOs)
   ├─ coupons/ & banners/             # marketing/ops content
   └─ admin/                           # every /admin/* controller for the admin panel
```

## 3. Which endpoint belongs to which app

| Route prefix | Consumed by |
|---|---|
| `/v1/auth/*` | Consumer app (`homezy-consumer/src/services/authService.ts`) |
| `/v1/users/me*` | Consumer app (profile + addresses) |
| `/v1/categories`, `/v1/services*` | Consumer app (also public/unauthenticated) |
| `/v1/booking*`, `/v1/history`, `/v1/rating`, `/v1/payment` | Consumer app (`bookingService.ts`) |
| `/v1/provider/auth/*` | Provider app (`homezy-provider/src/services/authService.ts`) |
| `/v1/provider/me*` | Provider app (profile, duty, KYC, bank details) |
| `/v1/provider/jobs/*`, `/v1/provider/accept\|reject\|arrived\|start\|complete` | Provider app (`jobService.ts`) |
| `/v1/admin/*` | Admin panel (dashboard, users, providers, bookings, categories, services, coupons, banners) |

Every route not marked `@Public()` requires `Authorization: Bearer <token>`.
Tokens carry a `role` claim (`customer` / `provider` / `admin`) and routes
are locked down with `@Roles('customer')` etc. — see `common/guards/roles.guard.ts`.

## 4. Booking flow, in one paragraph

A customer's `POST /booking` creates a row with `status: PENDING` and
`providerId: null`. It is **pull-based**: any verified provider whose
`categories` include that service's category can see it via
`GET /provider/jobs/incoming` and claim it with `POST /provider/accept`
(sets `status: PROVIDER_ASSIGNED`). From there the provider drives the
status forward — `arrived → start → complete` — and every transition is
recorded in `BookingStatusEvent` for the customer's live tracking screen
and for admin reporting. This is a **deliberate simplification** — see
"Not done yet" below for push-based dispatch.

---

## 5. Explicitly NOT done yet

- **Coverage-area matching**: `findIncomingForProvider` filters by
  category only — `ProviderCoverage.pincode` vs the booking's
  `address.pincode` isn't joined in yet (flagged with a TODO in
  `bookings.service.ts`). Needed before providers only see nearby jobs.
- **Push-based dispatch / auto-assignment**: bookings currently sit at
  `PENDING` until a provider pulls them. If the client wants proactive
  provider notification or auto-assignment to the nearest/highest-rated
  provider, that logic goes in `BookingsService.create()`.
- **Real SMS OTP delivery**: `otp.service.ts` logs the code to the
  console instead of sending it — wire up Twilio/MSG91/etc.
- **Real Razorpay integration**: `payments.service.ts` returns a fake
  order id; needs the actual SDK call plus webhook signature verification
  (there's a TODO marking exactly where).
- **Real FCM push**: `notifications.service.ts` just logs — needs
  firebase-admin initialized and a `DeviceToken` model (not yet in the
  Prisma schema) to store per-user/provider push tokens, plus actual call
  sites wired into booking/job status changes (listed in the file).
  Neither mobile app currently registers a token with the backend either.
  the mobile apps have `expo-notifications` installed but not wired
  either — see their READMEs.
- **File upload to real storage**: KYC document upload accepts a file via
  multer but doesn't actually push it to Cloudinary/S3 — it stores a
  placeholder URL. Same for service/category images and banners.
- **Provider rejection tracking**: `reject()` in `bookings.service.ts` is
  currently a no-op — rejecting a job doesn't yet prevent it from
  reappearing in that provider's incoming list (needs a join table).
- **Rate limiting per-endpoint**: only a blanket 120 req/min global
  throttle exists — OTP request endpoints in particular should have a
  tighter, phone-number-scoped limit to prevent SMS abuse.
- **Refunds, payouts, settlements**: explicitly out of scope per the
  original client proposal (Section 9.2) — not implemented.
- **Tests**: no unit/e2e tests included.
- **CORS**: wide open (`app.enableCors()`) — restrict to the admin
  panel's domain and app URL schemes before production.

## 6. Running it

```bash
# 1. Start PostgreSQL (docker is the fastest path)
docker run --name homezy-db -e POSTGRES_USER=homezy -e POSTGRES_PASSWORD=homezy \
  -e POSTGRES_DB=homezy -p 5432:5432 -d postgres:16

# 2. Configure environment
cp .env.example .env
# DATABASE_URL in .env.example already matches the docker command above

# 3. Install, migrate, seed
npm install
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Run the API
npm run start:dev
# -> http://localhost:4000/v1
# -> Swagger docs: http://localhost:4000/docs
```

The seed script creates an admin login at `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from `.env` (defaults: `admin@homezy.example.com` /
`ChangeMe123!` — **change this before any real deployment**).

Point both mobile apps' `app.json → extra.apiBaseUrl` at
`http://<your-machine-ip>:4000/v1` to test against a local device
(`localhost` won't resolve from a physical phone).

## 7. Suggested order for finishing this

1. Run `prisma migrate dev` against a real Postgres instance and sanity
   check the seed data against both mobile apps.
2. Wire real OTP SMS delivery — nothing else works end-to-end without it.
3. Coverage-area matching in `findIncomingForProvider`.
4. Real Razorpay integration + webhook signature verification.
5. `DeviceToken` model + real FCM push, called from booking/job status
   transitions.
6. Real file storage (Cloudinary/S3) for KYC docs, service images, banners.
7. Admin panel build-out against `/admin/*` (see its own README).
