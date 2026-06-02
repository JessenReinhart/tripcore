import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

export const translations = {
  en: {
    // LandingPage
    landingTitle: "tripcore",
    landingSubtitle: "Split bills, plan itineraries, and pack together with your besties. No login required! 🌸",
    createTripBtn: "Create New Trip",

    // NameSetupModal
    nameModalTitle: "Hi Friend!",
    nameModalSubtitle: "What should we call you during this trip?",
    nameModalPlaceholder: "e.g. Andi, Jessen...",
    nameModalBtn: "Let's go!",

    // TripPage / Bottom Nav
    friendshipId: "Friendship ID:",
    shareTrip: "Invite Friends",
    tripCopied: "Link copied!",
    editTripName: "Edit trip name",
    joinOurTrip: "Join our trip:",
    defaultTripName: "Trip",
    defaultTripTitle: "Bali Getaway 🌴",
    dayLabel: "Day {number}",
    navHome: "Home",
    navSplit: "Split",
    navGuide: "Guide",
    navPack: "Pack",

    // DashboardTab
    overviewTitle: "Overview",
    treasury: "Treasury",
    totalPooled: "Total Pooled",
    totalSpent: "Total Spent",
    lookForward: "Look forward to:",
    getsBack: "gets back",
    goalTracker: "Savings Goal Tracker",
    goalPerPerson: "Goal: Rp {amount} / person",
    edit: "Edit",
    save: "Save",
    groupProgress: "GROUP PROGRESS",
    noFriendsYet: "No friends joined yet. Share the URL!",
    you: "(You)",
    addToKas: "Add to Kas",
    loggingDepositFor: "Logging deposit for",
    logDepositBtn: "Log Deposit ✨",
    deposit: "Deposit",

    // ExpensesTab
    addNewExpense: "Add New Expense",
    newExpenseTitle: "New Expense",
    expenseWhatFor: "What was it for? (e.g. Nasi Goreng)",
    paidBy: "Paid By",
    selectMember: "Select member...",
    splitBetween: "Split Between",
    selectAll: "Select All",
    saveExpense: "Save Expense",
    howToSettleUp: "How to Settle Up",
    owes: "owes",
    recentExpenses: "Recent Expenses",
    noExpensesYet: "No expenses yet. Add one above!",
    paidByText: "Paid by",
    splitText: "SPLIT",

    // ItineraryTab
    noPlansYet: "No plans yet for",
    addPlan: "Add Plan",
    newPlanTitle: "New Plan",
    planPlaceholder: "e.g. Flight QR908",
    addToTimeline: "Add to Timeline",

    // ChecklistTab
    groupChecklist: "Group Checklist",
    dontForget: "Don't forget the essentials!",
    addNewItem: "Add new item",
    itemPlaceholder: "e.g. Bring extension cords",
    emptyChecklist: "Your packing list is empty. Add something above!",
    packedBy: "Packed by",
    someone: "Someone",
    clearCompleted: "Clear Completed",

    // OnboardingModal
    onb1Title: "Pool Your Funds 💰",
    onb1Desc: "Track group deposits and see your trip's savings progress.",
    onb2Title: "Split the Bill 🧾",
    onb2Desc: "Log expenses and let math do the rest automatically.",
    onb3Title: "Shared Itinerary 🗺️",
    onb3Desc: "Build a shared timeline so everyone knows the plan.",
    onb4Title: "Pack Together ✅",
    onb4Desc: "Tick off the group packing list together.",
    skip: "Skip",
    next: "Next",
    finish: "Finish",
  },
  id: {
    // LandingPage
    landingTitle: "tripcore",
    landingSubtitle: "Patungan, bikin itinerary, & packing bareng bestie. Tinggal sat-set, no login! 🌸",
    createTripBtn: "Bikin Trip Baru",

    // NameSetupModal
    nameModalTitle: "Hai Bestie!",
    nameModalSubtitle: "Kita panggil kamu siapa nih di trip ini?",
    nameModalPlaceholder: "ex: Andi, Jessen...",
    nameModalBtn: "Gasss!",

    // TripPage / Bottom Nav
    friendshipId: "Kode Trip:",
    shareTrip: "Ajak Teman",
    tripCopied: "Link dicopy!",
    editTripName: "Ubah nama trip",
    joinOurTrip: "Join trip kita:",
    defaultTripName: "Trip",
    defaultTripTitle: "Liburan ke Bali 🌴",
    dayLabel: "Hari {number}",
    navHome: "Kas",
    navSplit: "Split",
    navGuide: "Guide",
    navPack: "Pack",

    // DashboardTab
    overviewTitle: "Overview Cuan",
    treasury: "Kas Terkumpul",
    totalPooled: "Total Kumpul",
    totalSpent: "Total Keluar",
    lookForward: "Asik, yang bakal balik modal:",
    getsBack: "dapet balik",
    goalTracker: "Target Nabung Bareng",
    goalPerPerson: "Target: Rp {amount} / orang",
    edit: "Ubah",
    save: "Simpan",
    groupProgress: "PROGRESS GRUP",
    noFriendsYet: "Belom ada yang join nih. Share linknya gih!",
    you: "(Kamu)",
    addToKas: "Top Up Kas",
    loggingDepositFor: "Masukin duit kas buat",
    logDepositBtn: "Catet Kas ✨",
    deposit: "Setor",

    // ExpensesTab
    addNewExpense: "Tambah Pengeluaran",
    newExpenseTitle: "Jajan Apa Nih?",
    expenseWhatFor: "Buat bayar apa? (ex: Nasi Babi Guling)",
    paidBy: "Ditalangin Sama",
    selectMember: "Pilih member...",
    splitBetween: "Patungan Buat",
    selectAll: "Pilih Semua",
    saveExpense: "Simpan Pengeluaran",
    howToSettleUp: "Cara Lunasin Utang",
    owes: "bayar ke",
    recentExpenses: "Pengeluaran Terbaru",
    noExpensesYet: "Belom ada pengeluaran. Jangan lupa dicatet ya!",
    paidByText: "Ditalangin",
    splitText: "DIBAGI",

    // ItineraryTab
    noPlansYet: "Belom ada plan nih buat",
    addPlan: "Tambah Plan",
    newPlanTitle: "Plan Baru",
    planPlaceholder: "ex: Ke Beach Club 🏖️",
    addToTimeline: "Masukin Timeline",

    // ChecklistTab
    groupChecklist: "Checklist Bawaan",
    dontForget: "Biar ga ada yang ketinggalan!",
    addNewItem: "Tambah list baru",
    itemPlaceholder: "ex: Bawa colokan 3",
    emptyChecklist: "List bawaan masih kosong. Yuk ditambahin!",
    packedBy: "Diberesin sama",
    someone: "Someone",
    clearCompleted: "Hapus yg udah",

    // OnboardingModal
    onb1Title: "Kumpulin Duit Kas 💰",
    onb1Desc: "Pantau kas grup dan progress nabung kalian biar ga ada ngaret.",
    onb2Title: "Bagi Tagihan 🧾",
    onb2Desc: "Catet pengeluaran, ntar ketauan siapa ngutang siapa. Ga pake ribut!",
    onb3Title: "Itinerary Bareng 🗺️",
    onb3Desc: "Bikin timeline santai bareng biar semua tau hari ini mau ngapain aja.",
    onb4Title: "Packing Bareng ✅",
    onb4Desc: "Checklist barang bawaan grup biar ga ada kejadian numpang pake sabun.",
    skip: "Skip",
    next: "Lanjut",
    finish: "Mulai",
  }
};

type Translations = typeof translations.en;

const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}>({
  lang: 'id',
  setLang: () => {},
  t: () => '',
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('tripcore_lang') as Language) || 'id';
  });

  useEffect(() => {
    localStorage.setItem('tripcore_lang', lang);
  }, [lang]);

  const t = (key: keyof Translations, params?: Record<string, string | number>) => {
    let str = translations[lang][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
