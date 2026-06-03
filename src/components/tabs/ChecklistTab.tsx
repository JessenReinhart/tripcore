import type { FormEvent } from "react";
import { useState } from "react";
import { Trip, Member, ChecklistItem as ChecklistItemType } from "../../types";
import { AnimatePresence } from "motion/react";
import { Plus, X } from "lucide-react";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";
import ChecklistItemCard from "./ChecklistItem";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

const sortCompletedLast = (items: ChecklistItemType[]) =>
  [...items].sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));

export default function ChecklistTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newItem: ChecklistItemType = { id: crypto.randomUUID(), text: text.trim(), isCompleted: false };
    updateTrip({ ...trip, checklist: [newItem, ...trip.checklist] });
    setText("");
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    const item = trip.checklist.find(i => i.id === id);
    if (item && !item.isCompleted) triggerDopamine();

    const updated = trip.checklist.map(item => {
      if (item.id !== id) return item;
      const isCompleted = !item.isCompleted;
      return { ...item, isCompleted, completedBy: isCompleted ? currentUser?.id : undefined };
    });

    updateTrip({ ...trip, checklist: sortCompletedLast(updated) });
  };

  const removeDone = () => {
    updateTrip({ ...trip, checklist: trip.checklist.filter(i => !i.isCompleted) });
  };

  const completedCount = trip.checklist.filter(i => i.isCompleted).length;

  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-pastel-yellow/20 flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-ink">{t('groupChecklist')}</h2>
          <p className="text-ink-light text-sm font-sans mt-1">{t('dontForget')}</p>
        </div>
        <div className="w-14 h-14 bg-pastel-mint/20 rounded-full flex items-center justify-center font-display font-bold text-pastel-mint border-4 border-white shadow-inner shadow-pastel-mint/10">
          {completedCount}/{trip.checklist.length}
        </div>
      </div>

      {!isAdding ? (
        <button onClick={() => setIsAdding(true)} className="w-full bg-pastel-cream border-2 border-dashed border-ink-light/20 text-ink-light font-bold py-4 rounded-2xl flex items-center justify-center gap-2 font-sans hover:bg-pastel-yellow/30 transition-colors">
          <Plus className="w-5 h-5" /> {t('addNewItem')}
        </button>
      ) : (
        <form onSubmit={handleAddItem} className="bg-white p-4 rounded-2xl flex gap-2 shadow-sm border-2 border-pastel-pink/20">
          <input type="text" autoFocus value={text} onChange={e => setText(e.target.value)} placeholder={t('itemPlaceholder')} className="flex-1 bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none" />
          <button type="submit" className="bg-pastel-pink text-white flex items-center justify-center px-4 rounded-xl shadow-md"><Plus className="w-5 h-5" /></button>
          <button type="button" onClick={() => setIsAdding(false)} className="bg-transparent text-ink-light flex items-center justify-center px-2"><X className="w-5 h-5" /></button>
        </form>
      )}

      {trip.checklist.length === 0 ? (
        <div className="text-center py-12 text-ink-light italic text-sm font-sans">
          {t('emptyChecklist')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {trip.checklist.map(item => (
              <ChecklistItemCard
                key={item.id}
                item={item}
                trip={trip}
                onToggle={handleToggle}
                packedByLabel={t('packedBy')}
                someoneLabel={t('someone')}
              />
            ))}
          </AnimatePresence>

          {completedCount > 0 && (
            <button onClick={removeDone} className="mt-4 text-sm font-bold text-ink-light/50 hover:text-ink-light mx-auto block pb-8">
              {t('clearCompleted')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
