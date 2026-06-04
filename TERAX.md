# TERAX.md — Tripcore

A mobile-first, collaborative group trip planner PWA built with React 19, Vite, TypeScript, and Tailwind CSS v4. No accounts — anonymous Firebase Auth + Firestore for real-time cross-device sync with offline persistence. The app covers pooled-fund tracking with remaining-balance monitoring, dual-mode expense logging (shared-pool withdrawals + personal IOUs), day-by-day itineraries, and shared checklists. Bilingual (EN/ID) via a React context provider, with playful pastel UI animated by Motion.

## Build / Test

```bash
npm run dev          # Vite dev server on port 3000 (--host 0.0.0.0)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # Type-check only (tsc --noEmit)
npm run clean        # Remove dist/ and server.js
```

**AI agents: do NOT run `npm run dev` or `npm run preview`.** Validation is `npx tsc --noEmit` (type-check) followed by `npm run build` (production build). Build success = everything works. No dev server needed.

HMR and file watching are disabled when `DISABLE_HMR=true` (AI Studio compatibility).

## Architecture

```
src/
├── main.tsx                 # Entry: BrowserRouter + LanguageProvider + PWA registration
├── App.tsx                  # Two routes: / and /trip/:tripId
├── types.ts                 # Core data models (Trip, Member, Expense, etc.)
├── index.css                # Tailwind v4 + @theme custom pastel tokens + Google Fonts
├── lib/
│   ├── i18n.tsx             # LanguageProvider + useLanguage hook + EN/ID translations map
│   ├── utils.ts             # cn() — clsx + tailwind-merge
│   ├── confetti.ts          # canvas-confetti helpers (triggerDopamine, triggerCelebration)
│   ├── crypto.ts            # SHA-256 PIN hashing & verification via Web Crypto API
│   └── firebase.ts          # Firebase init, anonymous auth, Firestore real-time sync, slug ops
├── pages/
│   ├── LandingPage.tsx      # Create/Join trip, custom slug, Firestore slug availability check
│   └── TripPage.tsx         # Main shell: header, identity flow, tab content, bottom nav, PWA install
└── components/
    ├── NameSetupModal.tsx   # First-join: name + 4-digit PIN, persisted via Firestore + localStorage
    ├── MemberPickerModal.tsx # Reclaim existing identity by selecting member + entering PIN
    ├── OnboardingModal.tsx  # 4-step feature intro carousel, highlights bottom nav tabs
    └── tabs/
        ├── DashboardTab.tsx # Treasury overview, savings goal, per-member deposits + kas balance ("Kas")
        ├── ExpensesTab.tsx  # Dual-mode expenses (kas pool / personal IOUs) + settlements
        ├── ExpenseForm.tsx  # Add expense with kas/personal toggle
        ├── ItineraryTab.tsx # Day-by-day timeline with activities
        └── ChecklistTab.tsx # Shared to-do/packing list
```

### Data flow

1. **LandingPage** — user picks "Create" or "Join" mode:
   - **Create**: generates `crypto.randomUUID()` tripId; optionally validates a custom slug against Firestore (`checkSlugAvailable`). Navigates to `/trip/:tripId` (or `/trip/:slug`) with `{ tripId, slug }` in router state.
   - **Join**: if the input looks like a UUID, navigates directly. Otherwise resolves the slug via Firestore (`resolveSlug`) and navigates.
2. **TripPage** — on mount:
   - Checks if `tripId` param is a UUID or a slug; resolves slug via Firestore if needed.
   - Calls `ensureAuth()` → anonymous Firebase sign-in → gets `firebaseUid`.
   - Subscribes to the Firestore trip document via `subscribeToTrip()` (real-time `onSnapshot`).
   - If the trip document doesn't exist yet, seeds a default `Trip` object via `saveTrip()`.
   - Firestore offline persistence (`enableIndexedDbPersistence`) handles local-first operation.
3. **Identity resolution** (once trip + firebaseUid are ready):
   - Check `localStorage.getItem('trip_user_' + tripId)` → if found and member exists, set current user.
   - Fallback: match by `firebaseUid` against trip members (handles new device / cleared localStorage).
   - If no identity: show `MemberPickerModal` if members exist (reclaim flow with PIN), otherwise show `NameSetupModal` (new member flow).
4. **Mutations** — every state change calls `updateTrip()` which writes the full trip to Firestore via `saveTrip()`. The `onSnapshot` listener propagates changes back to all connected clients.
5. **localStorage usage** (minimal):
   - `trip_user_<tripId>` — current user's member UUID (identity persistence)
   - `tripcore_lang` — language preference (`'en'` | `'id'`, defaults to `'id'`)
6. **PIN system** — members create a 4–6 digit PIN on join, hashed with SHA-256 (`lib/crypto.ts`). Required to reclaim identity via `MemberPickerModal`. Legacy members without `pinHash` can reclaim without PIN.

### Key types (src/types.ts)

| Type | Fields |
|------|--------|
| `Member` | id, name, hasPaidDeposit? (legacy), totalContributed, firebaseUid?, pinHash? |
| `Expense` | id, title, amount, paidBy, splitBetween[], category (Food\|Transport\|Lodging\|Fun\|Other), date, paidFromKas |
| `Activity` | id, time, title, description? |
| `ItineraryDay` | id, dateLabel, activities[] |
| `ChecklistItem` | id, text, isCompleted, completedBy? |
| `Trip` | id, title, slug?, savingTargetPerMember, members[], expenses[], itinerary[], checklist[], createdAt |

## Conventions

- **Firebase-first storage** — trip data lives in Firestore (`trips/{tripId}`). Offline persistence via IndexedDB. The `@google/genai` and `express` deps are legacy/optional.
- **Anonymous auth** — no sign-up. `signInAnonymously` provides a stable Firebase UID used to associate members across devices.
- **Tab state is local to TripPage** — `activeTab` controls which tab component renders. No router nesting for tabs.
- **Tailwind v4** — uses `@theme` blocks in `index.css` for custom design tokens (pastel-* palette, font families). No `tailwind.config.ts`.
- **Fonts** — Nunito (body) + Quicksand (display), loaded via `@import url(...)` in `index.css`.
- **Path alias** — `@/*` maps to workspace root (tsconfig paths). Current code uses relative imports.
- **i18n pattern** — `const { t } = useLanguage()` then `t('someKey')`. Keys are flat. Parameters via `{placeholder}` syntax. Default language: Indonesian (`id`).
- **PWA** — `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Service worker imported as `virtual:pwa-register`. Install prompt handled via `beforeinstallprompt` event.
- **Animation** — all transitions use `<motion.div>` from `motion/react`. Tab switching uses `<AnimatePresence mode="wait">`.
- **Confetti** — `triggerDopamine()` for small bursts, `triggerCelebration()` for 2-second cascading celebration on onboarding complete.
- **Sharing** — Web Share API with clipboard fallback. Shared URL uses `trip.slug` when available.

## Entry Points

- HTML shell: `index.html` → `<script type="module" src="/src/main.tsx">`
- React root: `src/main.tsx` — `createRoot(document.getElementById('root')!)`
- Route `/`: `src/pages/LandingPage.tsx`
- Route `/trip/:tripId`: `src/pages/TripPage.tsx` (accepts UUID or slug)

## Firebase Project

- Project ID: `tripcore-d9365`
- Auth: Anonymous only
- Firestore: `trips/{tripId}` documents, slug queries via composite index on `slug` field
- API key is hardcoded in `src/lib/firebase.ts` (public — Firebase security is rules-based, not key-based)
