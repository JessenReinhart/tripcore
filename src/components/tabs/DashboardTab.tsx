import { useState, type FormEvent } from "react";
import { Trip, Member } from "../../types";
import { TrendingUp, Target } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { triggerDopamine, triggerCelebration } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";
import DepositModal from "./DepositModal";
import MemberCard from "./MemberCard";
import { computeBalances, computeKasDeductions, totalKasSpent } from "./expenseConstants";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

const calculateOwes = (trip: Trip) => {
  const balances = computeBalances(trip);
  const memberMap = new Map(trip.members.map((m) => [m.id, m]));
  return Object.entries(balances)
    .filter(([id, amt]) => amt > 1 && memberMap.has(id))
    .map(([id, amt]) => ({ member: memberMap.get(id)!, amount: amt }));
};

export default function DashboardTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(trip.savingTargetPerMember.toString());

  const totalPooled = trip.members.reduce((acc, m) => acc + m.totalContributed, 0);
  const kasSpentFromPool = totalKasSpent(trip);
  const kasRemaining = totalPooled - kasSpentFromPool;
  const kasDeductions = computeKasDeductions(trip);
  const totalTarget = trip.members.length * trip.savingTargetPerMember;
  const poolProgress = totalTarget > 0 ? Math.min((totalPooled / totalTarget) * 100, 100) : 0;
  const owedList = calculateOwes(trip);

  const handleDepositSubmit = (member: Member, amount: number) => {
    const newTotal = member.totalContributed + amount;
    if (newTotal >= trip.savingTargetPerMember && member.totalContributed < trip.savingTargetPerMember) {
      triggerCelebration();
    } else {
      triggerDopamine();
    }
    const updatedMembers = trip.members.map(m =>
      m.id === member.id ? { ...m, totalContributed: newTotal } : m
    );
    updateTrip({ ...trip, members: updatedMembers });
  };

  const handleUpdateTarget = (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetInput);
    if (!isNaN(amount) && amount > 0) {
      updateTrip({ ...trip, savingTargetPerMember: amount });
    }
    setIsEditingTarget(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-12 relative">
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-pastel-yellow/20 flex flex-col gap-4">
        <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
          <TrendingUp className="text-pastel-pink w-6 h-6" />
          {t('overviewTitle')}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-pastel-cream p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-pastel-pink/10 px-3 py-1 rounded-bl-xl font-bold text-pastel-pink text-[10px] tracking-widest uppercase">
              {t('treasury')}
            </div>
            <p className="text-xs font-sans text-ink-light uppercase font-bold tracking-widest mb-1">{t('totalPooled')}</p>
            <p className="font-display font-bold text-xl lg:text-2xl text-ink">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalPooled)}</p>
          </div>
          <div className="flex-1 bg-pastel-cream p-4 rounded-2xl">
            <p className="text-xs font-sans text-ink-light uppercase font-bold tracking-widest mb-1">{t('spentFromKas')}</p>
            <p className="font-display font-bold text-xl lg:text-2xl text-ink">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(kasSpentFromPool)}</p>
          </div>
        </div>

        <div className={cn("p-4 rounded-2xl", kasRemaining < 0 ? "bg-pastel-pink/10 border border-pastel-pink/30" : "bg-pastel-mint/20")}>
          <p className="text-xs font-sans text-ink-light uppercase font-bold tracking-widest mb-1">{t('remainingKas')}</p>
          <p className={cn("font-display font-bold text-xl lg:text-2xl", kasRemaining < 0 ? "text-pastel-pink" : "text-ink")}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(kasRemaining)}
          </p>
        </div>

        {owedList.length > 0 && (
          <div className="mt-2 p-4 bg-pastel-mint/20 rounded-2xl">
            <p className="text-sm font-sans font-medium text-ink">
              {t('lookForward')} <br />
              {owedList.map((o) => (
                <span key={o.member.id} className="block mt-1">
                  <strong className="text-pastel-mint mix-blend-multiply">{o.member.name}</strong> {t('getsBack')} {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Math.round(o.amount))}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-pastel-yellow/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display font-bold text-xl text-ink flex items-center gap-2">
              <Target className="text-pastel-pink w-6 h-6" />
              {t('goalTracker')}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-sans font-bold text-ink-light bg-pastel-cream px-2 py-1 rounded-md">
                {t('goalPerPerson', { amount: trip.savingTargetPerMember.toLocaleString() })}
              </span>
              <button onClick={() => setIsEditingTarget(!isEditingTarget)} className="text-[10px] text-pastel-pink font-bold uppercase tracking-wide">{t('edit')}</button>
            </div>
          </div>
        </div>

        {isEditingTarget && (
          <form onSubmit={handleUpdateTarget} className="flex gap-2 mb-4">
            <input type="number" min="0" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} className="flex-1 bg-pastel-cream border-none px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 ring-pastel-pink/50" />
            <button type="submit" className="bg-ink text-white font-bold text-xs px-4 rounded-xl">{t('save')}</button>
          </form>
        )}

        {trip.members.length > 0 && (
          <div className="mb-6 relative">
            <div className="flex justify-between text-[10px] font-bold text-ink-light mb-1 px-1">
              <span>{t('groupProgress')}</span>
              <span>{Math.round(poolProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-pastel-cream rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${poolProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-pastel-mint rounded-full"
              />
            </div>
          </div>
        )}

        {trip.members.length === 0 ? (
          <p className="text-ink-light text-sm italic py-4 text-center">{t('noFriendsYet')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {trip.members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                savingTarget={trip.savingTargetPerMember}
                effectiveKasBalance={member.totalContributed - (kasDeductions[member.id] || 0)}
                isCurrentUser={member.id === currentUser?.id}
                onDeposit={(m) => setSelectedMember(m)}
                youLabel={t('you')}
                depositLabel={t('deposit')}
                kasBalanceLabel={t('kasBalance')}
                kasExceededLabel={t('kasExceeded')}
              />
            ))}
          </ul>
        )}
      </div>

      <DepositModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onSubmit={handleDepositSubmit}
        t={t}
      />
    </div>
  );
}
