# Homezy Provider — Service Professional App (React Native / Expo)

The provider-facing counterpart to the Homezy consumer app. Same stack,
same conventions, so both apps stay easy to maintain side by side:
**Expo (React Native) + TypeScript**, React Navigation, Zustand, React
Query, Axios.

This app and `homezy-consumer` are expected to talk to **one shared
backend** — provider endpoints live under `/provider/*` on that API.

---

## 1. What's in this build

```
homezy-provider/
├─ App.tsx
├─ app.json                 # bundle IDs, Maps keys, permissions (incl. background location)
├─ babel.config.js
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ assets/                # placeholder icon/splash — REPLACE these
   ├─ theme/theme.ts          # same token system as consumer app, blue accent
   ├─ types/models.ts         # Provider, KycDocument, BankDetails, Job, EarningsSummary
   ├─ services/
   │  ├─ apiClient.ts         # axios instance, auth header, 401 handling
   │  ├─ tokenStorage.ts
   │  ├─ authService.ts       # OTP signup/login + email/password login, duty toggle
   │  ├─ kycService.ts        # document upload (multipart), bank details
   │  ├─ jobService.ts        # incoming/active/history jobs, accept/reject, status updates
   │  ├─ earningsService.ts
   │  └─ queryClient.ts
   ├─ store/authStore.ts       # provider session (zustand)
   ├─ navigation/               # Auth stack, Home/Jobs/Earnings/Profile stacks, tabs
   ├─ components/                # Button, TextField, JobCard, JobStatusBadge, DutyToggle
   ├─ hooks/useAuthBootstrap.ts
   └─ screens/
      ├─ SplashScreen.tsx
      ├─ Auth/       WelcomeScreen, OtpLoginScreen, OtpVerifyScreen, PasswordLoginScreen
      ├─ Home/        DashboardScreen (duty toggle + job feed), EarningsScreen
      ├─ Jobs/        JobDetailScreen (accept/reject + status progression), JobHistoryScreen
      └─ Profile/     ProfileScreen, EditProfileScreen, KycScreen, BankDetailsScreen,
                      ServiceAreasScreen
```

### Flows fully wired end-to-end (screen → store → API call)
- Auth: OTP signup/login *and* email+password login for returning providers
  (matches the proposal's "OTP, Email, Password" provider auth spec)
- Dashboard: online/offline duty toggle, polls incoming job requests every
  10s while online, shows active jobs
- Job detail: **Accept / Reject** for incoming requests; **Mark Arrived →
  Start Job → Complete Job** status progression for accepted jobs; tap-to-call
  customer and tap-to-navigate (opens Google Maps directions) once accepted
- Job history (completed/cancelled jobs)
- Earnings: today/week/month summary + itemized history
- Profile: verification-status banner, edit profile, KYC document upload
  (via `expo-image-picker`, multipart upload), bank/payout details, read-only
  skills & coverage areas (admin-assigned per proposal)

Every screen calls a real service function in `src/services/*.ts` matching
REST endpoints implied by the proposal (`POST /provider/accept`,
`POST /provider/start`, `POST /provider/complete`, etc.) — **no backend
exists yet**, same as the consumer app. Point `apiClient`'s base URL
(`app.json → extra.apiBaseUrl`) at the shared backend once it's up.

---

## 2. Explicitly NOT done yet (left for Antigravity / next pass)

- **Live location tracking**: `app.json` requests background location
  permission, but nothing in the app actually starts a location watcher or
  streams it to the backend yet — needed for the customer app's live map.
- **Maps / navigation**: "Navigate" button currently deep-links to Google
  Maps directions; no in-app `react-native-maps` view. Needs real Google
  Maps API keys (still placeholders in `app.json`).
- **Push notifications**: `expo-notifications` installed but not wired —
  no permission request, no token registration, no handler for new-job
  alerts (this matters a lot for a provider app — job requests are
  time-sensitive).
- **Real app icons/splash**: `src/assets/*.png` are solid-color
  placeholders generated for this scaffold.
- **KYC document viewer**: upload works, but there's no way to preview a
  previously uploaded document or see rejection reasons in detail.
- **Availability scheduling**: only a simple on/off duty toggle exists —
  no "available these hours" scheduling UI if the client wants that later.
- **Self-service coverage areas**: `ServiceAreasScreen` is read-only by
  design (admin-assigned per proposal) — flip this to editable if the
  client wants providers to self-select their zones instead.
- **Form validation**: KYC, bank details, and profile forms don't validate
  required fields (IFSC format, account number length, etc.) before saving.
- **Error/empty/loading states**: minimal placeholders, no retry UI or
  skeleton loaders.
- **Testing**: no unit/e2e tests included.
- **Environment config**: single hardcoded `apiBaseUrl` — should move to
  per-environment `.env` files.

## 3. Shared-model note (keep in sync with the consumer app)

`src/types/models.ts` has its own `Job` / `JobStatus` types here instead
of importing from `homezy-consumer`, since these are two separate Expo
projects with no shared package yet. **`JobStatus` must stay identical to
`BookingStatus` in `homezy-consumer/src/types/models.ts`** — they describe
the same underlying booking record from two different apps. Once the
backend is built, consider extracting `types/models.ts`, the theme tokens,
and the Button/TextField components into a shared internal package
(e.g. `packages/shared-ui`) so both apps — and the admin panel — pull
from one source of truth instead of copy-pasted files.

---

## 4. Running it

```bash
npm install
npx expo start
```

Requires the backend running and `app.json → extra.apiBaseUrl` pointed at
it (defaults to `http://localhost:4000/v1`); until then every screen's
data fetch fails gracefully into its empty state.

## 5. Suggested order for finishing this app

1. Backend provider auth (`/provider/auth/request-otp`, `/verify-otp`,
   `/login`, `/provider/me`) — unblocks login end-to-end.
2. Job endpoints (`/provider/jobs/incoming|active|history`, `/accept`,
   `/reject`, `/start`, `/arrived`, `/complete`) — unblocks the core job loop.
3. KYC upload endpoint + admin-side review (needed before real providers
   can go live).
4. Push notifications for new job requests — high priority for a
   provider app specifically, since requests are time-sensitive.
5. Live location tracking while on duty (feeds the customer app's map).
6. Polish: validation, empty/error states, document preview.
