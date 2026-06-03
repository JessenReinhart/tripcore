import React, { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

type Props = {
  onSave: (time: string, title: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
};

export default function ActivityForm({ onSave, onCancel, t }: Props) {
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;
    onSave(time, title);
    setTitle("");
    setTime("");
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-3xl border-2 border-pastel-pink/20 flex flex-col gap-3 shadow-md mt-4 relative overflow-hidden w-full"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-display font-bold text-sm text-ink text-opacity-50 uppercase tracking-widest">{t('newPlanTitle')}</span>
        <button type="button" onClick={onCancel} className="text-ink-light bg-pastel-cream p-1.5 rounded-full hover:text-ink transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="bg-pastel-cream px-4 py-3 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 ring-pastel-pink/50 text-ink w-full sm:w-auto" />
        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder={t('planPlaceholder')} className="bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none w-full flex-1" autoFocus />
      </div>
      <button type="submit" className="bg-ink text-white font-bold py-3.5 rounded-xl text-sm mt-1 shadow-md hover:shadow-lg transition-shadow bg-opacity-90 active:scale-95">{t('addToTimeline')}</button>
    </motion.form>
  );
}
