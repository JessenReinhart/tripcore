import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Map, Globe, Link, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";
import { checkSlugAvailable } from "../lib/firebase";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [checking, setChecking] = useState(false);

  const slugIsValid = (s: string) => /^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/.test(s);

  const handleCreateTrip = async () => {
    const tripId = crypto.randomUUID();
    const slug = customSlug.trim().toLowerCase();

    if (!slug) {
      navigate(`/trip/${tripId}`);
      return;
    }

    if (!slugIsValid(slug)) {
      setSlugError(t("slugInvalid"));
      return;
    }

    setChecking(true);
    const available = await checkSlugAvailable(slug);
    setChecking(false);

    if (!available) {
      setSlugError(t("slugTaken"));
      return;
    }

    // Navigate with the slug and tripId in state so TripPage can set the slug
    navigate(`/trip/${slug}`, { state: { tripId, slug } });
  };

  const toggleLanguage = () => setLang(lang === "en" ? "id" : "en");

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

        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input
              type="text"
              placeholder={t("slugPlaceholder")}
              className="w-full bg-pastel-cream border-none pl-11 pr-4 py-3 rounded-xl font-mono text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none text-ink"
              value={customSlug}
              onChange={(e) => {
                setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                setSlugError("");
              }}
              maxLength={30}
            />
          </div>
          {slugError && (
            <p className="text-pastel-pink text-xs font-sans font-bold -mt-1 text-left px-1">
              {slugError}
            </p>
          )}
          <p className="text-[10px] text-ink-light font-sans -mt-1 px-1 text-left">
            {t("slugHint")}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateTrip}
          disabled={checking}
          className="bg-pastel-pink text-white font-bold font-display text-xl px-8 py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-pastel-pink/30 hover:shadow-pastel-pink/50 transition-shadow disabled:opacity-70"
        >
          {checking ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
          {t("createTripBtn")}
        </motion.button>
      </motion.div>
    </div>
  );
}
