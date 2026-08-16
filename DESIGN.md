---
name: TG Manager
description: SaaS dashboard untuk mengelola komunitas Telegram berbayar — multi-tenant, broadcast, billing Midtrans
colors:
  background: oklch(1 0 0)
  foreground: oklch(0.2077 0.0398 265.7549)
  primary: oklch(0.4778 0.1356 251.8383)
  primary-foreground: oklch(1 0 0)
  secondary: oklch(0.9683 0.0069 247.8956)
  secondary-foreground: oklch(0.3717 0.0392 257.287)
  muted: oklch(0.9683 0.0069 247.8956)
  muted-foreground: oklch(0.5544 0.0407 257.4166)
  accent: oklch(0.9705 0.0142 254.6042)
  accent-foreground: oklch(0.4778 0.1356 251.8383)
  destructive: oklch(0.6368 0.2078 25.3313)
  destructive-foreground: oklch(1 0 0)
  border: oklch(0.9288 0.0126 255.5078)
  ring: oklch(0.4778 0.1356 251.8383)
  success: "#22c55e"
  warning: "#f59e0b"
  danger: "#ef4444"
  chart-1: oklch(0.4778 0.1356 251.8383)
  chart-2: oklch(0.7535 0.139 232.6615)
  chart-3: oklch(0.6959 0.1491 162.4796)
  chart-4: oklch(0.7686 0.1647 70.0804)
  chart-5: oklch(0.5854 0.2041 277.1173)
  sidebar: oklch(0.9946 0.0026 286.3519)
  sidebar-foreground: oklch(0.1615 0.0105 285.1663)
  sidebar-primary: oklch(0.4778 0.1356 251.8383)
  sidebar-accent: oklch(0.9705 0.0142 254.6042)
  sidebar-border: oklch(0.9163 0.0162 286.0759)
typography:
  sans:
    fontFamily: Satoshi, Inter, sans-serif
    fontSize: "14px (body)"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: JetBrains Mono, monospace
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  px: 1px
  "0.5": 2px
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 20px
  "6": 24px
  "8": 32px
  "10": 40px
  "12": 48px
components:
  button-default:
    backgroundColor: oklch(0.4778 0.1356 251.8383)
    textColor: oklch(1 0 0)
    rounded: 6px
    padding: 8px 16px (default), 8px 12px (with icon)
  button-default-hover:
    backgroundColor: oklch(0.4778 0.1356 251.8383 / 0.9)
  button-outline:
    backgroundColor: transparent
    textColor: oklch(0.2077 0.0398 265.7549)
    rounded: 6px
    padding: 8px 16px
    border: 1px solid oklch(0.9288 0.0126 255.5078)
  button-destructive:
    backgroundColor: oklch(0.6368 0.2078 25.3313)
    textColor: oklch(1 0 0)
    rounded: 6px
  button-ghost:
    backgroundColor: transparent
    textColor: oklch(0.2077 0.0398 265.7549)
    rounded: 6px
  card:
    backgroundColor: oklch(1 0 0)
    textColor: oklch(0.2077 0.0398 265.7549)
    rounded: 12px
    border: 1px solid oklch(0.9288 0.0126 255.5078)
    padding: 24px (vertical), 24px (horizontal)
  input:
    backgroundColor: oklch(1 0 0)
    textColor: oklch(0.2077 0.0398 265.7549)
    rounded: 6px
    border: 1px solid oklch(0.9288 0.0126 255.5078)
    padding: 8px 12px
  badge:
    backgroundColor: oklch(0.9683 0.0069 247.8956)
    textColor: oklch(0.3717 0.0392 257.287)
    rounded: 9999px
    padding: 2px 10px
---

# Design System: TG Manager

## Overview

**Creative North Star: "The Command Center"**

TG Manager is a command center for Telegram community operators — a clean, professional dashboard where tenants manage their bots, groups, members, and billing from one place. The design prioritizes clarity over decoration, efficiency over flourish, and a quiet confidence that the tool handles the complexity so the user doesn't have to.

The system is built around a **flat-rest, subtle-hover** philosophy: surfaces sit flat with clean borders and no elevation at rest, then respond with a gentle lift on interaction. This creates a calm, organized workspace where the hierarchy emerges from spacing and typography rather than exaggerated depth.

**Key Characteristics:**
- Clean, flat surfaces with crisp 1px borders
- Warm blue primary accent (the "Command" blue) — used sparingly for actionable elements
- Spacious typography with Satoshi as the primary voice — modern, approachable, professional
- Generous rounded corners (16px on cards, 12px on buttons/inputs)
- Subtle hover lift (`hover:-translate-y-0.5` + `hover:shadow-md`) as the primary interaction feedback
- Indonesian-first UI with consistent, predictable patterns

