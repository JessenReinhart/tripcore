import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Lock, UserPlus, ArrowLeft } from "lucide-react";
import { Member } from "../types";
import { verifyPin } from "../lib/crypto";
import { useLanguage } from "../lib/i18n";

type Props = {
  isOpen: boolean;
  members: Member[];
  onReclaim: (member: Member) => void;
  onNewMember: () => void;
};

export default function MemberPickerModal({
  isOpen,
  members,
  onReclaim,
  onNewMember,
}: Props) {
  const { t } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSelect = (member: Member) => {
    // Legacy members without PIN — reclaim immediately
    if (!member.pinHash) {
      onReclaim(member);
      return;
    }
    setSelectedMember(member);
    setPin("");
    setError("");
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedMember.pinHash) return;

    const trimmedPin = pin.trim();
    if (trimmedPin.length < 4) return;

    const valid = await verifyPin(trimmedPin, selectedMember.pinHash);
    if (valid) {
      onReclaim(selectedMember);
      setSelectedMember(null);
      setPin("");
      setError("");
    } else {
      setError(t("memberPickerWrongPin"));
    }
  };

  const handleBack = () => {
    setSelectedMember(null);
    setPin("");
    setError("");
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
          <motion.div
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm border-4 border-pastel-cream flex flex-col gap-4"
          >
            {!selectedMember ? (
              <>
                <div className="bg-pastel-purple/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="text-pastel-purple w-8 h-8" />
                </div>
                <h2 className="font-display font-bold text-2xl text-center text-ink">
                  {t("memberPickerTitle")}
                </h2>
                <p className="text-ink-light text-center font-sans text-sm -mt-2">
                  {t("memberPickerSubtitle")}
                </p>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m)}
                      className="w-full bg-pastel-cream hover:bg-pastel-yellow/20 px-4 py-3 rounded-xl font-sans font-bold text-ink text-left transition-colors active:scale-[0.98]"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-pastel-cream" />
                  <span className="text-xs text-ink-light font-sans font-medium">
                    {t("or")}
                  </span>
                  <div className="flex-1 h-px bg-pastel-cream" />
                </div>

                <button
                  onClick={onNewMember}
                  className="w-full bg-pastel-mint/20 text-ink font-display font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-pastel-mint/30 transition-colors active:scale-95"
                >
                  <UserPlus className="w-5 h-5 text-pastel-mint" />
                  {t("memberPickerNew")}
                </button>
              </>
            ) : (
              <form onSubmit={handleVerifyPin} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="self-start text-ink-light hover:text-ink p-1 -ml-1 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="bg-pastel-yellow/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="text-pastel-pink w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-xl text-center text-ink">
                  {t("memberPickerEnterPin", { name: selectedMember.name })}
                </h3>

                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("nameModalPinPlaceholder")}
                  className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-mono text-base tracking-widest text-center focus:ring-2 focus:ring-pastel-pink/50 outline-none"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  autoFocus
                  required
                />

                {error && (
                  <p className="text-pastel-pink text-xs text-center font-sans font-bold -mt-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pin.trim().length < 4}
                  className="mt-1 w-full bg-pastel-pink text-white font-display font-bold py-4 rounded-2xl shadow-lg shadow-pastel-pink/30 hover:shadow-pastel-pink/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("memberPickerConfirm")}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
