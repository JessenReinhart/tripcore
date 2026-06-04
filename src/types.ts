export type Member = {
  id: string;
  name: string;
  hasPaidDeposit?: boolean; // legacy
  totalContributed: number;
  firebaseUid?: string;
  pinHash?: string;
};

export type ExpenseCategory = "Food" | "Transport" | "Lodging" | "Fun" | "Other";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // Member ID
  splitBetween: string[]; // Member IDs
  category: ExpenseCategory;
  date: number;
  paidFromKas: boolean;
};

export type Activity = {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  lat?: number;
  lng?: number;
};

export type ItineraryDay = {
  id: string;
  dateLabel: string;
  date?: string; // YYYY-MM-DD
  activities: Activity[];
};

export type ChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string; // Member ID
};

export type Trip = {
  id: string;
  title: string;
  slug?: string;
  savingTargetPerMember: number;
  members: Member[];
  expenses: Expense[];
  itinerary: ItineraryDay[];
  checklist: ChecklistItem[];
  createdAt: number;
};

export type TripUpdateFn = (updatedTrip: Trip) => void;
