import { motion } from "motion/react";
import { Map, Receipt, Calendar, CheckSquare, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

type TabId = "dashboard" | "split" | "itinerary" | "checklist";

const TAB_ITEMS: { id: TabId; icon: LucideIcon; labelKey: string }[] = [
  { id: "dashboard", icon: Map, labelKey: "navHome" },
  { id: "split", icon: Receipt, labelKey: "navSplit" },
  { id: "itinerary", icon: Calendar, labelKey: "navGuide" },
  { id: "checklist", icon: CheckSquare, labelKey: "navPack" },
];

interface TripTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  t: (key: string) => string;
  elevated?: boolean;
}

export default function TripTabBar({ activeTab, onTabChange, t, elevated }: TripTabBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm transition-all duration-300 pointer-events-auto",
        elevated ? "z-[60] ring-4 ring-pastel-pink/30 rounded-3xl scale-105" : "z-40",
      )}
    >
      <div className="bg-white p-2 rounded-3xl shadow-xl shadow-pastel-pink/10 border-2 border-pastel-yellow/20 flex justify-between items-center relative">
        {TAB_ITEMS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
  );
}
