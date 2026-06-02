import { useNavigate } from "react-router-dom";
import { Sparkles, Map, Globe } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/i18n";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  const handleCreateTrip = () => {
    const newTripId = crypto.randomUUID();
    // In a real app we might initialize the DB doc here
    navigate(`/trip/${newTripId}`);
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'id' : 'en');
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full p-6 text-center max-w-md mx-auto relative">
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm font-sans font-bold text-xs text-ink-light hover:text-ink transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className={cn(lang === 'en' && "text-pastel-pink")}>EN</span>
        <span className="text-pastel-yellow">/</span>
        <span className={cn(lang === 'id' && "text-pastel-pink")}>ID</span>
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
        <h1 className="font-display font-bold text-4xl mb-2 text-ink">{t('landingTitle')}</h1>
        <p className="text-ink-light mb-8 font-sans font-medium">
          {t('landingSubtitle')}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateTrip}
          className="bg-pastel-pink text-white font-bold font-display text-xl px-8 py-4 rounded-2xl w-full flex items-center justify-center gap-2 shadow-lg shadow-pastel-pink/30 hover:shadow-pastel-pink/50 transition-shadow"
        >
          <Sparkles className="w-6 h-6" />
          {t('createTripBtn')} 
        </motion.button>
      </motion.div>
    </div>
  );
}
