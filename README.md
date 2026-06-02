# 🌴 Tripcore

A delightful, mobile-first group trip planner PWA. Split bills, plan itineraries, and pack together — no accounts, just a shareable link. Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Firebase Firestore**.

## ✨ Features

- **📊 Dashboard (Kas):** Bird's-eye view of trip finances. Track pooled funds, total spending, and auto-calculated "who owes whom" settlement.
- **🧾 Split Bills:** Log group expenses with categories, paid-by, and split-between members. Automatic debt settlement algorithm.
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
├── pages/
│   ├── LandingPage.tsx   # Create new trip → generates UUID
│   └── TripPage.tsx      # Main shell: header, tabs, bottom nav, modals
└── components/
    ├── NameSetupModal.tsx      # First-join: name + PIN
    ├── MemberPickerModal.tsx   # Reclaim existing identity via PIN
    ├── OnboardingModal.tsx     # 4-step feature intro carousel
    └── tabs/
        ├── DashboardTab.tsx    # Treasury, savings goal, deposits
        ├── ExpensesTab.tsx     # Add/view expenses, settlements
        ├── ItineraryTab.tsx    # Day-by-day timeline
        └── ChecklistTab.tsx    # Shared to-do/packing list
```

## 🔄 Data Flow

1. **LandingPage** generates a `crypto.randomUUID()` trip ID, navigates to `/trip/:tripId`.
2. **TripPage** authenticates anonymously via Firebase, subscribes to `trips/{tripId}` in Firestore via `onSnapshot`.
3. All state lives in a single `Trip` object. Mutations write through to Firestore; the snapshot listener pushes updates to all connected clients.
4. Current user identity: member UUID stored in `localStorage`, matched by Firebase UID or reclaimed via PIN.
5. Offline: Firestore IndexedDB persistence handles disconnected usage; syncs on reconnect.

## 📄 License

MIT
