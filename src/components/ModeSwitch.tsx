import { Sparkles, LogIn } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";

type Mode = "create" | "join";

interface ModeSwitchProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const { t } = useLanguage();

  return (
    <div className="flex bg-pastel-cream rounded-xl p-1 mb-5">
      {(["create", "join"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className={cn(
            "flex-1 py-2.5 rounded-lg font-sans font-bold text-sm transition-all relative",
            mode === m ? "bg-white text-pastel-pink shadow-sm" : "text-ink-light hover:text-ink",
          )}
        >
          {m === "create" && <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
          {m === "join" && <LogIn className="w-4 h-4 inline mr-1.5 -mt-0.5" />}
          {m === "create" ? t("tabCreate") : t("tabJoin")}
        </button>
      ))}
    </div>
  );
}
