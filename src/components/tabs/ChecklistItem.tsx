import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { ChecklistItem as ChecklistItemType, Trip } from "../../types";

interface Props {
  key?: string;
  item: ChecklistItemType;
  trip: Trip;
  onToggle: (id: string) => void;
  packedByLabel: string;
  someoneLabel: string;
}

const getPackerName = (trip: Trip, completedBy: string | undefined, fallback: string) =>
  completedBy ? (trip.members.find(m => m.id === completedBy)?.name || fallback) : fallback;

export default function ChecklistItemCard({ item, trip, onToggle, packedByLabel, someoneLabel }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      onClick={() => onToggle(item.id)}
      className={cn("bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-colors shadow-sm", item.isCompleted ? "bg-opacity-50 opacity-60" : "hover:bg-pastel-cream")}
    >
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors", item.isCompleted ? "bg-pastel-mint border-pastel-mint" : "border-ink-light/30")}>
        {item.isCompleted ? <Check className="w-4 h-4 text-white font-bold" /> : <div className="w-2 h-2 rounded-full hidden" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("font-sans font-bold block truncate transition-all text-base", item.isCompleted ? "line-through text-ink-light" : "text-ink")}>
          {item.text}
        </span>
        {item.isCompleted && item.completedBy && (
          <span className="text-[10px] font-bold text-pastel-mint uppercase tracking-widest mt-1 block">
            {packedByLabel} {getPackerName(trip, item.completedBy, someoneLabel)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
