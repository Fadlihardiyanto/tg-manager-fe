# Urator — Telegram Community Management Dashboard

Multi-tenant SaaS frontend for running **paid Telegram communities**: connect Telegram bots,
manage groups and members, sell subscription packages, collect payments through Midtrans,
broadcast to groups, and bill tenants — all from one dashboard.

`Next.js 16` · `React 19` · `TypeScript` · `Tailwind CSS 4` · `shadcn/ui` · `next-intl`

> Frontend for the [tg-manager-be](https://github.com/Fadlihardiyanto/tg-manager-be) backend (Go + Fiber + PostgreSQL).
> Built on top of [Kiranism's next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) (MIT) — see [License](#license).

---

## What it does

Two roles share one codebase: **tenants** (community owners) and **platform operators** (superadmin),
plus a public marketing/checkout surface.

### Public site

| Area | Detail |
| --- | --- |
| Landing page | Hero, features, live pricing (reads `/api/v1/public/plans` with a static fallback), FAQ, footer |
| Legal | `/about`, `/privacy-policy`, `/terms-of-service` |
| Checkout | `/checkout` → Midtrans Snap payment for a member subscription, `checkout/success` result page |

### Tenant dashboard — `/{locale}/{tenant-slug}/dashboard/*`

| Page | Detail |
| --- | --- |
| Overview | KPI cards + revenue charts (Recharts) |
| Bots | Telegram bot CRUD, bot detail, stats, connect/disconnect, transfer-to-group flow |
| Groups | Connect flow (token + status polling), group detail, disconnect, sync, bulk delete |
| Members | Listing, detail drawer, kick/extend/sync/resend-link, bulk actions |
| Packages | Subscription packages per group |
| Discounts | Package discounts — percentage or fixed amount |
| Commands | Custom bot command CRUD |
| Broadcast | Rich-text (Tiptap) Telegram broadcast composer, scheduling, confirm dialog |
| Transactions | Tenant transaction/payment history |
| Reports | Daily report settings and failed-job listing |
| Billing | Active plan, quota card, billing history, cancel pending checkout |
| Midtrans | Payment gateway credentials (encrypted key exchange with the backend) |
| Migration | Bulk member import from CSV/Excel, template download + export |

### Superadmin — `/{locale}/superadmin/*`

Platform overview, admin users, roles & permissions, tenants (incl. impersonation),
platform plans, and audit logs.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js **16.2.6** (App Router, RSC, standalone output) |
| UI runtime | React **19.2.4** |
| Language | TypeScript **5.7.2** (`strict`) |
| Styling | Tailwind CSS **4.2.2** (`@tailwindcss/postcss`), shadcn/ui *new-york*, zinc, CSS variables |
| i18n | next-intl **4.13** — locale prefix `as-needed`, currently `id` only (`messages/en.json` is kept for translation work) |
| Data | TanStack Query 5, TanStack Table 8, TanStack Form 1 + Zod 4 |
| State | Zustand 5 (auth stores), nuqs (URL state) |
| Editor | Tiptap 3 (broadcast composer) |
| Charts | Recharts 2 |
| Payments | Midtrans Snap |
| Quality | oxlint + oxfmt, husky + lint-staged |
| Package manager | **Bun** (`bun.lock`) |

The auth layer is **custom JWT** (`access_token` / `refresh_token` httpOnly cookies), not Clerk —
`src/features/auth/api/service.ts` sets and refreshes those cookies, and `src/lib/api-client.ts`
retries a request once after a `401`.

---

## Getting started

### Requirements

- Bun ≥ 1.3 (or Node ≥ 22 with npm)
- A running [tg-manager-be](https://github.com/Fadlihardiyanto/tg-manager-be) backend (defaults to `http://127.0.0.1:8080`)

### Setup

```bash
bun install
cp .env.example .env.local     # adjust values as needed
bun dev                        # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | Backend base URL. Falls back to `http://127.0.0.1:8080` when unset |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | for checkout | Midtrans Snap client key |
| `NEXT_PUBLIC_MIDTRANS_ENV` | no | `sandbox` (default) or `production` |
| `BUILD_STANDALONE` | no | `true` enables Next.js standalone output (Docker/self-host) |
| `NEXT_DIST_DIR` | no | Overrides the build output directory |

See [`.env.example`](.env.example) for the annotated template.

### Scripts

| Command | Purpose |
| --- | --- |
| `bun dev` | Dev server (HMR) |
| `bun build` | Production build |
| `bun start` | Serve the production build |
| `bun lint` / `bun lint:strict` | oxlint (strict = warnings are errors) |
| `bun format` / `bun format:check` | oxfmt write / check |

Git hooks: `pre-commit` runs `lint-staged` (oxfmt on staged files); `pre-push` runs a real
`next build` into a throwaway `.next-build-verify-*` directory.

### Docker

```bash
docker build -t urator-fe -f Dockerfile .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.example.com urator-fe
```

The image is a 3-stage build on `node:22-slim`, installs with `bun install --frozen-lockfile`,
and runs `server.js` as a non-root user on port 3000 (`BUILD_STANDALONE=true`).
`Dockerfile.bun` is a Bun-runtime variant.

---

## Project structure

```
src/
├─ app/
│  ├─ [locale]/                 # next-intl segment (id)
│  │  ├─ (auth)/                # login, register-tenant, verify-email, forgot-password, onboarding, superadmin/login
│  │  ├─ [tenant]/dashboard/    # tenant workspace (see table above)
│  │  ├─ superadmin/            # platform operator area
│  │  ├─ checkout/, payment/    # public Midtrans checkout
│  │  └─ about/, privacy-policy/, terms-of-service/
│  └─ api/                      # route handlers proxying to the Go backend
├─ components/                  # ui/ (shadcn), forms/fields, layout/, kbar palette, themes
├─ features/                    # 17 feature slices: api (server actions) + hooks + components + schemas
├─ i18n/                        # routing.ts / request.ts
├─ lib/                         # api-client, auth-headers, tenant-path, filter-nav, parsers
├─ stores/                      # Zustand auth stores
├─ styles/themes/               # theme CSS
└─ proxy.ts                     # Next.js middleware: locale + auth guard
```

Key boundaries:

- `src/proxy.ts` redirects protected `/{slug}/dashboard` routes to `/login` when no auth cookie is present.
- `src/app/[locale]/[tenant]/layout.tsx` validates the URL tenant slug against `getMe().data.client.slug`.
- `src/app/[locale]/superadmin/layout.tsx` guards the operator area via `getAdminMe()`.
- Sidebar navigation is RBAC-filtered (`src/config/nav-config.ts` + `src/lib/filter-nav.ts`, driven by
  the permissions returned by `getMe()`).

---

## Testing

There is no automated test suite in this repository yet — verification is `bun lint` plus a real
`bun build` on every push. Manual QA notes live outside the repo.

---

## Need a similar application?

I build production web apps like this one (Next.js/React frontends, Go/Node backends, payment and
Telegram integrations). Reach out for freelance or contract work:

**fadli.hardiyanto04@gmail.com**

<sub>Tertarik membuat aplikasi serupa? Bisa hubungi **fadli.hardiyanto04@gmail.com** untuk jasa pembuatan aplikasi.</sub>

---

## License

MIT — this project is a derivative work of
[next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
(Copyright © Kiranism), see [LICENSE](LICENSE).
