import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Lock } from "lucide-react";
import { useLanguage } from "../lib/i18n";

type Props = {
  isOpen: boolean;
  onJoin: (name: string, pin: string) => void;
};

export default function NameSetupModal({ isOpen, onJoin }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();
    if (!trimmedName || !trimmedPin || trimmedPin.length < 4) return;
    onJoin(trimmedName, trimmedPin);
    setName("");
    setPin("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/60 backdrop-blur-sm"
        >
          <motion.form
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm border-4 border-pastel-cream flex flex-col gap-4"
          >
            <div className="bg-pastel-yellow/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="text-pastel-pink w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-2xl text-center text-ink">
              {t("nameModalTitle")}
            </h2>
            <p className="text-ink-light text-center font-sans text-sm -mt-2">
              {t("nameModalSubtitle")}
            </p>

            <input
              type="text"
              placeholder={t("nameModalPlaceholder")}
              className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-base focus:ring-2 focus:ring-pastel-pink/50 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder={t("nameModalPinPlaceholder")}
                className="w-full bg-pastel-cream border-none pl-11 pr-4 py-3 rounded-xl font-mono text-base tracking-widest focus:ring-2 focus:ring-pastel-pink/50 outline-none"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <p className="text-[10px] text-ink-light text-center -mt-2 font-sans">
              {t("nameModalPinHint")}
            </p>

            <button
              type="submit"
              disabled={!name.trim() || pin.trim().length < 4}
              className="mt-2 w-full bg-pastel-pink text-white font-display font-bold py-4 rounded-2xl shadow-lg shadow-pastel-pink/30 hover:shadow-pastel-pink/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("nameModalBtn")}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
