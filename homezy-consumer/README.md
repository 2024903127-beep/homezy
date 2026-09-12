# Homezy — Consumer App (React Native / Expo)

> **Status**: Feature-complete frontend scaffold — ready to connect to a live backend.  
> Stack: **Expo (React Native) + TypeScript**, React Navigation, Zustand, React Query, Axios.

---

## 📱 What is this?

The **Homezy Consumer App** is the customer-facing mobile application for the Homezy home services platform — modeled after Snabbit / Urban Company. Users can browse service categories, book professionals for home services (cleaning, plumbing, electrical, AC repair, carpentry, etc.), track their booking in real time, rate the service, and manage their profile.

This is **one of five deliverables** in the full Homezy ecosystem:

| Deliverable | Status |
|---|---|
| 🟢 **Consumer App** (this repo) | **Frontend complete — needs backend** |
| 🔴 Provider App (Homezy Provider) | Not started |
| 🔴 Admin Web Panel | Not started |
| 🔴 Customer Website (Next.js) | Not started |
| 🔴 Backend + Database (NestJS + PostgreSQL) | Not started |

---

## 🗂️ Project Structure

```
homezy-consumer/
├── App.tsx                     # Entry point: providers, notifications, toast overlay
├── app.json                    # Expo config (bundle IDs, splash, Maps key placeholder)
├── babel.config.js             # @/... import alias → src/
├── package.json
├── tsconfig.json
├── .env                        # Dev environment config (DO NOT COMMIT)
├── .env.example                # Template for environment variables
└── src/
   ├── assets/                  # Icon/splash placeholders — replace with real brand assets
   ├── theme/theme.ts           # Full design system: colors, spacing, radius, typography, shadows
   ├── types/models.ts          # TypeScript models: User, Address, Category, Service, Booking, Rating, Coupon
   ├── services/                # Axios API layer — one file per domain
   │  ├── apiClient.ts          # Axios instance, auth header, 401 handling
   │  ├── tokenStorage.ts       # expo-secure-store wrapper
   │  ├── authService.ts        # OTP request/verify, profile get/update
   │  ├── catalogService.ts     # categories, services, search
   │  ├── bookingService.ts     # booking CRUD, addresses, payment, rating
   │  ├── couponService.ts      # coupon list + validate
   │  ├── notificationService.ts # push token registration + upload
   │  └── queryClient.ts        # React Query client config
   ├── store/
   │  ├── authStore.ts          # session state (zustand)
   │  ├── bookingDraftStore.ts  # in-progress booking selections
   │  └── toastStore.ts         # global toast/snackbar state
   ├── navigation/              # Auth → Onboarding/Login/OTP stacks; Tab: Home/Bookings/Profile
   ├── hooks/
   │  ├── useAuthBootstrap.ts   # restores session on app start
   │  └── useNotifications.ts   # push notification registration + tap handler
   ├── components/              # Shared UI primitives
   │  ├── Button.tsx            # primary / outline / ghost / danger variants + size prop
   │  ├── TextField.tsx         # animated focus border, inline validation errors
   │  ├── CategoryTile.tsx      # emoji + color-cycling + spring press animation
   │  ├── ServiceCard.tsx       # service list card
   │  ├── BookingStatusBadge.tsx # dot + label badge for booking status
   │  ├── StarRating.tsx        # interactive / read-only star rating
   │  ├── SkeletonLoader.tsx    # animated shimmer loading placeholder
   │  ├── EmptyState.tsx        # empty list state with icon + CTA
   │  ├── ErrorState.tsx        # error state with retry button
   │  └── Toast.tsx             # global animated toast overlay (uses toastStore)
   └── screens/
      ├── SplashScreen.tsx      # animated logo splash on primary bg
      ├── Onboarding/           # OnboardingScreen — 3-slide carousel, animated dots
      ├── Auth/                 # LoginScreen (premium hero card), OtpVerifyScreen (digit boxes + countdown)
      ├── Home/                 # HomeScreen (banner carousel, popular, categories), CategoryServicesScreen (filter chips), ServiceDetailScreen
      ├── Booking/              # AddressListScreen, AddressFormScreen (validated), BookingConfirmScreen (slot picker + coupon + price breakdown), BookingSuccessScreen (animated), BookingTrackingScreen (status tracker + provider card), RateBookingScreen (stars + quick tags)
      ├── Profile/              # ProfileScreen (stats row + menu), EditProfileScreen (validated), CouponsScreen, Notifications (in-app list)
      └── Support/              # SupportScreen — expandable FAQ accordion + contact cards
```

---

## ✅ Completed Features (end-to-end wired screen → store → API)

### Authentication
- [x] Onboarding carousel (3 slides, animated dots, skip/next/get-started)
- [x] OTP login — phone number → 6-digit OTP boxes with shake-error + countdown resend → session in SecureStore
- [x] Session persistence on app restart via useAuthBootstrap

