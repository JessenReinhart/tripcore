import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useLanguage } from "../lib/i18n";

type Props = {
  isOpen: boolean;
  onComplete: () => void;
  onStepChange: (stepId: string) => void;
};

export default function OnboardingModal({ isOpen, onComplete, onStepChange }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const STEPS = [
    {
      id: "dashboard",
      title: t('onb1Title'),
      description: t('onb1Desc'),
      xPos: "12.5%"
    },
    {
      id: "split",
      title: t('onb2Title'),
      description: t('onb2Desc'),
      xPos: "37.5%"
    },
    {
      id: "itinerary",
      title: t('onb3Title'),
      description: t('onb3Desc'),
      xPos: "62.5%"
    },
    {
      id: "checklist",
      title: t('onb4Title'),
      description: t('onb4Desc'),
      xPos: "87.5%"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      onStepChange(STEPS[currentStep].id);
    }
  }, [currentStep, isOpen, onStepChange]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      onComplete();
      setCurrentStep(0);
    }
  };

  const handleSkip = () => {
    onComplete();
    setCurrentStep(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end pb-32 px-4 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm pointer-events-auto"
            onClick={handleSkip}
          />

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-6 shadow-2xl relative w-full max-w-sm pointer-events-auto border-4 border-pastel-cream"
          >
            <h3 className="font-display font-bold text-xl text-ink mb-2">
              {STEPS[currentStep].title}
            </h3>
            <p className="font-sans font-medium text-ink-light text-sm mb-6">
              {STEPS[currentStep].description}
            </p>

            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn("w-2 h-2 rounded-full transition-all", idx === currentStep ? "bg-pastel-pink w-4" : "bg-pastel-cream")}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={handleSkip} className="text-ink-light text-xs font-bold px-3 py-2 active:scale-95 transition-transform hover:text-ink">{t('skip')}</button>
                <button onClick={handleNext} className="bg-pastel-pink text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition-transform hover:shadow-lg hover:shadow-pastel-pink/40">
                  {currentStep === STEPS.length - 1 ? (
                    <>{t('finish')} <Check className="w-3.5 h-3.5" /></>
                  ) : (
                    <>{t('next')} <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Downward pointing arrow tailored to the bottom nav position */}
            <div 
              className="absolute -bottom-3 w-6 h-6 bg-white border-b-4 border-r-4 border-pastel-cream rotate-45 transition-all duration-500 ease-out z-[1]"
              style={{ left: `calc(${STEPS[currentStep].xPos} - 12px)` }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
