import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map, Receipt, Calendar, CheckSquare, Pencil, Globe, UserPlus, Check } from "lucide-react";
import { Trip, Member } from "../types";
import NameSetupModal from "../components/NameSetupModal";
import OnboardingModal from "../components/OnboardingModal";
import DashboardTab from "../components/tabs/DashboardTab";
import ExpensesTab from "../components/tabs/ExpensesTab";
import ItineraryTab from "../components/tabs/ItineraryTab";
import ChecklistTab from "../components/tabs/ChecklistTab";
import { cn } from "../lib/utils";
import { triggerCelebration } from "../lib/confetti";
import { useLanguage } from "../lib/i18n";

type TabId = "dashboard" | "split" | "itinerary" | "checklist";

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const { t, lang, setLang } = useLanguage();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: trip?.title || t('defaultTripName'),
          text: `${t('joinOurTrip')} ${trip?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  useEffect(() => {
    if (!tripId) return;
    const storedTrip = localStorage.getItem(`trip_${tripId}`);
    if (storedTrip) {
      const parsedTrip: Trip = JSON.parse(storedTrip);
      // Migrate old schema to new schema
      if (parsedTrip.savingTargetPerMember === undefined) {
        parsedTrip.savingTargetPerMember = 1000000;
      }
      parsedTrip.members = parsedTrip.members.map((m) => ({
        ...m,
        totalContributed: m.totalContributed || 0,
      }));
      setTrip(parsedTrip);
    } else {
      const newTrip: Trip = {
        id: tripId,
        title: t('defaultTripTitle'),
        savingTargetPerMember: 1000000, // Default 1M target
        members: [],
        expenses: [],
        itinerary: [
          { id: crypto.randomUUID(), dateLabel: t('dayLabel', { number: 1 }), activities: [] }
        ],
        checklist: [],
        createdAt: Date.now(),
      };
      setTrip(newTrip);
      localStorage.setItem(`trip_${tripId}`, JSON.stringify(newTrip));
    }
    const storedUserId = localStorage.getItem(`trip_user_${tripId}`);
    if (!storedUserId) {
      setIsNameModalOpen(true);
    }
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      localStorage.setItem(`trip_${trip.id}`, JSON.stringify(trip));
      const storedUserId = localStorage.getItem(`trip_user_${trip.id}`);
      if (storedUserId) {
        const member = trip.members.find(m => m.id === storedUserId);
        if (member) setCurrentUser(member);
      }
    }
  }, [trip]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `trip_${tripId}` && e.newValue) {
        setTrip(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [tripId]);

  const handleNameJoin = (name: string) => {
    if (!trip) return;
    const newMember: Member = { id: crypto.randomUUID(), name, totalContributed: 0 };
    localStorage.setItem(`trip_user_${tripId}`, newMember.id);
    setTrip({ ...trip, members: [...trip.members, newMember] });
    setIsNameModalOpen(false);
    
    // Open the onboarding tutorial right after Name Setup
    setTimeout(() => {
      setIsOnboardingOpen(true);
    }, 400); // slight delay to let Name modal exit smoothly
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    triggerCelebration();
  };

  const updateTrip = (updatedTrip: Trip) => setTrip(updatedTrip);

  const handleSaveTitle = () => {
    if (trip && titleInput.trim() && titleInput !== trip.title) {
      updateTrip({ ...trip, title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'id' : 'en');
  };

  if (!trip) return null;

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen pb-28 relative overflow-hidden bg-pastel-cream">
      <header className="p-6 pb-2 pt-6 flex flex-col gap-4">
        <div className="flex justify-end gap-2 w-full">
          <button 
            onClick={toggleLanguage}
            className="bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-2.5 py-1.5 rounded-xl flex items-center shadow-sm font-sans font-bold text-[10px] text-ink-light hover:text-ink transition-colors h-8"
          >
            <Globe className="w-3.5 h-3.5 mr-1" />
            <span className={cn(lang === 'en' && "text-pastel-pink")}>EN</span>
            <span className="text-pastel-yellow mx-0.5">/</span>
            <span className={cn(lang === 'id' && "text-pastel-pink")}>ID</span>
          </button>
          <button 
            onClick={handleShare}
            className="bg-pastel-pink text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-pastel-pink/30 hover:shadow-pastel-pink/50 font-sans font-bold text-[11px] transition-all active:scale-95 h-8"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{isCopied ? t('tripCopied') : t('shareTrip')}</span>
          </button>
        </div>

        <div className="w-full">
          {isEditingTitle ? (
            <div className="flex items-center mb-1">
              <input 
                type="text" 
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="font-display font-bold text-3xl text-ink bg-white px-2 py-1 -ml-2 rounded-xl outline-none ring-2 ring-pastel-pink/50 w-full"
              />
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 mb-1 group cursor-pointer w-fit max-w-full" 
              onClick={() => { setTitleInput(trip.title); setIsEditingTitle(true); }}
              title={t('editTripName')}
            >
              <h1 className="font-display font-bold text-3xl text-ink truncate">{trip.title}</h1>
              <button className="text-ink-light opacity-50 group-hover:opacity-100 transition-opacity p-1 bg-pastel-cream rounded-full hover:bg-pastel-yellow/30 shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-ink-light font-sans text-sm font-medium">
            {t('friendshipId')} <span className="font-mono text-xs opacity-70 bg-ink-light/10 px-2 py-0.5 rounded-full">{tripId?.substring(0,8)}</span>
          </p>
        </div>
      </header>

      <main className="p-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95, y: 15, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: -15, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
          >
            {activeTab === "dashboard" && <DashboardTab trip={trip} updateTrip={updateTrip} currentUser={currentUser} />}
            {activeTab === "split" && <ExpensesTab trip={trip} updateTrip={updateTrip} currentUser={currentUser} />}
            {activeTab === "itinerary" && <ItineraryTab trip={trip} updateTrip={updateTrip} />}
            {activeTab === "checklist" && <ChecklistTab trip={trip} updateTrip={updateTrip} currentUser={currentUser} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <NameSetupModal isOpen={isNameModalOpen} onJoin={handleNameJoin} />
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onComplete={handleOnboardingComplete} 
        onStepChange={(stepId) => setActiveTab(stepId as TabId)}
      />

      {/* Floating Bottom Nav */}
      <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm transition-all duration-300 pointer-events-auto", isOnboardingOpen ? "z-[60] ring-4 ring-pastel-pink/30 rounded-3xl scale-105" : "z-40")}>
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-pastel-pink/10 border-2 border-pastel-yellow/20 flex justify-between items-center relative">
          {[
            { id: "dashboard", icon: Map, label: t('navHome') },
            { id: "split", icon: Receipt, label: t('navSplit') },
            { id: "itinerary", icon: Calendar, label: t('navGuide') },
            { id: "checklist", icon: CheckSquare, label: t('navPack') },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className="relative flex-1 py-3 flex flex-col items-center justify-center gap-1 z-10 tap-highlight-transparent"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-pastel-pink/10 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-pastel-pink" : "text-ink-light")} />
                <span className={cn("text-[10px] font-display font-bold transition-colors", isActive ? "text-pastel-pink" : "text-ink-light")}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
}

