# 🌴 Trip Planner App

A delightful, mobile-first web application designed to help friends and groups plan trips, track expenses, and manage itineraries collaboratively. Built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**.

## ✨ Features

- **📊 Dashboard (Kas):** Get a bird's-eye view of your trip's finances. Track total pooled money, view total spending, and automatically calculate who owes what to whom.
- **🧾 Split Bills:** Easily log group expenses and optionally attach photo receipts.
- **📅 Itinerary Guide:** A beautiful day-by-day timeline to plan out your activities, flights, and reservations.
- **✅ Group Checklist:** Make sure nobody forgets the essentials with a shared packing and to-do list.
- **🌏 Bilingual Support:** Seamlessly toggle between English and Indonesian (ID) directly in the UI.
- **💾 Local-First Storage:** No account required. All trip data is automatically persisted to your browser's local storage.
- **✨ Polished "Vibe" UI:** Fluid animations using Motion (Framer Motion) and a playful, clean pastel design system.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Motion (Framer Motion)](https://motion.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks + `localStorage`

## 🚀 Getting Started

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trip-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📝 Roadmap & Ideas for Expansion

Currently, the app uses a **Local-First** approach where trip data is tied to the unique Trip Code in the URL and stored in your browser's local storage. 

If you want to make it truly collaborative over the internet, you could scale it by:
- Integrating a real-time database like Firebase Firestore or Supabase.
- Implementing WebSockets to sync state changes live between members joining the same trip code.
- Adding a cloud bucket (like AWS S3) for persistent receipt photo uploads.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
