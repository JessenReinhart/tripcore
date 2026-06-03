import { useState, type FormEvent } from "react";
import { Sparkles, Map, Globe, Link, Loader2, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";
import { useTripNavigation } from "../hooks/useTripNavigation";

type Mode = "create" | "join";

export default function LandingPage() {
  const { t, lang, setLang } = useLanguage();
  const [mode, setMode] = useState<Mode>("create");
  const { slug, setSlug, error, loading, handleCreateTrip, handleJoinTrip } = useTripNavigation(t);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mode === "create" ? handleCreateTrip() : handleJoinTrip();
  };

  const toggleLanguage = () => setLang(lang === "en" ? "id" : "en");

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setSlug("");
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full p-6 text-center max-w-md mx-auto relative">
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm font-sans font-bold text-xs text-ink-light hover:text-ink transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className={cn(lang === "en" && "text-pastel-pink")}>EN</span>
        <span className="text-pastel-yellow">/</span>
        <span className={cn(lang === "id" && "text-pastel-pink")}>ID</span>
      </button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-white p-8 rounded-3xl shadow-xl shadow-pastel-pink/10 border-4 border-pastel-cream w-full"
      >
        <div className="bg-pastel-yellow/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Map className="text-pastel-pink w-10 h-10" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-2 text-ink">
          {t("landingTitle")}
        </h1>
        <p className="text-ink-light mb-6 font-sans font-medium">
          {t("landingSubtitle")}
        </p>

        <div className="flex bg-pastel-cream rounded-xl p-1 mb-5">
          {(["create", "join"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-sans font-bold text-sm transition-all relative",
                mode === m
                  ? "bg-white text-pastel-pink shadow-sm"
                  : "text-ink-light hover:text-ink"
              )}
            >
              {m === "create" && (
                <Sparkles className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              )}
              {m === "join" && (
                <LogIn className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              )}
              {m === "create" ? t("tabCreate") : t("tabJoin")}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
                <input
                  type="text"
                  placeholder={
                    mode === "create"
                      ? t("slugPlaceholder")
                      : t("joinSlugPlaceholder")
                  }
                  className="w-full bg-pastel-cream border-none pl-11 pr-4 py-3 rounded-xl font-mono text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none text-ink"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="text-pastel-pink text-xs font-sans font-bold -mt-1 text-left px-1">
              {error}
            </p>
          )}

          {mode === "create" && (
            <p className="text-[10px] text-ink-light font-sans -mt-1 px-1 text-left">
              {t("slugHint")}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={cn(
              "text-white font-bold font-display text-xl px-8 py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg transition-shadow disabled:opacity-70",
              mode === "create"
                ? "bg-pastel-pink shadow-pastel-pink/30 hover:shadow-pastel-pink/50"
                : "bg-pastel-purple shadow-pastel-purple/30 hover:shadow-pastel-purple/50"
            )}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : mode === "create" ? (
              <Sparkles className="w-6 h-6" />
            ) : (
              <LogIn className="w-6 h-6" />
            )}
            {mode === "create" ? t("createTripBtn") : t("joinTripBtn")}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
