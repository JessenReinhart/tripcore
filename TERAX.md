# TERAX.md — Tripcore

A mobile-first, local-only group trip planner PWA built with React 19, Vite, TypeScript, and Tailwind CSS v4. No accounts — all trip data lives in `localStorage` keyed by UUID trip codes. The app covers pooled-fund tracking, bill splitting with automatic debt settlement, day-by-day itineraries, and shared checklists. Bilingual (EN/ID) via a React context provider, with playful pastel UI animated by Motion.

## Build / Test / Dev

```bash
npm run dev          # Vite dev server on port 3000 (--host 0.0.0.0)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # Type-check only (tsc --noEmit)
npm run clean        # Remove dist/ and server.js
```

HMR and file watching are disabled when `DISABLE_HMR=true` (AI Studio compatibility).

## Architecture

```
src/
├── main.tsx                 # Entry: BrowserRouter + LanguageProvider + PWA registration
├── App.tsx                  # Two routes: / and /trip/:tripId
├── types.ts                 # Core data models (Trip, Member, Expense, etc.)
├── index.css                # Tailwind v4 + custom pastel theme tokens
├── lib/
│   ├── i18n.tsx             # LanguageProvider + useLanguage hook + translations map
│   ├── utils.ts             # cn() — clsx + tailwind-merge
│   └── confetti.ts          # canvas-confetti helpers
├── pages/
│   ├── LandingPage.tsx      # "Create New Trip" → generates UUID → navigates
│   └── TripPage.tsx         # Main shell: header, tab content, bottom nav
└── components/
    ├── NameSetupModal.tsx   # First-join name prompt, persisted per tripId
    ├── OnboardingModal.tsx  # 4-step feature intro carousel
    └── tabs/
        ├── DashboardTab.tsx # Treasury overview, savings goal, per-member deposits
        ├── ExpensesTab.tsx  # Add/view expenses + auto "who owes whom" settlement
        ├── ItineraryTab.tsx # Day-by-day timeline with activities
        └── ChecklistTab.tsx # Shared to-do/packing list
```

### Data flow

1. **LandingPage** generates a `crypto.randomUUID()` tripId, navigates to `/trip/:tripId`.
2. **TripPage** reads `localStorage.getItem('trip_' + tripId)` on mount. If absent, seeds a default `Trip` object.
3. All state lives in a single `Trip` object held via `useState` in `TripPage`. Every mutation calls `updateTrip()` which writes-through to `localStorage`.
4. Cross-tab sync via the `storage` event listener — other browser tabs pick up changes without polling.
5. Current user identity stored as `localStorage.getItem('trip_user_' + tripId)` (member UUID).

### Key types (src/types.ts)

| Type | Purpose |
|------|---------|
| `Trip` | Top-level aggregate: id, title, savingTargetPerMember, members[], expenses[], itinerary[], checklist[], createdAt |
| `Member` | id, name, totalContributed |
| `Expense` | id, title, amount, paidBy, splitBetween[], category, date |
| `ItineraryDay` / `Activity` | Day grouping with time-titled activities |
| `ChecklistItem` | id, text, isCompleted, completedBy (memberId) |

## Conventions

- **No backend / no DB** — everything is `localStorage`. The `@google/genai` and `express` deps are legacy/optional.
- **Tab state is local to TripPage** — `activeTab` controls which tab component renders. No router nesting for tabs.
- **Tailwind v4** uses `@theme` blocks in `index.css` for custom design tokens (pastel-* palette, font families). No `tailwind.config.ts`.
- **Path alias** `@/*` maps to workspace root (e.g. `import { cn } from '@/src/lib/utils'` would work, though current code uses relative imports).
- **i18n pattern**: `const { t } = useLanguage()` then `t('someKey')`. Keys are flat (no nesting). Parameters via `{placeholder}` syntax.
- **PWA**: `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Service worker import is `virtual:pwa-register`.
- **Animation**: All transitions use `<motion.div>` from `motion/react` (Framer Motion). Tab switching uses `<AnimatePresence mode="wait">`.
- **Confetti**: `triggerDopamine()` for small bursts, `triggerCelebration()` for 2-second cascading celebration on onboarding complete.

## Entry Points

- HTML shell: `index.html` → `<script type="module" src="/src/main.tsx">`
- React root: `src/main.tsx` — `createRoot(document.getElementById('root')!)`
- Route `/`: `src/pages/LandingPage.tsx`
- Route `/trip/:tripId`: `src/pages/TripPage.tsx`
