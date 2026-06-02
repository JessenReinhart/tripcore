import React, { useState } from "react";
import { Trip, Member } from "../../types";
import { TrendingUp, Users, Plus, Target, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { triggerDopamine, triggerCelebration } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
  currentUser: Member | null;
};

export default function DashboardTab({ trip, updateTrip, currentUser }: Props) {
  const { t } = useLanguage();
  const totalSpent = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalPooled = trip.members.reduce((acc, m) => acc + m.totalContributed, 0);
  const totalTarget = trip.members.length * trip.savingTargetPerMember;
  const poolProgress = totalTarget > 0 ? Math.min((totalPooled / totalTarget) * 100, 100) : 0;

  // Add Deposit state
  const [selectedMemberModal, setSelectedMemberModal] = useState<Member | null>(null);
  const [depositInput, setDepositInput] = useState("");
  
  // Custom target edit state
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(trip.savingTargetPerMember.toString());

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberModal || !depositInput) return;
    
    const amount = parseFloat(depositInput);
    if (isNaN(amount) || amount <= 0) return;

    const newTotal = selectedMemberModal.totalContributed + amount;
    if (newTotal >= trip.savingTargetPerMember && selectedMemberModal.totalContributed < trip.savingTargetPerMember) {
      triggerCelebration();
    } else {
      triggerDopamine();
    }

    const updatedMembers = trip.members.map(m => 
      m.id === selectedMemberModal.id 
        ? { ...m, totalContributed: newTotal } 
        : m
    );
    
    updateTrip({ ...trip, members: updatedMembers });
    setSelectedMemberModal(null);
    setDepositInput("");
  };

  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetInput);
    if (!isNaN(amount) && amount > 0) {
      updateTrip({ ...trip, savingTargetPerMember: amount });
    }
    setIsEditingTarget(false);
  };

  // Simple 'who owes who' logic for the dashboard
  const calculateOwes = () => {
    const balances: Record<string, number> = {};
    trip.members.forEach(m => balances[m.id] = 0);
    trip.expenses.forEach(exp => {
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
      const splitAmt = exp.amount / exp.splitBetween.length;
      exp.splitBetween.forEach(mId => balances[mId] = (balances[mId] || 0) - splitAmt);
    });
    return Object.entries(balances)
      .filter(([id, amt]) => amt > 1 && trip.members.find(m=>m.id===id))
      .map(([id, amt]) => ({ member: trip.members.find(m => m.id === id)!, amount: amt }));
  };
  const owedList = calculateOwes();

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
            <p className="font-display font-bold text-xl lg:text-2xl text-ink">Rp {totalPooled.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-pastel-cream p-4 rounded-2xl">
            <p className="text-xs font-sans text-ink-light uppercase font-bold tracking-widest mb-1">{t('totalSpent')}</p>
            <p className="font-display font-bold text-xl lg:text-2xl text-ink">Rp {totalSpent.toLocaleString()}</p>
          </div>
        </div>
        
        {owedList.length > 0 && (
          <div className="mt-2 p-4 bg-pastel-mint/20 rounded-2xl">
            <p className="text-sm font-sans font-medium text-ink">
              {t('lookForward')} <br/>
              {owedList.map((o) => (
                <span key={o.member.id} className="block mt-1">
                  <strong className="text-pastel-mint mix-blend-multiply">{o.member.name}</strong> {t('getsBack')} Rp {Math.round(o.amount).toLocaleString()}
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
            <input type="number" min="0" value={targetInput} onChange={(e)=>setTargetInput(e.target.value)} className="flex-1 bg-pastel-cream border-none px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 ring-pastel-pink/50"/>
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
            {trip.members.map(member => {
              const prog = Math.min((member.totalContributed / trip.savingTargetPerMember) * 100, 100);
              const isGoalMet = member.totalContributed >= trip.savingTargetPerMember;

              return (
                <li key={member.id} className="bg-pastel-cream/50 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden transition-colors border border-transparent hover:border-pastel-yellow/30">
                  <div className="flex items-center justify-between z-10 relative">
                    <span className={cn("font-sans font-medium text-ink flex items-center gap-2", member.id === currentUser?.id && "font-bold")}>
                      {member.name} {member.id === currentUser?.id && t('you')}
                      {isGoalMet && <span className="text-xs">✨</span>}
                    </span>
                    <button 
                      onClick={() => setSelectedMemberModal(member)}
                      className="bg-pastel-pink text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-pastel-pink/30 hover:shadow-lg hover:shadow-pastel-pink/50 transition-all font-bold text-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('deposit')}
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
                  
                  {isGoalMet && <div className="absolute inset-0 bg-pastel-mint/10 pointer-events-none" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Tiny Inline Modal for depositing */}
      <AnimatePresence>
        {selectedMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedMemberModal(null)} 
                className="absolute top-4 right-4 text-ink-light bg-pastel-cream rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-pastel-mint/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-display font-bold text-ink text-lg mb-1">{t('addToKas')}</h3>
              <p className="text-xs font-sans text-ink-light mb-4">{t('loggingDepositFor')} <strong className="text-ink">{selectedMemberModal.name}</strong></p>
              
              <form onSubmit={handleAddDeposit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="bg-pastel-cream px-3 py-3 rounded-xl font-sans font-bold text-ink-light flex items-center text-sm">Rp</span>
                  <input
                    type="number"
                    autoFocus
                    placeholder="200000"
                    className="w-full bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-mint outline-none font-bold text-ink"
                    value={depositInput} 
                    onChange={(e) => setDepositInput(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                   <button type="button" onClick={() => setDepositInput("50000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">50k</button>
                   <button type="button" onClick={() => setDepositInput("100000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">100k</button>
                   <button type="button" onClick={() => setDepositInput("200000")} className="flex-1 bg-pastel-cream py-2 rounded-lg text-xs font-bold text-ink-light hover:bg-pastel-yellow/30">200k</button>
                </div>
                <button type="submit" className="w-full bg-pastel-mint text-ink font-display font-bold py-3 rounded-xl mt-2 shadow-md">
                  {t('logDepositBtn')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
