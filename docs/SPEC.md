# Caddy UI — Product Spec

Status: **Draft** · Owner: @bernardotwistag · Last updated: 2026-06-28

This document specs the next round of work on Caddy UI. Each feature is written to be
independently implementable: problem, design, the env/API/file surface it touches, and
acceptance criteria. Milestones are ordered by priority.

## Guiding principles

- **Safe by default.** The UI controls the full Caddy admin API — treat every write as dangerous.
- **Reflect reality.** No hardcoded/mock data in the UI; everything comes from the live Caddy config.
- **Self-hostable.** Configure via environment variables; no external services required.
- **Small, reversible changes.** Validate before apply; always offer a way back.

## Milestones

| # | Milestone | Features | Why |
|---|---|---|---|
| **M1** | Make it safe & fresh | F1 Auth + CORS, F11 UI modernization + dark mode, F2 Real dashboard + route parser, F3 Config safety net | Removes the genuine risks of running it today and modernizes the look |
| **M2** | Make it powerful | F4 TLS/cert management, F5 Complete handlers, F8 Live upstreams | Differentiating Caddy features |
| **M3** | Make it pleasant | F9 Logs viewer, F7 Multi-instance | Polish & scale |
| **M4** | Make it trustworthy | F10 Tests + Next CVE bump | Long-term maintainability |

---

## F1 — Authentication & CORS hardening 🔴

### Problem
Anyone who can reach Caddy UI has unauthenticated, full control of the Caddy admin API
(replace/stop the entire config). The proxy also returns `Access-Control-Allow-Origin: *`.

### Design
Single-user, password-only login backed by an environment variable. No user database.

- **Env vars**
  | Variable | Required | Description |
  |---|---|---|
  | `ADMIN_PASSWORD` | yes (to enable auth) | The password used to log in. If **unset**, the app boots in an explicit "auth disabled" mode and logs a loud warning on every request. |
  | `SESSION_SECRET` | recommended | Secret used to sign session cookies. If unset, derive from `ADMIN_PASSWORD` (rotating the password invalidates sessions). |
  | `SESSION_TTL_HOURS` | no (default `168`) | Session lifetime. |
- **Login flow**
  1. `/login` page with a single password field.
  2. `POST /api/auth/login` compares the submitted password to `ADMIN_PASSWORD` using a
     constant-time comparison.
  3. On success, set an **httpOnly, SameSite=Lax, Secure** cookie containing a signed
     session token (HMAC of `{issuedAt, exp}` with `SESSION_SECRET`).
  4. `POST /api/auth/logout` clears the cookie.
- **Enforcement** — Next.js `middleware.ts` protects everything except `/login`,
  `/api/auth/*`, `/api/health`, and static assets. Crucially it **also protects
  `/api/caddy-proxy/*`**, so the proxy can't be hit directly without a session.
- **Brute-force protection** — in-memory rate limit (e.g. 5 attempts / 15 min / IP) with a
  backoff message. Good enough for a self-hosted single-user app.
- **CORS** — replace the wildcard in `caddy-proxy` with the request's own origin only
  (same-origin), or drop CORS headers entirely since the browser calls are same-origin.

### Files
- `src/middleware.ts` (new), `src/app/login/page.tsx` (new),
  `src/app/api/auth/login/route.ts` + `logout/route.ts` (new),
  `src/lib/auth/session.ts` (new), edit `src/app/api/caddy-proxy/[...path]/route.ts`,
  update `.env.example`, README, and the help page.

### Acceptance criteria
- With `ADMIN_PASSWORD` set, all pages and `/api/caddy-proxy/*` return 401/redirect to
  `/login` until authenticated.
- Correct password sets a session cookie and grants access; logout revokes it.
- `/api/health` remains public (for container checks).
- With `ADMIN_PASSWORD` unset, the app still runs but logs a clear warning.
- `caddy-proxy` no longer emits `Access-Control-Allow-Origin: *`.

---

## F2 — Real dashboard stats & robust route parsing 🔴

### Problem
`app/(dashboard)/page.tsx` renders **hardcoded** `httpStats`/`serviceStats`. The HTTP page
also fails to extract Type/Origins from real `subroute`/`group` route shapes (live configs
showed empty fields).

### Design
- Replace mock stats with values derived from the real config and `/reverse_proxy/upstreams`
  (healthy/total upstreams, route counts). If a metric can't be computed, omit the card
  rather than fake it.
- Write a single resilient `parseRoute()` helper that walks nested `subroute` → `routes` →
  `handle` to find the effective handler and upstream dials, and reuse it on both the
  dashboard and the HTTP/server-card views.

### Files
- `src/lib/caddy/parse-route.ts` (new, with unit tests), edit dashboard page, `server-card.tsx`.

### Acceptance criteria
- Dashboard numbers change when the real config/upstreams change.
- HTTP cards show correct Type and Origins for nested subroute configs (verified against the
  live instance config).

---

## F3 — Config safety net (validate · diff · backup · rollback) 🔴

### Problem
The config editor applies changes to live Caddy with no validation and no undo.

### Design
- **Validate before apply** — POST the candidate config to Caddy's `/adapt` (already wired in
  `adaptConfig`) or do a dry-run; block "Update" on validation errors and show the message.
- **Visual diff** — show an inline diff between current and edited config in the comparison view.
- **Backups** — before every successful apply, snapshot the previous config. Store snapshots
  (timestamped) either in `localStorage` (simple) or a small server-side store under a
  configurable `DATA_DIR` (persistent across browsers).
