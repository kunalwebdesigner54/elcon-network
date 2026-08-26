# Elcon Network — Architecture Analysis

**Scope:** read-only analysis of `D:\work\nishikant\elcon-network`
**Date:** 2026-08-26
**Changes made:** none. No existing file was modified, nothing was staged, committed, or pushed. This report is the only new file.

---

## 1. Frontend architecture

**Stack:** React 19.2.4, Vite 8, react-router-dom 7.13.1, axios 1.19, sweetalert2 for dialogs. The public marketing site additionally pulls in three.js + @react-three/fiber + drei. Address forms use `country-state-city` and `india-state-district`.

**Entry chain:** `src/index.jsx` → `App.jsx`. Note the entry is `index.jsx`, not the Vite-default `main.jsx`, and the build output directory is configured as `build` (not `dist`) so that it matches `netlify.toml`.

**Routing.** All ~120 routes live inline in a single `App.jsx`, with 122 static top-of-file imports. There is no lazy loading and no code splitting, so the initial bundle contains every admin screen, every member screen, and the three.js public site. Routes are grouped under three layouts: a public marketing layout, a member dashboard layout, and an admin layout.

The most important routing quirk: **the admin branch is mounted at `path="/"` — the same base as the public layout.** As a result admin pages resolve at bare paths like `/dashboard` rather than `/admin/dashboard`. Additionally, the only global `*` catch-all route is nested *inside* the admin branch, which means a logged-out visitor who mistypes any URL gets redirected to `/admin/login` rather than to the public 404 or homepage.

**State management.** There are **zero React Context providers** in the app. There is no Redux, Zustand, or React Query. Every page independently calls the API in its own `useEffect` and keeps results in local `useState`. Cross-page shared state (the logged-in user, the token, the role) is read directly out of `localStorage`/`sessionStorage` on demand via `src/utils/auth.js`. Consequences worth knowing: no cache, so navigating between two pages that show the same data issues the request twice; and no reactive updates, so a wallet balance shown in a header will not refresh when another component spends from it.

**Session layer** is `src/utils/auth.js`, 33 lines and the whole of it:

```js
getToken()  →  sessionStorage.impersonateToken  ??  localStorage.token
getUser()   →  sessionStorage.impersonateUser   ??  localStorage.user
```

The `sessionStorage`-first ordering exists to support admin impersonation ("login as user"): the admin receives a token in a URL query parameter, and the frontend moves it into `sessionStorage` so that impersonation is scoped to one browser tab and does not clobber the admin's own `localStorage` session.

**Admin gating** is `src/Components/AdminRoute.jsx`, which does `JSON.parse(localStorage.user).role === 'admin'` inside a `useEffect` with `[]` dependencies. This is a cosmetic guard only — `localStorage` is fully user-controlled, so any visitor can set that value and render every admin screen. The only real access control is `authorize('admin')` on the backend routes, and coverage there is incomplete (see §7).

**Admin sign-out is a no-op.** `src/Admin/SignOut/SignOut.jsx` clears no storage keys and only navigates away; the file still carries the string "You are currently in demo mode." The admin token therefore remains valid and present in `localStorage` after "logging out".

---

## 2. Backend architecture

**Stack:** Node.js + Express 4.18, Mongoose 7.5, MongoDB Atlas, `jsonwebtoken` 9, `bcryptjs`, `express-validator`, `cors`. Package name is `p2p-mlm-backend`. Layering is conventional: `routes/` (16 files) → `controllers/` → `services/` → `models/` (17 files), with `middleware/auth.js` and a handful of `utils/`.

**Two competing app files — this is the single most important structural fact.**

`server.js` is the real production entrypoint. `app.js` also exists but is imported only by `tests/dashboard.test.js`, and it has drifted:

| | `server.js` (production) | `app.js` (tests only) |
|---|---|---|
| `dotenv.config()` | yes | no |
| `/api/coupons` mounted | **no** | yes |
| global error handler | yes | no |
| `/api/health` position | before `productRoutes` | **after** `productRoutes` |

Two practical consequences. First, the coupons API is reachable in tests and **404s in production**, because `server.js` never mounts it despite `routes/coupons.js` existing. Second, any CORS or route change must be applied to both files or the drift widens.

**Boot sequence.** Routes are mounted *inside* `startServer()`, after `connectDB()` resolves. `seedAdmin()` is re-required and executed on every single boot, inside a `try/catch` that swallows its errors silently. Line 145 prints `✓ Admin credentials: admin@gmail.com / admin123` to stdout on every boot — meaning live admin credentials are written into the Render log stream.

