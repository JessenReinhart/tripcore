import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Map, Receipt, Calendar, CheckSquare, Pencil, Globe, UserPlus, Check, Download } from "lucide-react";
import NameSetupModal from "../components/NameSetupModal";
import MemberPickerModal from "../components/MemberPickerModal";
import OnboardingModal from "../components/OnboardingModal";
import DashboardTab from "../components/tabs/DashboardTab";
import ExpensesTab from "../components/tabs/ExpensesTab";
import ItineraryTab from "../components/tabs/ItineraryTab";
import ChecklistTab from "../components/tabs/ChecklistTab";
import { cn } from "../lib/utils";
import { triggerCelebration } from "../lib/confetti";
import { useLanguage } from "../lib/i18n";
import { saveTrip } from "../lib/firebase";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useShare } from "../hooks/useShare";
import { useTripSubscription } from "../hooks/useTripSubscription";
import { useTripIdentity } from "../hooks/useTripIdentity";

type TabId = "dashboard" | "split" | "itinerary" | "checklist";

const TAB_ITEMS: { id: TabId; icon: typeof Map; labelKey: string }[] = [
  { id: "dashboard", icon: Map, labelKey: 'navHome' },
  { id: "split", icon: Receipt, labelKey: 'navSplit' },
  { id: "itinerary", icon: Calendar, labelKey: 'navGuide' },
  { id: "checklist", icon: CheckSquare, labelKey: 'navPack' },
];

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const state = location.state as { tripId?: string; slug?: string } | null;

  const { t, lang, setLang } = useLanguage();
  const { deferredPrompt, handleInstallClick } = usePwaInstall();
  const { resolvedTripId, trip, firebaseUid } = useTripSubscription(tripId, state?.slug, t);
  const {
    currentUser,
    isNameModalOpen,
    isMemberPickerOpen,
    setIsNameModalOpen,
    handleNameJoin,
    handleReclaimMember,
    handleNewMemberFromPicker,
  } = useTripIdentity(trip, firebaseUid, resolvedTripId);
  const { isCopied, handleShare } = useShare(trip, t);

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const updateTrip = (updatedTrip: typeof trip) => {
    if (!resolvedTripId || !updatedTrip) return;
    saveTrip(resolvedTripId, updatedTrip);
  };

  const handleNameJoinWithOnboarding = async (name: string, pin: string) => {
    await handleNameJoin(name, pin);
    setTimeout(() => setIsOnboardingOpen(true), 400);
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    triggerCelebration();
  };

  const handleSaveTitle = () => {
    if (trip && titleInput.trim() && titleInput !== trip.title) {
      updateTrip({ ...trip, title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const toggleLanguage = () => setLang(lang === 'en' ? 'id' : 'en');

  if (!trip) return null;

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen pb-28 relative overflow-hidden bg-pastel-cream">
      <header className="p-6 pb-2 pt-6 flex flex-col gap-4">
        <div className="flex justify-end gap-2 w-full flex-wrap">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-white/50 backdrop-blur-md border border-pastel-yellow/30 px-2.5 py-1.5 rounded-xl flex items-center shadow-sm font-sans font-bold text-[10px] text-ink transition-colors h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-pastel-pink" />
              <span>{t('installApp')}</span>
            </button>
          )}
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
            {t('friendshipId')}{" "}
            <span className="font-mono text-xs opacity-70 bg-ink-light/10 px-2 py-0.5 rounded-full select-all">
              {trip.slug || trip.id.substring(0, 8)}
            </span>
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

        <div className="mt-8 mb-4 text-center opacity-40 flex items-center justify-center gap-1.5 font-display font-bold text-ink">
          <Map className="w-4 h-4 text-pastel-pink" />
          tripcore
        </div>
      </main>

      <NameSetupModal isOpen={isNameModalOpen} onJoin={handleNameJoinWithOnboarding} />
      <MemberPickerModal
        isOpen={isMemberPickerOpen}
        members={trip.members}
        onReclaim={handleReclaimMember}
        onNewMember={handleNewMemberFromPicker}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onStepChange={(stepId) => setActiveTab(stepId as TabId)}
      />

      <div className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm transition-all duration-300 pointer-events-auto", isOnboardingOpen ? "z-[60] ring-4 ring-pastel-pink/30 rounded-3xl scale-105" : "z-40")}>
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-pastel-pink/10 border-2 border-pastel-yellow/20 flex justify-between items-center relative">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
