import React, { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Trip, ExpenseCategory, Expense } from "../../types";
import { CATEGORY_ICONS } from "./expenseConstants";

type Props = {
  trip: Trip;
  currentUserId: string;
  onSave: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onCancel: () => void;
  t: (key: string) => string;
};

export default function ExpenseForm({ trip, currentUserId, onSave, onCancel, t }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paidBy, setPaidBy] = useState<string>(currentUserId || "");
  const [splitBetween, setSplitBetween] = useState<string[]>(trip.members.map(m => m.id));
  const [paidFromKas, setPaidFromKas] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidBy || splitBetween.length === 0) return;
    onSave({ title, amount: parseFloat(amount), category, paidBy, splitBetween, paidFromKas });
    setTitle("");
    setAmount("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-white p-6 rounded-3xl border-2 border-pastel-pink/20 shadow-md flex flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-display font-bold text-xl text-ink">{t('newExpenseTitle')}</h3>
        <button type="button" onClick={onCancel} className="text-ink-light p-1 bg-pastel-cream rounded-full"><X className="w-5 h-5" /></button>
      </div>

      <input
        type="text"
        placeholder={t('expenseWhatFor')}
        className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans focus:ring-2 focus:ring-pastel-pink/50 outline-none"
        value={title} onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <span className="bg-pastel-cream px-4 py-3 rounded-xl font-sans font-bold text-ink-light flex items-center">Rp</span>
        <input
          type="number"
          placeholder="50000"
          className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans focus:ring-2 focus:ring-pastel-pink/50 outline-none"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          required
          min="0"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        {(["Food", "Transport", "Lodging", "Fun", "Other"] as ExpenseCategory[]).map(cat => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat} type="button"
              onClick={() => setCategory(cat)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all shrink-0", category === cat ? "bg-pastel-yellow text-ink shadow-sm" : "bg-pastel-cream text-ink-light")}
            >
              <Icon className="w-4 h-4" /> {cat}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-light px-1">{t('expenseModeLabel')}</label>
        <div className="flex bg-pastel-cream rounded-xl p-1">
          <button
            type="button"
            onClick={() => setPaidFromKas(true)}
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", paidFromKas ? "bg-pastel-mint text-ink shadow-sm" : "bg-transparent text-ink-light")}
          >
            {t('fromKas')}
          </button>
          <button
            type="button"
            onClick={() => setPaidFromKas(false)}
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", !paidFromKas ? "bg-pastel-pink text-white shadow-sm" : "bg-transparent text-ink-light")}
          >
            {t('personalExpense')}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-ink-light px-1">{paidFromKas ? t('swipedBy') : t('paidBy')}</label>
        <select className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans focus:ring-2 outline-none appearance-none font-medium" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
          <option value="" disabled>{t('selectMember')}</option>
          {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold text-ink-light">{t('splitBetween')}</label>
          <button type="button" className="text-xs text-pastel-pink font-bold" onClick={() => setSplitBetween(trip.members.map(m => m.id))}>{t('selectAll')}</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {trip.members.map(m => (
            <label key={m.id} className={cn("flex flex-1 items-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all", splitBetween.includes(m.id) ? "border-pastel-mint bg-pastel-mint/10" : "border-pastel-cream bg-pastel-cream/50")}>
              <input type="checkbox" className="hidden" checked={splitBetween.includes(m.id)} onChange={(e) => {
                if (e.target.checked) setSplitBetween([...splitBetween, m.id]);
                else setSplitBetween(splitBetween.filter(id => id !== m.id));
              }} />
              <span className="font-sans font-medium text-sm truncate">{m.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="mt-2 w-full bg-ink text-white font-display font-bold py-4 rounded-xl shadow-md">
        {t('saveExpense')}
      </button>
    </motion.form>
  );
}