**Route-order fragility.** `productRoutes` is mounted at the bare `/api` prefix and runs `router.use(protect)` internally. The comment in `server.js` at lines 86–87 is load-bearing: `/api/health` is registered *above* it deliberately, because otherwise `protect` intercepts the health check and Render's health probe fails. Meanwhile `/api/dashboard` is mounted *below* `productRoutes` (line 99) and survives only because `routes/products.js` happens to define no matching path. Adding a `/:param` catch-all or another `router.use()` to `products.js` would silently shadow all of `/api/dashboard/*`.

**CORS** allowlists `FRONTEND_ORIGIN` (default `https://elconnetwork.com`), the `www` variant, `https://elcon-network.netlify.app`, and localhost 3000/3001. `!origin` is explicitly allowed, so curl/Postman bypass CORS entirely — normal for an API, but worth knowing it is not a security boundary here.

**Operational gaps.** Port auto-increments 5001→5011 on `EADDRINUSE`, which is actively harmful on a PaaS (the platform routes to one assigned port; a silent shift makes the service unreachable rather than crash-looping visibly). There is no graceful shutdown, and `unhandledRejection` calls `process.exit(1)`. Body limit is `express.json({ limit: '25mb' })`.

**Authentication and authorization.** The entire auth surface is `middleware/auth.js`, 84 lines, exporting exactly two middlewares. `protect` reads a `Bearer` token, verifies it with `JWT_SECRET`, and loads a narrow field projection off `User`. Three findings:

1. **It fails open on a missing user.** If `User.findById(decoded.id)` returns nothing, the code sets `req.user = decoded` — the raw JWT payload, `role` included. A deleted user holding an old admin token still authenticates as admin.
2. **`accountStatus` is projected but never enforced, and `isBlocked` is not even projected.** Blocking a member stops them from earning income (the distribution services check it) but does not stop them using the API.
3. **Tokens last 30 days with no revocation list.** Combined with the no-op admin sign-out above, a leaked token is valid for a month.

`authorize(...roles)` is a simple role-membership check, and in practice is only ever called as `authorize('admin')`. There is no `adminOnly`/`isAdmin` variant and no request-validation middleware wired into the chain — `express-validator` is a dependency but validation is done ad hoc inside controllers.

---

## 3. Database structure

MongoDB Atlas, database `mlmsoftware`. **There is one cluster and no separate test or staging database**, so `npm test` and every maintenance script in `scripts/` operate on production data.

**17 models**, grouped by concern:

- **Identity / tree:** `User`
- **Commerce:** `Product`, `Order`, `Cart`, `Coupon`
- **MLM money:** `Donation`, `LevelIncome`, `RepurchaseIncome`
- **E-pins:** `Epin`, `EpinFranchise`, `EpinRequest`, `EpinTransfer`
- **Wallet movement:** `DepositRequest`, `WithdrawalRequest`
- **CMS / support:** `SupportTicket`, `SiteSetting`, `NewsPopup`

**The MLM tree is a bare parent pointer.** `User.sponsorId` is a **String holding the sponsor's `memberId`** — not an ObjectId, and not a Mongoose `ref`. There is no ancestors array, no materialized path, and no children array. Therefore: walking upline is N sequential `findOne` queries (one round-trip per level, up to 10), and building a downline requires loading essentially the whole users collection into Node memory (`services/teamService.js` does this). `User.levelDepth` is a denormalised cache computed once at registration from the sponsor's own cached value; it has already drifted in production, which is why `scripts/` contains five audit/repair scripts.

**Only one hook exists in the entire model layer:** `userSchema.pre('save')` (lines 301–344). It does two things, both notable.

It generates `memberId` as `EL` + 8 random digits using a check-then-write loop (`findOne`, then assign) — a race window under concurrent registration, mitigated but not closed by a unique index.

And it stores passwords in cleartext:

```js
this.plainPassword = this.password;            // "for admin visibility (client request)"
this.password = await bcrypt.hash(this.password, salt);
```

The same is done for `transactionPassword`. Both `plainPassword` and `plainTransactionPassword` are `select: false`, but `GET /api/members/all-members` and `GET /api/members/profile/:memberId` explicitly `.select('+plainPassword +plainTransactionPassword')` and return them in JSON responses.

