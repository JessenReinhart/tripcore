import { Trip, Member, ChecklistItem } from "../../types";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, Square, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

export default function ChecklistTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      isCompleted: false,
    };

    updateTrip({ ...trip, checklist: [newItem, ...trip.checklist] });
    setText("");
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    const item = trip.checklist.find(i => i.id === id);
    if (item && !item.isCompleted) {
      triggerDopamine();
    }

    const updated = trip.checklist.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isCompleted: !item.isCompleted,
          completedBy: !item.isCompleted ? currentUser?.id : undefined
        };
      }
      return item;
    });
    // Sort so completed are at the bottom
    const sorted = [...updated].sort((a,b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
    updateTrip({ ...trip, checklist: sorted });
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
          <Plus className="w-5 h-5"/> {t('addNewItem')}
        </button>
      ) : (
        <form onSubmit={handleAddItem} className="bg-white p-4 rounded-2xl flex gap-2 shadow-sm border-2 border-pastel-pink/20">
          <input type="text" autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={t('itemPlaceholder')} className="flex-1 bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none" />
          <button type="submit" className="bg-pastel-pink text-white flex items-center justify-center px-4 rounded-xl shadow-md"><Plus className="w-5 h-5"/></button>
          <button type="button" onClick={() => setIsAdding(false)} className="bg-transparent text-ink-light flex items-center justify-center px-2"><X className="w-5 h-5"/></button>
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
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                onClick={() => handleToggle(item.id)}
                className={cn("bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-colors shadow-sm", item.isCompleted ? "bg-opacity-50 opacity-60" : "hover:bg-pastel-cream")}
              >
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors", item.isCompleted ? "bg-pastel-mint border-pastel-mint" : "border-ink-light/30")}>
                  {item.isCompleted ? <Check className="w-4 h-4 text-white font-bold" /> : <div className="w-2 h-2 rounded-full hidden" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={cn("font-sans font-bold block truncate transition-all text-base", item.isCompleted ? "line-through text-ink-light" : "text-ink")}>
                    {item.text}
                  </span>
                  {item.isCompleted && item.completedBy && (
                    <span className="text-[10px] font-bold text-pastel-mint uppercase tracking-widest mt-1 block">
                      {t('packedBy')} {trip.members.find(m=>m.id === item.completedBy)?.name || t('someone')}
                    </span>
                  )}
                </div>
              </motion.div>
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
