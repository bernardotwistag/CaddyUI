# Caddy UI — Implementation Plan (M1)

> Note: the `superpowers` plugin isn't available in this environment, so this is a hand-authored
> plan in the same spirit — phased, with explicit verification gates. Tracks [SPEC.md](./SPEC.md).

## Scope of this pass

Implement **M1 — Make it safe & fresh**: F1 (auth + CORS), F11 (UI modernization + dark mode),
F2 (real dashboard + route parser). F3 (config backup/rollback) follows in the same milestone.
M2–M4 are deferred to later passes.

Decisions in effect: single `ADMIN_PASSWORD`, `localStorage` backups, stdout logs.

## Constraint

The dev container can't `yarn build` locally (Node engine mismatch, no `node_modules`).
Verification happens via the GitHub Actions build on push. Until then, code is written to the
React 19 / Next 15 rules we already hit (no `setState` during render or in effects; validate in
event handlers; server-only secrets).

---

## Phase 1 — Auth & CORS (F1)

1. `src/lib/auth/config.ts` — read `ADMIN_PASSWORD`, `SESSION_SECRET` (fallback: derived from
   password), `SESSION_TTL_HOURS` (default 168); `authEnabled = !!ADMIN_PASSWORD`.
2. `src/lib/auth/session.ts` — Web Crypto HMAC sign/verify of `{exp}` token (works in edge
   middleware and node routes); cookie name `caddyui_session`.
3. `src/app/api/auth/login/route.ts` — constant-time password check → set httpOnly cookie.
4. `src/app/api/auth/logout/route.ts` — clear cookie.
5. `src/middleware.ts` — protect everything except `/login`, `/api/auth/*`, `/api/health`,
   `_next`, static; pages redirect to `/login`, `/api/caddy-proxy/*` returns 401.
6. `src/app/login/page.tsx` — single password form.
7. Harden `caddy-proxy` CORS: echo same-origin instead of `*`.
8. `.env.example` + README: document `ADMIN_PASSWORD` / `SESSION_SECRET`.

**Gate:** with `ADMIN_PASSWORD` set, unauthenticated requests to pages and `/api/caddy-proxy/*`
are blocked; login works; `/api/health` stays public.

## Phase 2 — UI modernization & dark mode (F11 + F6)

1. `src/providers/theme-provider.tsx` — wrap `next-themes`.
2. `layout.tsx` — add provider (`attribute="class"`, `defaultTheme="system"`); keep Geist fonts.
3. `globals.css` — drop hardcoded Arial; base typography via Geist.
4. `theme-toggle.tsx` + `mobile-nav.tsx` — header controls; sticky blurred header with brand,
   nav, theme toggle, update indicator, logout; hamburger menu under `md`.
5. Editors follow theme (`vs-dark` / `light`).
6. Pass over dialogs/cards/buttons for hover/focus/mobile width.

**Gate:** theme toggle persists; header collapses on mobile; usable at 375px.

## Phase 3 — Real dashboard & route parser (F2)

1. `src/lib/caddy/parse-route.ts` (+ logic usable by tests) — walk nested `subroute → routes →
   handle` to extract `{ host, handler, upstreams }`; iterate **all** servers, not just `srv1`.
2. Dashboard: replace hardcoded `httpStats`/`serviceStats` with real counts (routes, servers,
   upstream health from `/reverse_proxy/upstreams`); drop cards that can't be computed.
3. HTTP page + server-card: use `parseRoute`; fix the `srv1`-only assumption.

**Gate:** dashboard reflects real config/upstreams; HTTP cards show correct Type/Origins for
nested subroute configs.

## Phase 4 — Config safety net (F3)

1. Snapshot the current config to `localStorage` before each successful apply.
2. History panel on the Config page with one-click restore (re-applies a snapshot).
3. Surface Caddy validation/apply errors (already partly done); Caddyfile uses `/adapt`.

**Gate:** every apply creates a restorable snapshot; restore reverts Caddy.

---

## Verification checklist (run on first push)

- [ ] GitHub Actions build is green
- [ ] `ADMIN_PASSWORD` set → login required; unset → runs with warning
- [ ] `/api/health` reachable without auth
- [ ] Dark/light toggle + mobile nav work
- [ ] Dashboard numbers are real
- [ ] Config apply creates a restorable snapshot
