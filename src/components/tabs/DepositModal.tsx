import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Member } from "../../types";

type Props = {
  member: Member | null;
  onClose: () => void;
  onSubmit: (member: Member, amount: number) => void;
  t: (key: string) => string;
};

export default function DepositModal({ member, onClose, onSubmit, t }: Props) {
  const [depositInput, setDepositInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !depositInput) return;
    const amount = parseFloat(depositInput);
    if (isNaN(amount) || amount <= 0) return;
    onSubmit(member, amount);
    setDepositInput("");
    onClose();
  };

  const quickAmount = (val: string) => setDepositInput(val);

  return (
    <AnimatePresence>
      {member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-ink-light bg-pastel-cream rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-pastel-mint/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">💰</span>
            </div>
            <h3 className="font-display font-bold text-ink text-lg mb-1">{t('addToKas')}</h3>
            <p className="text-xs font-sans text-ink-light mb-4">
              {t('loggingDepositFor')} <strong className="text-ink">{member.name}</strong>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <span className="bg-pastel-cream px-3 py-3 rounded-xl font-sans font-bold text-ink-light flex items-center text-sm">Rp</span>
                <input
                  type="number"
                  autoFocus
                  placeholder="200000"
                  className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-mint outline-none font-bold text-ink"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => quickAmount("50000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">50k</button>
                <button type="button" onClick={() => quickAmount("100000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">100k</button>
                <button type="button" onClick={() => quickAmount("200000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">200k</button>
              </div>
              <button type="submit" className="w-full bg-pastel-mint text-ink font-display font-bold py-3 rounded-xl mt-2 shadow-md">
                {t('logDepositBtn')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
