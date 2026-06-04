import { Trip } from "../../types";

export const computeBalances = (trip: Trip): Record<string, number> => {
  const balances: Record<string, number> = {};
  trip.members.forEach(m => balances[m.id] = 0);
  trip.expenses
    .filter(exp => !exp.paidFromKas)
    .forEach(exp => {
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
      const splitAmt = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach(mId => balances[mId] = (balances[mId] || 0) - splitAmt);
    });
  return balances;
};

export const computeKasDeductions = (trip: Trip): Record<string, number> => {
  const deductions: Record<string, number> = {};
  trip.members.forEach(m => deductions[m.id] = 0);
  trip.expenses
    .filter(exp => exp.paidFromKas)
    .forEach(exp => {
      const share = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach(mId => {
        deductions[mId] = (deductions[mId] || 0) + share;
      });
    });
  return deductions;
};

export const totalKasSpent = (trip: Trip): number =>
  trip.expenses
    .filter(exp => exp.paidFromKas)
    .reduce((sum, exp) => sum + exp.amount, 0);