**Money is stored as `Number`** (BSON Double) everywhere. There is no `Decimal128` anywhere in the schema layer. Since Repurchase Income computes `reserveAmount / 10` and `$inc`s that float repeatedly, balances accumulate binary floating-point error over time.

**Several date fields are Strings**, not `Date` — in `Order` (`orderDate`, `startDate`, `endDate`), `DepositRequest`, `WithdrawalRequest`, `Epin`, and `NewsPopup`. Range filtering and sorting on these is lexical, not chronological.

**Idempotency rests entirely on two compound unique indexes:** `LevelIncome{joiningMemberId, level}` and `RepurchaseIncome{orderNo, level}`. These are the only mechanism preventing duplicate payouts, and both distribution services rely on catching the resulting `11000` duplicate-key error. They must be preserved by any migration.

---

## 4. API communication flow

Every frontend request goes through one axios instance, `src/api/config.js`:

```js
const defaultApiBaseUrl = 'http://localhost:5000/api';   // backend actually runs on 5001
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API || defaultApiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

The request interceptor attaches the bearer token on every call. **There is no response interceptor** — so there is no central 401 handling, no auto-logout on expiry, and no token refresh. When a token expires the user sees per-page error toasts and stays on a broken screen until they manually navigate to login.

Above this instance sits a thin per-domain service layer (`src/api/donationsService.js`, `levelIncomeService.js`, and siblings) exporting one function per endpoint. Pages import these directly.

**Environment-variable inconsistencies.** The config reads either `VITE_API_URL` or `VITE_API`, so two names are live. Fallback ports disagree: `config.js` defaults to port 5000 while `levelIncomeService.js` defaults to 5001; the backend listens on 5001. So local development works only when the env var is set, and fails inconsistently when it is not.

**Broken static asset path.** `Admin/Members/KYCRequest/KYCRequest.jsx` (lines 451, 459) hardcodes `http://localhost:5000/uploads/...`. The backend never calls `express.static` anywhere, so no `/uploads` route exists in either environment — admin KYC document images cannot load at all.

**Auth flow end to end.** Login posts credentials → backend verifies with `bcrypt.compare` and signs a 30-day JWT → frontend writes `token` and `user` (including `role`) to `localStorage` → request interceptor attaches the token to subsequent calls → `protect` decodes it and populates `req.user`. Admin impersonation diverges: the backend issues a token for the target member, the frontend receives it as a URL query parameter and relocates it into `sessionStorage`, where `getToken()` prefers it over the admin's own token for the lifetime of that tab.

---

## 5. Important business logic

Three money engines, all in `services/`.

**Donation ladder (P2P upgrades).** Ten levels with doubling amounts: `{1: 300, 2: 1000, 3: 2000, 4: 4000, 5: 8000, 6: 16000, 7: 32000, 8: 64000, 9: 128000, 10: 256000}`. Upgrades must be strictly sequential, a rule enforced in three separate places as `targetLevel !== currentUnlock + 1`.

The authoritative level is **not** `User.unlockLevel`. It is `getActualCompletedLevel(memberId)` in `services/uplineEngine.js`, which reads `Donation` rows with status `APPROVED`/`COMPLETED`, walks 1→10, and **breaks at the first gap** — so a member who somehow completed levels 1, 2, and 4 is authoritatively at level 2. `User.unlockLevel` is a ratcheting cache that different endpoints sometimes serve instead, which is why the member profile page and the admin members list can legitimately disagree about the same member's level.

**Dynamic compression with slot-skipping.** `getLogicalUplines(startMemberId, targetLogicalLevel, planType, startingLogicalLevel)` traverses the physical sponsor chain and assigns *logical* slots to *eligible* uplines only. The key semantic is at line 136: when a candidate fails eligibility, `currentLogicalLevel` is **not** incremented, so the next physical upline is tested for the *same* logical slot. Ineligible members are recorded in a `skipped[]` array (with a human-readable reason) that is returned to the caller and persisted onto the `Donation` document — a genuinely good audit-trail decision. A `visited` Set guards against circular sponsor chains. Admin bypasses all eligibility checks, and unfilled slots collapse to admin.

Eligibility for `DONATION` requires both `activeDirectsCount >= currentLogicalLevel` and `getActualCompletedLevel(candidate) >= currentLogicalLevel`.

