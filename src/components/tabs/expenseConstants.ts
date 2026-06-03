import { Coffee, Car, Home, PartyPopper, Receipt } from "lucide-react";
import { ExpenseCategory, Trip } from "../../types";

export const CATEGORY_ICONS = {
  Food: Coffee,
  Transport: Car,
  Lodging: Home,
  Fun: PartyPopper,
  Other: Receipt,
};

export const computeBalances = (trip: Trip): Record<string, number> => {
  const balances: Record<string, number> = {};
  trip.members.forEach(m => balances[m.id] = 0);
  trip.expenses.forEach(exp => {
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
    const splitAmt = exp.amount / exp.splitBetween.length;
    exp.splitBetween.forEach(mId => balances[mId] = (balances[mId] || 0) - splitAmt);
  });
  return balances;
};
