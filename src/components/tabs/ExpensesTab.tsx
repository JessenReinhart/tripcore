import { Trip, Member, Expense } from "../../types";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Receipt } from "lucide-react";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";
import ExpenseForm from "./ExpenseForm";
import { CATEGORY_ICONS, computeBalances } from "./expenseConstants";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

const calculateSettlements = (trip: Trip) => {
  const balances = computeBalances(trip);

  const debtors = Object.entries(balances).filter(([, b]) => b < -0.01).map(([id, b]) => ({ id, b: -b }));
  const creditors = Object.entries(balances).filter(([, b]) => b > 0.01).map(([id, b]) => ({ id, b }));

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

const getMemberName = (trip: Trip, id: string) =>
  trip.members.find(m => m.id === id)?.name || "Unknown";

export default function ExpensesTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveExpense = (data: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      date: Date.now(),
    };
    updateTrip({ ...trip, expenses: [newExpense, ...trip.expenses] });
    triggerDopamine();
    setIsAdding(false);
  };

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
        <ExpenseForm
          trip={trip}
          currentUserId={currentUser?.id || ""}
          onSave={handleSaveExpense}
          onCancel={() => setIsAdding(false)}
          t={t}
        />
      )}

      {settlements.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-pastel-yellow/20">
          <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
            <Receipt className="text-pastel-pink w-5 h-5" /> {t('howToSettleUp')}
          </h3>
          <div className="flex flex-col gap-3">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-pastel-cream p-4 rounded-2xl">
                <span className="font-sans font-medium text-ink">
                  <strong className="font-bold">{getMemberName(trip, s.from)}</strong> {t('owes')}{" "}
                  <strong className="font-bold">{getMemberName(trip, s.to)}</strong>
                </span>
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
                <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border-2 border-pastel-cream">
                  <div className="w-12 h-12 bg-pastel-yellow/30 rounded-full flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-pastel-pink" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-ink truncate">{exp.title}</p>
                    <p className="text-xs text-ink-light">{t('paidByText')} {getMemberName(trip, exp.paidBy)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-ink">Rp {exp.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-ink-light font-bold">{t('splitText')} {exp.splitBetween.length}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