**Level Income.** `distributeLevelIncome(joiningMemberId, joiningMemberName, sponsorId)`. 9 slots × ₹20 flat. Crucially, `if (physicalDepth > 1)` — **the immediate sponsor is not paid**, so payouts land on levels 2–10 (`payoutSlotLevel = successfulSlots + 2`). Requires `activeDirectsCount >= payoutSlotLevel`. Unfilled slots flush to `User.findOne({ role: 'admin' })`. Wallet credits use atomic `$inc`, which is the correct pattern.

**Repurchase Income.** `distributeRepurchaseIncome(order, sponsorId, totalReserveAmount)`. 10 slots, each `Number((totalReserveAmount / 10).toFixed(2))`. Unlike Level Income it **does** pay depth 1, uses slots 1–10, and has **no active-directs requirement** — ACTIVE status alone qualifies. Also uses `$inc`.

**These three engines are three independent reimplementations of the same traversal**, and they have already diverged. See §7 item 1.

**Wallet movement.** Deposits and withdrawals are request-and-approve, adjusted by `adjustWalletOnStatusChange`. There is no state machine: the transition `Pending → Approve → Reject` refunds a payout that was already approved, because the handler keys only off the `Reject` literal rather than validating the transition. Note also an enum asymmetry — withdrawals use `'Reject'`, deposits use `'Rejected'`.

**Validation policy.** `elcon-backend/VALIDATION_RULES.md` documents a "ONE PERSON, ONE ID POLICY": `email`, `contactNo`, `aadharNo`, and `panNo` must all be unique, returning `409` with codes `EMAIL_DUPLICATE`, `MOBILE_DUPLICATE`, `AADHAAR_DUPLICATE`, `PAN_DUPLICATE`, mapped from MongoDB error 11000.

---

## 6. Deployment setup

**Frontend — Netlify.** `netlify.toml` at the repo root is the only deployment config in the entire repository:

```toml
base = "elcon-frontend"
command = "CI=false npm run build"
publish = "build"
# SPA fallback: /* → /index.html  200
```

`CI=false` suppresses treating build warnings as errors — so warnings never fail a deploy. The SPA redirect is required for client-side routing to survive a hard refresh.

**Backend — Render**, at `https://elcon-network.onrender.com/api`. There is **no `render.yaml`, no Dockerfile, and no CI workflow** anywhere in the repo. The entire backend deployment configuration — build command, start command, and every environment variable — exists only in the Render dashboard and is not reproducible from source. Recreating or migrating the service would require reverse-engineering it from `server.js`.

**Secrets.** `elcon-backend/.env.example` is byte-identical to `.env` and contains the live Atlas connection string with inline credentials and the real `JWT_SECRET` (whose value ends in the literal text `change_this`). It avoided being committed only because the backend `.gitignore` happens to list `.env.example`.

**Two problems that follow from the single-cluster setup.** `tests/dashboard.test.js` calls the real `connectDB()`, so `npm test` runs against production. And the backend root contains destructive, unguarded scripts pointed at production with no `NODE_ENV` check or confirmation prompt: `execute_deletion.js` (`User.deleteMany` of every member except admin and a hardcoded `EL71432550`, leaving all related collections orphaned) and `seedRepurchase.js` (`RepurchaseIncome.deleteMany({})`, then inserts fabricated rows).

Relatedly, `elcon-backend/backups/users_backup_1787125410646.json` **is tracked in git** — `backups/` is not gitignored. It contains email, contact number, Aadhaar, PAN, bank details, UPI ID, and wallet balance for the member base. Password hashes are absent only because the schema marks them `select: false`. Its presence indicates `execute_deletion.js` has already been run at least once.

---

## 7. Potential risky areas — where a change could break things

Ordered by blast radius.

**1. Three divergent upline-traversal implementations.** `uplineEngine.getLogicalUplines` is used by **only** `donationsController.js`; `levelIncomeService` and `repurchaseIncomeService` each reimplement the walk inline. Fixing a rule in one does not fix the others. They have already diverged concretely:

| | uplineEngine | levelIncomeService | repurchaseIncomeService |
|---|---|---|---|
| blocked check | `isBlocked !== true` | `isBlocked === false` | `isBlocked === false` |
| pays depth 1 | n/a | **no** (slots 2–10) | **yes** (slots 1–10) |
| directs required | `>= logicalLevel` | `>= payoutSlotLevel` | **none** |

