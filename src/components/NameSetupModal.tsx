import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "../lib/i18n";

type Props = {
  isOpen: boolean;
  onJoin: (name: string) => void;
};

export default function NameSetupModal({ isOpen, onJoin }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-8 shadow-2xl relative z-10 w-full max-w-sm border-4 border-pastel-cream"
          >
            <div className="mx-auto w-16 h-16 bg-pastel-mint/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🌸</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-center text-ink mb-2">
              {t('nameModalTitle')}
            </h2>
            <p className="text-center font-sans text-ink-light mb-6">
              {t('nameModalSubtitle')}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                autoFocus
                placeholder={t('nameModalPlaceholder')}
                className="bg-pastel-cream font-sans border-none px-6 py-4 rounded-2xl text-ink font-medium focus:ring-4 focus:ring-pastel-pink/30 outline-none w-full shadow-inner"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!name.trim()}
                className="bg-pastel-pink text-white font-display font-bold py-4 rounded-2xl disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {t('nameModalBtn')} <Sparkles className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