- **Rollback** — a "History" panel listing snapshots with one-click restore (which just
  re-applies that snapshot through the normal apply path).

### Acceptance criteria
- Invalid JSON/config cannot be applied; the Caddy error is surfaced.
- Each apply creates a restorable snapshot; restoring reverts Caddy to that config.

---

## F4 — TLS / certificate management 🟡

### Problem
Caddy's headline feature (automatic HTTPS) has no representation in the UI.

### Design
- A **Certificates** page showing managed certificates: subjects/SANs, issuer, validity
  window, and days-to-expiry (badge when near expiry).
- Surface PKI/CA info using the existing `getCAInfo` / `getCACertificates` client methods,
  plus ACME issuer config from the `tls` app in the config.
- Read-only first; editing ACME/issuer settings is a fast follow.

### Acceptance criteria
- Page lists certs with expiry; CA chain viewable; no crashes when the `tls` app is absent.

---

## F5 — Complete handler types 🟡

### Problem
Only `reverse_proxy` and `origin` are active in `server-form.tsx`; the rest are commented out.

### Design
Incrementally enable and build forms for the scaffolded handlers, each behind its own tab/section:
`file_server`, `static_response`, `headers`, `rewrite`, `encode`, `redir`. Reuse the existing
Zod-schema + clean-config pattern. Ship one handler per PR.

### Acceptance criteria
- Each enabled handler can be created/edited and round-trips correctly through `cleanConfig`
  to valid Caddy JSON (arrays preserved — see the `cleanConfig` array fix already landed).

---

## F6 — Dark mode 🟡 (folded into F11)
`next-themes` is already a dependency but unused, and `globals.css` already ships the full
`.dark` palette with `darkMode: ["class"]` in Tailwind. Add a theme provider + a header
toggle (light/dark/system) and make the Monaco editors follow the active theme.

## F11 — UI modernization & mobile 🟡

### Problem
The UI is functional but dated: a plain top bar, no mobile navigation, `globals.css` hardcodes
`font-family: Arial` (overriding the Geist fonts loaded in the layout), dialogs and grids
aren't tuned for small screens, and there's no dark mode. It should feel current and work on a phone.

### Design
- **Typography** — remove the hardcoded Arial; use the Geist font variables already wired in
  `layout.tsx`.
- **Header** — sticky, slightly translucent (`backdrop-blur`), with the brand, nav, theme
  toggle, update indicator, and a **logout** button. On mobile (`< md`) the nav collapses into
  a hamburger sheet/menu.
- **Dark mode** — theme provider + toggle (F6), Monaco theme follows.
- **Components** — modernize buttons (consistent sizing, subtle hover/active, focus rings),
  cards (hover lift, clearer borders), and dialogs (rounded, mobile-friendly — full-width
  sheet on small screens, centered modal on desktop).
- **Responsiveness** — every page readable at 375px: grids collapse to one column, the config
  comparison stacks vertically, tables/editors scroll horizontally inside their own container.
- **Empty/loading states** — friendlier skeletons and empty states.

### Files
- `src/app/globals.css`, `src/app/layout.tsx`, `src/providers/theme-provider.tsx` (new),
  `src/components/layout/dashboard-layout.tsx`, `src/components/layout/theme-toggle.tsx` (new),
  `src/components/layout/mobile-nav.tsx` (new), `src/components/ui/*` (button/dialog/card tweaks).

### Acceptance criteria
- Light/dark/system toggle works and persists; Monaco follows the theme.
- Header collapses to a working mobile menu under `md`; all pages usable at 375px width.
- No hardcoded Arial; Geist fonts render.

## F7 — Multi-instance support 🟢
Allow managing several Caddy servers. Add a server registry (name + admin URL, stored in
`DATA_DIR`) and an instance switcher in the header; scope all queries to the active instance.
Requires the proxy to accept a target instead of only `CADDY_ADMIN_URL`.

## F8 — Live upstream & health view 🟡
Real-time upstream status from `/reverse_proxy/upstreams` (healthy/down, request counts,
fails) with periodic polling and small sparklines on the existing upstream page.

## F9 — Logs viewer 🟢
Surface Caddy access/error logs in-app (tail + filter). Depends on how the deployment exposes
logs (file mount, or Caddy's log output) — define the source as part of this feature.

## F10 — Tests & dependency hygiene 🟢
- Add unit tests for `cleanConfig`, `parseRoute`, version compare, and auth/session.
- Add a minimal Playwright smoke test (login → dashboard → open add-server dialog).
- Bump `next` past `15.1.6` to resolve `CVE-2025-66478`.

---

## Out of scope (for now)
- Multi-user accounts / RBAC (single shared password is sufficient for the target audience).
- Editing ACME/issuer settings (read-only TLS first).
- Metrics/Prometheus integration.

## Decisions
1. **Auth:** single shared password via `ADMIN_PASSWORD`. No per-user accounts for now (RBAC
   stays out of scope).
2. **Persistence:** config backups/history are stored **browser-local (`localStorage`)** for
   now — zero infra, works immediately. Server-side `DATA_DIR` persistence is a documented
   future upgrade (needed for multi-instance, F7).
3. **Logs:** assume Caddy logs go to **stdout** for now; the logs viewer (F9) will read the
   container's stdout stream. Revisit if a file/Loki source is preferred later.
