import { Globe } from "lucide-react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const toggle = () => setLang(lang === "en" ? "id" : "en");

  return (
    <button
      onClick={toggle}
      className={cn(
        "bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm font-sans font-bold text-[10px] text-ink-light hover:text-ink transition-colors h-8",
        className,
      )}
    >
      <Globe className="w-3.5 h-3.5" />
      <span className={cn(lang === "en" && "text-pastel-pink")}>EN</span>
      <span className="text-pastel-yellow">/</span>
      <span className={cn(lang === "id" && "text-pastel-pink")}>ID</span>
    </button>
  );
}
