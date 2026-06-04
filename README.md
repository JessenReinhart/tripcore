# 🌴 Tripcore

A delightful, mobile-first group trip planner PWA. Split bills, plan itineraries, and pack together — no accounts, just a shareable link. Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Firebase Firestore**.

## ✨ Features

- **📊 Dashboard (Kas):** Bird's-eye view of trip finances. Track pooled funds, per-member balances, and remaining budget so you never overspend.
- **🧾 Smart Expenses:** Two modes — **From Kas** for shared-pool spending (auto-deducts from balances) and **Personal** for one-off IOUs when someone fronts the bill. Auto-settlement for personal debts.
- **📅 Itinerary Guide:** Day-by-day timeline with time-sorted activities. Add/remove days and plans.
- **✅ Group Checklist:** Shared packing and to-do list. Mark items complete, see who packed what, clear done items.
- **🌏 Bilingual:** Toggle between English and Indonesian (EN/ID) — persistent preference.
- **🔐 PIN Identity:** Set a 4-digit PIN on first join. Reclaim your identity on new devices or after clearing data.
- **☁️ Real-Time Sync:** Firebase Firestore with offline persistence. All members see changes live across devices.
- **📱 PWA:** Installable on mobile/home screen. Works offline via Firestore IndexedDB cache.
- **✨ Polished UI:** Pastel design system, fluid Motion animations, confetti celebrations.

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (custom pastel theme)
- **Backend:** Firebase Firestore + Anonymous Auth
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa (auto-update service worker)

## 🚀 Getting Started

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd tripcore
   npm install
   ```

2. **Set up Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable **Anonymous Authentication** (Authentication → Sign-in method)
   - Create a **Cloud Firestore** database (start in test mode)
   - Copy your config and replace the object in `src/lib/firebase.ts`

3. **Start the dev server**
   ```bash
   npm run dev        # → http://localhost:3000
   ```

4. **Build for production**
   ```bash
   npm run build      # → dist/
   npm run preview    # Preview production build
   ```

## 📁 Project Structure

```
src/
├── main.tsx              # Entry: BrowserRouter + LanguageProvider + PWA
├── App.tsx               # Routes: / and /trip/:tripId
├── types.ts              # Trip, Member, Expense, ItineraryDay, ChecklistItem
├── index.css             # Tailwind v4 + pastel theme tokens
├── lib/
│   ├── firebase.ts       # Firebase init, anonymous auth, Firestore helpers
│   ├── i18n.tsx          # LanguageProvider + translations (EN/ID)
│   ├── crypto.ts         # SHA-256 PIN hashing
│   ├── confetti.ts       # canvas-confetti helpers
│   └── utils.ts          # cn() — clsx + tailwind-merge
├── hooks/
│   ├── useTripSubscription.ts  # Firestore real-time trip + slug resolution
│   ├── useTripIdentity.ts      # Member identity: PIN, localStorage, firebaseUid
│   ├── useTripNavigation.ts    # Create/join trip with slug validation
│   ├── usePwaInstall.ts        # beforeinstallprompt handling
│   └── useShare.ts             # Web Share API + clipboard fallback
├── pages/
│   ├── LandingPage.tsx   # Create/join trip with custom slug
│   └── TripPage.tsx      # Main shell: header, identity flow, tab content, modals
└── components/
    ├── LanguageToggle.tsx       # Bilingual EN/ID toggle (shared)
    ├── ModeSwitch.tsx           # Create/Join mode toggle (landing page)
    ├── TripHeaderActions.tsx    # Install, language, share buttons
    ├── TripTitle.tsx            # Editable trip title + slug display
    ├── TripTabBar.tsx           # Bottom tab navigation with animated pill
    ├── NameSetupModal.tsx       # First-join: name + PIN
    ├── MemberPickerModal.tsx    # Reclaim existing identity via PIN
    ├── OnboardingModal.tsx      # 4-step feature intro carousel
    └── tabs/
        ├── DashboardTab.tsx     # Treasury, savings goal, deposits
        ├── ExpensesTab.tsx      # Add/view expenses, settlements
        ├── ExpenseForm.tsx      # Add/edit expense form
        ├── DepositModal.tsx     # Deposit funds modal
        ├── ItineraryTab.tsx     # Day-by-day timeline
        ├── ActivityForm.tsx     # Add/edit activity form
        ├── ChecklistTab.tsx     # Shared to-do/packing list
        ├── ChecklistItem.tsx    # Individual checklist item
        ├── MemberCard.tsx       # Member summary card
        └── expenseConstants.ts  # Expense category config
```

## 🔄 Data Flow

1. **LandingPage** generates a `crypto.randomUUID()` trip ID, navigates to `/trip/:tripId`.
2. **TripPage** authenticates anonymously via Firebase, subscribes to `trips/{tripId}` in Firestore via `onSnapshot`.
3. All state lives in a single `Trip` object. Mutations write through to Firestore; the snapshot listener pushes updates to all connected clients.
4. Current user identity: member UUID stored in `localStorage`, matched by Firebase UID or reclaimed via PIN.
5. Offline: Firestore IndexedDB persistence handles disconnected usage; syncs on reconnect.

## 📄 License

MIT