The `!== true` vs `=== false` split is a live behavioural difference: a legacy user document where `isBlocked` is absent is *eligible* under uplineEngine and *skipped* by both services. Also note `uplineEngine`'s own internal inconsistency — line 69 excludes blocked members, but the active-directs count fifteen lines below (lines 80–83) filters only on `accountStatus: 'ACTIVE'` and does not exclude them. And the `planType === 'LEVEL_INCOME'` branch inside `uplineEngine` (lines 94–105) is **dead code**, since level income never calls it. Anyone "cleaning that up" should know it is unreachable, not broken.

**2. `.lean()` vs Mongoose documents — and a confirmed live money-losing bug.** `findEligibleUpline` returns a plain object on *both* paths (`uplineEngine.js:64` `.lean()`, and the admin fallback at `donationsController.js:35` `.lean()`). Then, in `upgradeMember`:

```js
user.walletBalance = (user.walletBalance || 0) - amount;
user.unlockLevel = targetLevel;
await user.save();          // line 141 — payer IS debited

upline.walletBalance = (upline.walletBalance || 0) + amount;
await upline.save();        // line 145 — TypeError: upline.save is not a function
```

There is no re-fetch between the two. So every call to `POST /api/donations/upgrade` **debits the payer, then throws**, the receiver is never credited, no `Donation` row is written, and the client gets a 500. Because the authoritative level comes from `Donation` rows rather than `unlockLevel`, the level never actually completes — so the member can retry and **be debited again**. This endpoint is wired into the UI (`src/api/donationsService.js:9`), so it is reachable in production. Any refactor of `uplineEngine` consumers must respect the lean-vs-document distinction.

**3. No transactions anywhere.** `startSession` and `withTransaction` appear nowhere in the repository. Every money movement is a sequence of independent writes with no rollback — the bug above is exactly what that costs. Note the two conflicting wallet-update styles: the income services use atomic `$inc` (safe under concurrency), while the donation, deposit, and withdrawal controllers use read-modify-`save()` (lost-update race). **Do not "harmonise" these by converting `$inc` into read-modify-write.**

**4. `PUT /api/members/profile/:memberId` does unfiltered `Object.assign(user, req.body)`.** `role`, `walletBalance`, `memberId`, `unlockLevel`, and `isBlocked` are all mass-assignable through it. This is the highest-blast-radius write in the application.

**5. `POST /api/epins/generate` has no admin gate.** `routes/epins.js:26` carries `protect` only, while sibling franchise routes correctly carry `authorize('admin')`. Any authenticated member can mint unlimited e-pins to themselves with an arbitrary monetary `cost`; `qty` is unbounded, so the create loop is also a DoS vector. Generated e-pin `cost` flows into `joiningAmount` at registration.

**6. Authorization gaps to fix carefully, since UI behaviour may depend on the current leniency.**
`GET /api/level-income/reports` scopes with `if (req.user.role === 'user')`, so any token whose role is not exactly `'user'` receives the admin-wide view — compare `repurchaseIncomeController.js:11`, which correctly uses `role !== 'admin'`. `GET /api/members/team-tree` and `/tree-node` read `req.query.memberId` with no ownership check, letting any member dump any other member's downline. `GET /api/auth/sponsor/:id` is fully public and returns email and contact number for any `memberId`.

**7. `server.js` / `app.js` drift.** Any route or CORS change applied to only one file widens the gap, and tests will keep passing against a configuration that does not exist in production.

**8. Route-order coupling at the `/api` mount.** As described in §2 — `/api/health` must stay above `productRoutes`, and `/api/dashboard` currently survives below it only by luck. Adding a parameterised route or `router.use()` to `routes/products.js` breaks the dashboard silently.

**9. `unlockLevel` cache vs computed level.** Changing any endpoint to serve one instead of the other will visibly change numbers on the member profile and admin members list. Establish which is intended before touching it.

**10. Denormalised caches with no invalidation.** `levelDepth`, `unlockLevel`, and the various `activeDirects` counters are written at specific events and never recomputed. The five repair scripts in `scripts/` exist because these have already drifted.

**11. `distributeRepurchaseIncome` records the wrong member.** `productsController.js` passes an `order` whose `userId` is a raw ObjectId, so `order.userId.memberId` is `undefined` and `purchasingMemberId` silently stores the ObjectId string instead (`repurchaseIncomeService.js:65, :107`). The repurchase report's member column is therefore wrong today — fixing it changes historical report output, so plan a backfill.

**12. Float money.** Repurchase Income `$inc`s `reserveAmount / 10` as a Double. Any move to `Decimal128` is a data migration, not a schema edit.
