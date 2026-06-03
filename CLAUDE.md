# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on port 3000 (--host 0.0.0.0)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # Type-check: tsc --noEmit
npm run clean        # Remove dist/ and server.js
npx fallow           # Code quality analysis (dead code, dupes, complexity)
```

**Do NOT run `npm run dev` or `npm run preview`.** Validation is `npm run lint` (type-check) followed by `npm run build`. Build success = everything works.

There is no test suite.

## Architecture

See **TERAX.md** for the full architecture doc. Key points:

- **React 19 + Vite 6 + TypeScript + Tailwind v4 + Firebase Firestore**
- Two routes only: `/` (LandingPage) and `/trip/:tripId` (TripPage, accepts UUID or slug)
- All trip state lives in a single `Trip` object in Firestore (`trips/{tripId}`). Mutations write the full object; a real-time `onSnapshot` listener pushes updates to all clients.
- Anonymous Firebase Auth on first visit. Member identity stored in `localStorage` (`trip_user_<tripId>`), fallback matched by Firebase UID, reclaimable via 4-digit PIN (SHA-256 hashed).
- Tailwind v4 uses `@theme` blocks in `src/index.css` for custom pastel tokens (no `tailwind.config.ts`).
- i18n via `useLanguage()` hook — `const { t } = useLanguage()` then `t('someKey')`. Flat keys, default language Indonesian (`id`).
- Path alias `@/*` maps to workspace root (tsconfig paths), but current code uses relative imports.

## Code Quality (Fallow)

Configured in `.fallowrc.json`. The CI workflow (`.github/workflows/ci.yml`) runs `fallow-rs/fallow@v2.86.0` on every push/PR to main. The `maxCrap` threshold is set to 75.0 (above the default 30.0) since the project has no test coverage yet. Run `npx fallow` locally to check before pushing — it exits non-zero if issues exceed thresholds.

## New Components

When extracting components from pages, follow the patterns in `src/components/`:
- `LanguageToggle` — self-contained (calls `useLanguage` internally)
- `TripHeaderActions`, `TripTitle`, `TripTabBar` — receive `t` function as a prop
- Modal components (`NameSetupModal`, `MemberPickerModal`, `OnboardingModal`) — controlled via `isOpen` / `onClose` props
