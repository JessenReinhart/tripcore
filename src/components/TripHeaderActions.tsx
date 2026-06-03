import { Check, Download, UserPlus } from "lucide-react";
import LanguageToggle from "./LanguageToggle";

interface TripHeaderActionsProps {
  deferredPrompt: Event | null;
  onInstall: () => void;
  isCopied: boolean;
  onShare: () => void;
  t: (key: string) => string;
}

export default function TripHeaderActions({
  deferredPrompt,
  onInstall,
  isCopied,
  onShare,
  t,
}: TripHeaderActionsProps) {
  return (
    <div className="flex justify-end gap-2 w-full flex-wrap">
      {deferredPrompt && (
        <button
          onClick={onInstall}
          className="bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-2.5 py-1.5 rounded-xl flex items-center shadow-sm font-sans font-bold text-[10px] text-ink transition-colors h-8"
        >
          <Download className="w-3.5 h-3.5 mr-1 text-pastel-pink" />
          <span>{t("installApp")}</span>
        </button>
      )}
      <LanguageToggle />
      <button
        onClick={onShare}
        className="bg-pastel-pink text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-pastel-pink/30 hover:shadow-pastel-pink/50 font-sans font-bold text-[11px] transition-all active:scale-95 h-8"
      >
        {isCopied ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
        <span>{isCopied ? t("tripCopied") : t("shareTrip")}</span>
      </button>
    </div>
  );
}