## Colors

The palette centers on a single confident blue primary, supported by a cool-gray neutral family. Color is a reward — applied to interactive elements, status indicators, and semantic feedback, not decoration.

### Primary
- **Command Blue** (oklch(0.4778 0.1356 251.84)): Primary actions, active states, links, and the brand anchor. Applied sparingly — buttons, active sidebar items, badges in their color-coded variant. Not used for backgrounds or decorative elements.

### Neutral
- **Card White** (oklch(1 0 0)): Cards, popovers, sidebar — all surface backgrounds.
- **Near-Black** (oklch(0.2077 0.0398 265.75)): Body text, headings, high-emphasis content.
- **Muted Gray** (oklch(0.9683 0.0069 247.90)): Muted backgrounds, secondary buttons, tag backgrounds.
- **Muted Text** (oklch(0.5544 0.0407 257.42)): Secondary text, placeholders, non-essential labels.
- **Border Gray** (oklch(0.9288 0.0126 255.51)): Default border for cards, inputs, dividers. The signature structural line — every surface boundary.

### Semantic
- **Destructive Red** (oklch(0.6368 0.2078 25.33)): Destructive actions (delete, disconnect), error states. Used with white text (`destructive-foreground`).
- **Chart Blue** (oklch(0.7535 0.139 232.66)): Secondary chart color, occasional accent.
- **Chart Green** (oklch(0.6959 0.1491 162.48)): Success states, active status badges.
- **Chart Amber** (oklch(0.7686 0.1647 70.08)): Warnings, pending states.
- **Chart Purple** (oklch(0.5854 0.2041 277.12)): Role accent (gatekeeper), tertiary emphasis.

### Named Rules
**The One Voice Rule.** The primary blue is used on maximum 15% of any given screen. Its restraint is the point — when a user sees blue, they know it's actionable.

**The Status Color Convention.** Green = active/success. Red = with caution/destructive. Amber = pending/expiring. This convention is non-negotiable across all components and pages.

## Typography

**Sans Font:** Satoshi (with Inter fallback)
**Mono Font:** JetBrains Mono (for code, tokens, IDs, and numeric data)

Satoshi is a modern geometric sans-serif — warmer than Inter, sharper than SF Pro. It pairs with the Command Center ethos: clear, confident, unfussy.

### Hierarchy