### Home & Catalog
- [x] HomeScreen — sticky header, greeting, location indicator, notification bell, banner carousel (animated), popular services strip, category grid (emoji + spring animation), trust bar
- [x] Category Services — filter chips, rich service cards (image box, duration, Book CTA)
- [x] Service Detail — image, inclusions/exclusions, footer with price + Book Now

### Booking Flow
- [x] Address selection with selection highlight
- [x] Address form with full validation (required fields, 6-digit pincode)
- [x] Booking confirm screen — date/time slot picker (next 7 days × 4 slots), coupon entry (validates against backend), price breakdown with discount, payment mode selector (COD / Online), notes field, sticky confirm footer
- [x] Booking success — spring-animated checkmark, booking ref card, next-steps list
- [x] Booking history — cancel action (calls PATCH /booking/:id), booking cards with status dot

### Tracking & Rating
- [x] Booking tracking — live status progress tracker (6 steps), provider card with call button, price summary, map placeholder (ready for react-native-maps)
- [x] Rate service — star rating (interactive), quick tags (shows for ≥4 stars), comment field, toast feedback

### Profile
- [x] Profile screen — avatar initials, stats row, menu with icons and "NEW" badge on Coupons
- [x] Edit profile — name/email validation, non-editable phone number
- [x] Address book — list with delete, selection mode
- [x] Coupons screen — list from backend, copy-to-clipboard
- [x] Notifications screen — in-app notification list (wired to backend pattern)
- [x] Support/FAQ — expandable accordion, contact cards (email / call / WhatsApp)
- [x] Logout with confirmation alert

### Infrastructure
- [x] Push notifications — expo-notifications setup, permission request, Expo push token → POST /users/me/push-token, tapped notification navigates to booking
- [x] Global toast/snackbar (animated, 4 types: success / error / info / warning)
- [x] Skeleton loaders on all list screens
- [x] Empty state + error state + retry on all major screens
- [x] Environment config (.env / .env.example)
- [x] Premium design system — teal-green brand, category color cycling, shadows, typography scale, micro-animations throughout

---

## ⏳ Left for next pass

### Integration (needs backend to be built first)
- [ ] **Razorpay SDK** — `BookingConfirmScreen` calls `initiatePayment()` but doesn't open Razorpay checkout. Needs `react-native-razorpay` + real `RAZORPAY_KEY_ID`.
- [ ] **Google Maps** — `BookingTrackingScreen` has a map placeholder, `AddressFormScreen` has a pin picker placeholder. Needs `GOOGLE_MAPS_API_KEY` in `app.json`. Install `react-native-maps`.
- [ ] **Reschedule UI** — `updateBooking()` exists, cancel is wired. Reschedule (date picker modal on existing booking) screen not built yet.

### Production Readiness
- [ ] Real app icons / splash images — replace `src/assets/*.png` solid-color placeholders with brand assets
- [ ] App store assets — screenshots, feature graphics
- [ ] E2E tests (Detox or Maestro)
- [ ] Analytics (Firebase or Mixpanel)
- [ ] Crash reporting (Sentry)
- [ ] Accessibility (a11y) labels throughout
- [ ] Deep linking setup for notification taps (universal links)

---

## 🚀 Running it

```bash
npm install
npx expo start
```

> Point `API_BASE_URL` in `.env` (default: `http://localhost:4000/v1`) at your running NestJS backend.  
> All screen ↔ API contracts are defined in `src/services/*.ts` — use these as the spec for backend routes.

---

## 🏗️ Separate deliverables (not in this repo)

| Item | Notes |
|---|---|
| **Backend (NestJS + PostgreSQL + Prisma)** | All API routes are documented in `src/services/*.ts` |
| **Homezy Provider App** | Separate Expo project — accept/reject jobs, navigate, start/complete service, earnings |
| **Admin Web Panel** | React + Next.js — manage categories, providers, bookings, coupons, banners, reports |
| **Customer Website** | Next.js — same booking UX as the app, web-optimized, SSR for SEO |

---

## 🔑 Environment Variables

Copy `.env.example` → `.env` and fill in your values:

```env
API_BASE_URL=http://localhost:4000/v1
GOOGLE_MAPS_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_key_here
FIREBASE_PROJECT_ID=your_project
APP_ENV=development
```

---

## 📐 Suggested backend build order

1. `POST /auth/request-otp`, `POST /auth/verify-otp`, `GET /users/me` — unblocks login end-to-end
2. `GET /categories`, `GET /services`, `GET /services/:id` — unblocks Home + service detail
3. `GET /users/me/addresses`, `POST/PATCH/DELETE /users/me/addresses` — unblocks address book
4. `POST /booking`, `GET /history`, `GET /booking/:id`, `PATCH /booking/:id` — unblocks booking flow
5. `POST /coupons/validate`, `GET /coupons` — unblocks coupon feature
6. `POST /payment` + Razorpay integration — unblocks online payment
7. `POST /rating` — unblocks rating flow
8. `POST /users/me/push-token` — unblocks notifications
