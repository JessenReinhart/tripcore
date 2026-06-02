import { Trip, Member, Expense, ExpenseCategory } from "../../types";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Coffee, Car, Home, PartyPopper, Receipt, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  Food: Coffee,
  Transport: Car,
  Lodging: Home,
  Fun: PartyPopper,
  Other: Receipt,
};

// Simple settled algo
const calculateSettlements = (trip: Trip) => {
  const balances: Record<string, number> = {};
  trip.members.forEach(m => balances[m.id] = 0);

  trip.expenses.forEach(exp => {
    if (balances[exp.paidBy] === undefined) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += exp.amount;
    
    const splitAmt = exp.amount / exp.splitBetween.length;
    exp.splitBetween.forEach(mId => {
      if (balances[mId] === undefined) balances[mId] = 0;
      balances[mId] -= splitAmt;
    });
  });

  const debtors = Object.entries(balances).filter(([_, b]) => b < -0.01).map(([id, b]) => ({ id, b: -b }));
  const creditors = Object.entries(balances).filter(([_, b]) => b > 0.01).map(([id, b]) => ({ id, b }));

  const settlements: { from: string; to: string; amount: number }[] = [];
  
  let i = 0; let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.b, c.b);
    
    settlements.push({ from: d.id, to: c.id, amount });
    
    d.b -= amount;
    c.b -= amount;
    
    if (d.b < 0.01) i++;
    if (c.b < 0.01) j++;
  }
  return settlements;
};

export default function ExpensesTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paidBy, setPaidBy] = useState<string>(currentUser?.id || "");
  const [splitBetween, setSplitBetween] = useState<string[]>(trip.members.map(m => m.id));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidBy || splitBetween.length === 0) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      title,
      amount: parseFloat(amount),
      category,
      paidBy,
      splitBetween,
      date: Date.now(),
    };

    updateTrip({ ...trip, expenses: [newExpense, ...trip.expenses] });
    triggerDopamine();
    setIsAdding(false);
    setTitle("");
    setAmount("");
  };

  const getMemberName = (id: string) => trip.members.find(m => m.id === id)?.name || "Unknown";
  const settlements = calculateSettlements(trip);

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {!isAdding ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="w-full bg-pastel-pink text-white font-display font-bold py-4 rounded-2xl shadow-lg shadow-pastel-pink/20 flex items-center justify-center gap-2 text-lg"
        >
          <Plus className="w-5 h-5" /> {t('addNewExpense')}
        </motion.button>
      ) : (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white p-6 rounded-3xl border-2 border-pastel-pink/20 shadow-md flex flex-col gap-4"
          onSubmit={handleAddExpense}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-bold text-xl text-ink">{t('newExpenseTitle')}</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-ink-light p-1 bg-pastel-cream rounded-full"><X className="w-5 h-5"/></button>
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
                  <Icon className="w-4 h-4"/> {cat}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-ink-light px-1">{t('paidBy')}</label>
            <select className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans focus:ring-2 outline-none appearance-none font-medium" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
              <option value="" disabled>{t('selectMember')}</option>
              {trip.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-ink-light">{t('splitBetween')}</label>
              <button type="button" className="text-xs text-pastel-pink font-bold" onClick={() => setSplitBetween(trip.members.map(m=>m.id))}>{t('selectAll')}</button>
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
      )}

      {settlements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-pastel-yellow/20">
          <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
             <Receipt className="text-pastel-pink w-5 h-5"/> {t('howToSettleUp')}
          </h3>
          <div className="flex flex-col gap-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-pastel-cream p-4 rounded-2xl">
                <span className="font-sans font-medium text-ink"><strong className="font-bold">{getMemberName(s.from)}</strong> {t('owes')} <strong className="font-bold">{getMemberName(s.to)}</strong></span>
                <span className="font-display font-bold text-pastel-pink">Rp {Math.round(s.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-display font-bold text-lg text-ink px-2">{t('recentExpenses')}</h3>
        {trip.expenses.length === 0 ? (
          <p className="text-ink-light text-center py-8 text-sm italic">{t('noExpensesYet')}</p>
        ) : (
          <AnimatePresence>
            {trip.expenses.map(exp => {
              const Icon = CATEGORY_ICONS[exp.category];
              return (
                <motion.div key={exp.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border-2 border-pastel-cream">
                  <div className="w-12 h-12 bg-pastel-yellow/30 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-pastel-pink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-ink truncate">{exp.title}</p>
                    <p className="text-xs text-ink-light">{t('paidByText')} {getMemberName(exp.paidBy)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-ink">Rp {exp.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-ink-light font-bold">{t('splitText')} {exp.splitBetween.length}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