- **Display** (Satoshi 700, 24px, 1.2 line-height): Page titles, hero numbers (stats cards). Used sparingly.
- **Title** (Satoshi 600, 18–20px, 1.3): Section headers, card titles, dialog headings.
- **Subtitle** (Satoshi 500, 14px, 1.4): Card subtitles, stat labels. Usually `text-muted-foreground`.
- **Body** (Satoshi 400, 14px, 1.5) (<https://tg-manager-fe.vercel.app: Primary content text, descriptions, table content). Max line length ~70ch for readability.
- **Label** (Satoshi 600, 12px, uppercase: 0.14em tracking): Badges, form labels, stat headers. Uppercase variant used in key metric labels for scannability.
- **Small** (Satoshi 400, 12px, 1.4): Footer content, metadata, timestamps. Usually `text-muted-foreground`.
- **Mono** (JetBrains Mono 500, 13px): Telegram bot IDs, chat IDs, token values, command snippets.

### Named Rules
**The Tabular-Numbers Rule.** Any number that represents a countable quantity (member count, total bots, durations) uses `tabular-nums` for stable width during updates.

## Layout

The layout follows a responsive dashboard pattern with a collapsible sidebar (desktop) / bottom nav (mobile). Page containers use a consistent horizontal padding scale: `px-3` (mobile) → `md:px-4` (desktop).

### Grid & Rhythm

- **Spacing base:** `0.25rem` (4px) — the universal spacing unit.
- **Vertical rhythm:** Content sections separated by `gap-4` (16px) within a page, `gap-6` (24px) within a section.
- **Card padding:** `p-5` (20px) or `py-6 px-6` (24px) — generous internal spacing for readability.
- **Content density:** Dashboard-density (8–32px scale). Stats cards and bot cards are compact; dialogs and sheets are spacious.
- **List grid:** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` for card-based listings.
- **Stat grid:** `grid-cols-2 lg:grid-cols-4` for metric rows.

### Breakpoints
- `sm`: 640px — tablet portrait, card grid expands to 2 columns
- `md`: 768px — tablet landscape, sidebar becomes visible
- `lg`: 1024px — desktop, stat grid to 4 columns
- `xl`: 1280px — wide desktop, card grid to 3 columns

### Named Rules
**The Bottom-Up Rule.** On mobile, primary actions are placed at the bottom of the content (modals, sheets, bottom bar). On desktop, they migrate to the top-right.

## Elevation & Depth

Flat at rest, lifted on interaction.

### System
- **Rest state:** All surfaces are flat — no box-shadow, no drop-shadow. Depth is communicated entirely through layering (background color) and the 1px `border-border` boundary.
- **Interactive state:** Hovered elements (buttons, cards, items) lift with `hover:-translate-y-0.5` and `hover:shadow-md`. The shadow is subtle — enough to feel the separation, not enough to compete.
- **Floating surfaces:** Modals, drawers, tooltips, and dropdowns sit above the content layer with their own shadow boundary (via the Dialog/Sheet overlay backdrop at ~40% black).

### Shadow Vocabulary (when re-enabled)
The project's shadow CSS variables are currently set to `none`. Re-enabling for hover states should use:
- **shadow-sm** (`0 1px 2px 0 rgba(0,0,0,0.05)`): Subtle card hover on compact surfaces.
- **shadow-md** (`0 4px 6px -1px rgba(0,0,0,0.1)`): Default hover elevation for cards and interactive containers.

## Shapes

### Radii

| Token | Value | Used For |
|-------|-------|----------|
| `rounded-sm` | 4px | Skeleton elements, compact surfaces |
| `rounded-xl` | 12px | Buttons, inputs, selects, cards, dialogs, sheets, modals |
| `rounded-lg` | 8px | Sidebar items, menu items |
| `rounded-2xl` | 16px | Quota cards, large containers, landing pricing cards |
| `rounded-full` | 9999px | Badges, pills, status indicators, "Tambah" buttons |

- **Borders:** 1px solid, `border-border` — the signature element that defines card boundaries without shadows.
- **Icon containers:** Internal icon wells inside cards often use `rounded-lg` (8px) with a colored background (e.g., `bg-primary/10`).
- **Avatar/bot icon containers:** `rounded-xl` (12px) for size-12/14 containers within bot cards and headers.
- **Connection dots:** `rounded-full` with `ring-2 ring-background` — the small indicator dot on bot avatars.

## Components

### Buttons

- **Shape:** `rounded-xl` (12px), 1px border for outline variant.
- **States:** Smooth `transition-all duration-200`. Hover reduces opacity for solid variants (`hover:bg-primary/90`); outline gets a background shift (`hover:bg-accent`). Focus state uses `focus-visible:ring-ring/50 focus-visible:ring-[3px]` ring.
- **Loading:** Buttons with `isLoading` use a grid-overlay pattern — children become invisible, a `<Spinner />` appears in their place, maintaining the button's intrinsic width and preventing layout shift.
- **Icons:** Icons in buttons are capped at 16px (`[&_svg:not([class*='size-'])]:size-4`) and aligned inline. The `has-[>svg]:px-*` pattern adjusts horizontal padding when a button only contains an icon.
- **Variants:**
  - `default` (Command Blue bg, white text) — primary CTAs, "Tambah Bot", "Simpan", "Perbarui".
  - `outline` (transparent bg, border, default text) — secondary actions, "Batal", "Edit", "Hubungkan Grup".
  - `destructive` (red bg, white text) — delete, disconnect, irreversible actions.
  - `ghost` (transparent, default text on hover) — light actions, toolbar buttons, close buttons.
  - `link` (blue text, underline on hover) — textual CTAs, "Kelola", "Buka di Telegram".
  - **Custom: `rounded-full`** — "Tambah Bot" and primary CTAs in listing pages use this variant for visual emphasis.

### Cards

- **Shape:** `rounded-xl` (12px), 1px `border-border`, no shadow at rest.
- **Background:** `bg-card` (white) — the primary surface for content grouping.
- **Internal padding:** `p-5` for bot cards, `py-6 px-6` for larger informational cards.
- **Interaction:** Many cards are clickable (bot card → detail page). Hover triggers `hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20` — the signature lift.
- **Header-Content-Footer pattern:** Cards use optional `CardHeader` (with `CardTitle` + `CardDescription`), `CardContent`, and `CardFooter`. A `CardAction` slot in the header puts actions in the grid's right column.
- **Gradient accent cards (stats):** Stat cards use a subtle gradient accent (`from-{color}/15 via-{color}/5 to-transparent`) on the left/top to color-code the metric without relying on a solid color fill.
- **Role stripe cards (bot cards):** A 6px gradient accent stripe runs across the top of bot cards, colored by the bot's role (sky=Penjualan, violet=Gatekeeper, amber=All-in-one).

### Inputs & Fields

- **Style:** `rounded-md` (6px), 1px `border-input`, white `bg-background`. Default text uses `text-foreground` with `text-sm` (14px).
- **Placeholder:** `text-muted-foreground` — visible but not distracting.
- **Focus:** `focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring` — a blue glow + blue border. Consistent with button focus.
- **Search inputs:** Use a search icon prefix (`Icons.search` as `pointer-events-none absolute left-3 top-1/2`) with `rounded-full` for the search input shape. A close button suffix appears when the search has value.
- **Selects:** Custom-styled `SelectTrigger` with `rounded-md`, matching input visual weight. Expand icon on the right.

### Badges / Chips

- **Shape:** `rounded-full` (9999px), `px-2.5 py-0.5` (compact inline), `gap-1.5` for icon+text variants.
- **Default (muted):** `bg-secondary text-secondary-foreground` — neutral metadata, filters.
- **Status (color-coded):** Color inlined via custom class composition (e.g., `bg-emerald-500/10 text-emerald-600 border-emerald-500/20`). Each color is semi-transparent (10% bg, 60% text) — the signature badge treatment.
- **Role badges:** Same pattern with distinct colors per role (sky, violet, amber).
- **Icon+Text:** Status badges include a leading icon (circleCheck for active, circleX for inactive).

### Navigation

- **Sidebar (desktop):** Collapsible shadcn sidebar (`AppSidebar`) with `bg-sidebar` (near-white), icon + label per nav item. Active item uses `sidebar-primary` bg.
- **Mobile:** Bottom sheet navigation via `SidebarTrigger`. Full sidebar overlays on mobile open.
- **Breadcrumbs:** `Breadcrumbs` component used for secondary navigation in page headers.
- **Page Tabs:** `PageTabs` component for horizontal tab sections within pages (e.g., bot detail "Pengaturan" / "Kelola Grup").

### Dialogs & Sheets

- **Shape:** `rounded-xl` (12px), max-width typically `sm:max-w-[480px]`.
- **Header:** `DialogHeader` with `DialogTitle` (18px semibold) and `DialogDescription` (14px muted).
- **Footer:** `DialogFooter` with right-aligned action buttons — "Batal" (outline, left) + "Konfirmasi" (primary/destructive, right).
- **Sheets:** Slide-over panels (`SheetContent`, `sm:max-w-[420px]` or `480px`) for group detail, connect flow. Full-width on mobile.

### Modals (AlertModal)
- Parameterized wrapper around shadcn Dialog. `confirmVariant` prop controls button color (`destructive` for delete, `default` for toggle). Optional `title` and `description` for context-specific messaging.

### Data Display / Tables
- The project uses `DataTable` (TanStack Table wrapper) for the legacy listing views that the card grid is replacing. Tables have a toolbar with search, filters, column visibility toggles, and pagination.
- Bot card grid uses animation: `animate-fade-up` with staggered delays (0, 150, 300, 450ms) for entry.

## Do's and Don'ts

### Do:
- **Do** use `rounded-xl` (12px) for all main content cards — this is the system's signature radius.
- **Do** use gradient accent backgrounds (`from-{color}/15 via-{color}/5 to-transparent`) for stat cards — they add color without overwhelming.
- **Do** use the semi-transparent badge pattern (`bg-{color}/10 text-{color}-600 border-{color}/20`) for all status and role badges — it's the system's consistent badge language.
- **Do** use `tabular-nums` on all numeric displays (counts, timestamps, amounts).
- **Do** use `hover:-translate-y-0.5 hover:shadow-md` as the interactive feedback for cards and containers.
- **Do** keep destructive actions (delete, disconnect) in a red-toned variant with an AlertModal confirmation — never execute without asking.

### Don't:
- **Don't** add box shadows to surfaces at rest — the system is flat by design.
- **Don't** use the Command Blue (primary) for decorative or background elements — it's reserved for actionable elements only.
- **Don't** add custom shadows to cards or buttons — use only the re-enabled `shadow-sm` / `shadow-md` when the hybrid system is in place.
- **Don't** mix icon styles (filled vs. outline) at the same hierarchy level. Tabler Icons (outline) is the system standard.
- **Don't** use random/generated values for skeleton heights — define a fixed pattern that renders identically server- and client-side.
- **Don't** place the primary action below the fold on desktop — it belongs in the top-right toolbar area.
