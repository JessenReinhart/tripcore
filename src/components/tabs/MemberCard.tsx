import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { Member } from "../../types";

interface Props {
  key?: string;
  member: Member;
  savingTarget: number;
  effectiveKasBalance: number;
  isCurrentUser: boolean;
  onDeposit: (member: Member) => void;
  youLabel: string;
  depositLabel: string;
  kasBalanceLabel: string;
  kasExceededLabel: string;
}

export default function MemberCard({ member, savingTarget, effectiveKasBalance, isCurrentUser, onDeposit, youLabel, depositLabel, kasBalanceLabel, kasExceededLabel }: Props) {
  const prog = Math.min((member.totalContributed / savingTarget) * 100, 100);
  const isGoalMet = member.totalContributed >= savingTarget;

  return (
    <li className="bg-pastel-cream/50 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-colors border border-transparent hover:border-pastel-yellow/30">
      <div className="flex items-center justify-between z-10 relative">
        <span className={cn("font-sans font-medium text-ink flex items-center gap-2", isCurrentUser && "font-bold")}>
          {member.name} {isCurrentUser && youLabel}
          {isGoalMet && <span className="text-xs">✨</span>}
        </span>
        <button
          onClick={() => onDeposit(member)}
          className="bg-pastel-pink text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-pastel-pink/30 hover:shadow-lg hover:shadow-pastel-pink/50 transition-all font-bold text-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> {depositLabel}
        </button>
      </div>

      <div className="flex items-center gap-3 z-10 relative mt-1">
        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${prog}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn("h-full rounded-full", isGoalMet ? "bg-pastel-mint" : "bg-pastel-pink")}
          />
        </div>
        <span className={cn("font-mono text-[10px] font-bold", isGoalMet ? "text-pastel-mint" : "text-ink-light")}>
          {Math.round(prog)}%
        </span>
      </div>
      <div className="z-10 relative">
        <p className="font-display font-bold text-ink text-sm">Rp {member.totalContributed.toLocaleString()}</p>
      </div>

      <div className="flex items-center justify-between z-10 relative">
        <p className={cn("font-sans text-xs", effectiveKasBalance < 0 ? "text-pastel-pink font-bold" : "text-ink-light")}>
          {kasBalanceLabel}: Rp {Math.round(effectiveKasBalance).toLocaleString()}
        </p>
        {effectiveKasBalance < 0 && (
          <span className="text-[10px] font-bold text-pastel-pink bg-pastel-pink/10 px-2 py-0.5 rounded-full animate-pulse">
            {kasExceededLabel}
          </span>
        )}
      </div>

      {isGoalMet && <div className="absolute inset-0 bg-pastel-mint/10 pointer-events-none" />}
    </li>
  );
}
