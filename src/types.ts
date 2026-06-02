export type Member = {
  id: string;
  name: string;
  hasPaidDeposit?: boolean; // legacy
  totalContributed: number;
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
};

export type Activity = {
  id: string;
  time: string;
  title: string;
  description?: string;
};

export type ItineraryDay = {
  id: string;
  dateLabel: string;
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
  savingTargetPerMember: number;
  members: Member[];
  expenses: Expense[];
  itinerary: ItineraryDay[];
  checklist: ChecklistItem[];
  createdAt: number;
};
