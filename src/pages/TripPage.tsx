import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Map } from "lucide-react";
import NameSetupModal from "../components/NameSetupModal";
import MemberPickerModal from "../components/MemberPickerModal";
import OnboardingModal from "../components/OnboardingModal";
import DashboardTab from "../components/tabs/DashboardTab";
import ExpensesTab from "../components/tabs/ExpensesTab";
import ItineraryTab from "../components/tabs/ItineraryTab";
import ChecklistTab from "../components/tabs/ChecklistTab";
import TripHeaderActions from "../components/TripHeaderActions";
import TripTitle from "../components/TripTitle";
import TripTabBar from "../components/TripTabBar";
import { triggerCelebration } from "../lib/confetti";
import { useLanguage } from "../lib/i18n";
import { saveTrip } from "../lib/firebase";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useShare } from "../hooks/useShare";
import { useTripSubscription } from "../hooks/useTripSubscription";
import { useTripIdentity } from "../hooks/useTripIdentity";

type TabId = "dashboard" | "split" | "itinerary" | "checklist";

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const state = location.state as { tripId?: string; slug?: string } | null;

  const { t } = useLanguage();
  const { deferredPrompt, handleInstallClick } = usePwaInstall();
  const { resolvedTripId, trip, firebaseUid } = useTripSubscription(tripId, state?.slug, t);
  const {
    currentUser,
    isNameModalOpen,
    isMemberPickerOpen,
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

  const handleStartEdit = () => {
    if (!trip) return;
    setTitleInput(trip.title);
    setIsEditingTitle(true);
  };

  if (!trip) return null;

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen pb-28 relative overflow-hidden bg-pastel-cream">
      <header className="p-6 pb-2 pt-6 flex flex-col gap-4">
        <TripHeaderActions
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallClick}
          isCopied={isCopied}
          onShare={handleShare}
          t={t}
        />
        <TripTitle
          title={trip.title}
          isEditing={isEditingTitle}
          inputValue={titleInput}
          onInputChange={setTitleInput}
          onStartEdit={handleStartEdit}
          onSave={handleSaveTitle}
          t={t}
          slug={trip.slug}
          shortId={trip.id.substring(0, 8)}
        />
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

      <TripTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        t={t}
        elevated={isOnboardingOpen}
      />
    </div>
  );
}
