import { Trip, ItineraryDay, Activity } from "../../types";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Clock, X, Calendar, Trash2 } from "lucide-react";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
};

export default function ItineraryTab({ trip, updateTrip }: Props) {
  const { t } = useLanguage();
  const [activeDayId, setActiveDayId] = useState<string | null>(trip.itinerary[0]?.id || null);
  const [isAdding, setIsAdding] = useState(false);
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");

  const handleAddDay = () => {
    const newDay: ItineraryDay = {
      id: crypto.randomUUID(),
      dateLabel: t('dayLabel', { number: trip.itinerary.length + 1 }),
      activities: []
    };
    updateTrip({ ...trip, itinerary: [...trip.itinerary, newDay] });
    setActiveDayId(newDay.id);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !activeDayId) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      title,
      time
    };

    const updatedItinerary = trip.itinerary.map(day => {
      if (day.id === activeDayId) {
        return { ...day, activities: [...day.activities, newActivity].sort((a,b) => a.time.localeCompare(b.time)) };
      }
      return day;
    });

    updateTrip({ ...trip, itinerary: updatedItinerary });
    triggerDopamine();
    setIsAdding(false);
    setTitle("");
    setTime("");
  };

  const removeActivity = (activityId: string) => {
    const updatedItinerary = trip.itinerary.map(day => {
      if (day.id === activeDayId) {
        return { ...day, activities: day.activities.filter(a => a.id !== activityId) };
      }
      return day;
    });
    updateTrip({ ...trip, itinerary: updatedItinerary });
  };

  const activeDay = trip.itinerary.find(d => d.id === activeDayId);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
        {trip.itinerary.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveDayId(day.id)}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl font-display font-bold text-sm transition-all shadow-sm shrink-0 snap-start ${
              activeDayId === day.id ? "bg-pastel-pink text-white" : "bg-white text-ink-light border-2 border-pastel-cream"
            }`}
          >
            {day.dateLabel}
          </button>
        ))}
        <button onClick={handleAddDay} className="flex items-center justify-center w-12 h-12 bg-pastel-cream rounded-2xl text-ink-light hover:bg-pastel-yellow transition-colors shrink-0 snap-start">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {activeDay && (
        <div className="flex flex-col mt-2 w-full">
           {activeDay.activities.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-pastel-cream text-center text-ink-light font-sans text-sm pb-10 flex flex-col items-center justify-center gap-3 mt-2">
                 <div className="w-14 h-14 bg-pastel-cream/50 rounded-full flex items-center justify-center mb-1">
                    <Calendar className="w-6 h-6 text-pastel-pink/70" />
                 </div>
                 {t('noPlansYet')} {activeDay.dateLabel}.
              </div>
           ) : (
              <div className="relative pl-7 sm:pl-10 mt-2">
                 {/* Timeline Line */}
                 <div className="absolute left-[9px] sm:left-[13px] top-6 bottom-4 w-1 flex flex-col justify-between">
                    <div className="w-full h-full bg-pastel-cream rounded-full" />
                 </div>
                 
                 <div className="flex flex-col gap-5">
                   <AnimatePresence>
                     {activeDay.activities.map((act) => (
                        <motion.div key={act.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}} className="relative group w-full">
                           {/* Dot */}
                           <div className="absolute -left-[32px] sm:-left-[44px] top-4 w-[22px] h-[22px] rounded-full border-4 border-pastel-cream bg-pastel-mint shadow-sm z-10 box-border flex items-center justify-center" />
                           
                           <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-pastel-yellow/10 flex flex-col gap-2 w-full">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-pastel-pink font-bold text-xs font-mono uppercase tracking-wider">
                                    <Clock className="w-3.5 h-3.5" />
                                    {act.time}
                                  </div>
                                  <button onClick={() => removeActivity(act.id)} className="text-ink-light opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-pastel-pink p-1 bg-pastel-cream rounded-full">
                                    <Trash2 className="w-3.5 h-3.5"/>
                                  </button>
                               </div>
                               <p className="font-sans font-bold text-ink text-[15px] sm:text-base break-words pr-2">{act.title}</p>
                           </div>
                        </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
              </div>
           )}

           {/* Add Button */}
           {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="mt-4 bg-pastel-cream border-2 border-dashed border-ink-light/20 text-ink-light font-bold py-4 rounded-3xl flex items-center justify-center gap-2 font-sans hover:bg-pastel-yellow/30 transition-colors w-full">
                <Plus className="w-5 h-5"/> {t('addPlan')}
              </button>
           ) : (
              <motion.form initial={{opacity:0, height:0}} animate={{opacity:1, height:"auto"}} onSubmit={handleAddActivity} className="bg-white p-5 rounded-3xl border-2 border-pastel-pink/20 flex flex-col gap-3 shadow-md mt-4 relative overflow-hidden w-full">
                 <div className="flex justify-between items-center mb-1">
                   <span className="font-display font-bold text-sm text-ink text-opacity-50 uppercase tracking-widest">{t('newPlanTitle')}</span>
                   <button type="button" onClick={() => setIsAdding(false)} className="text-ink-light bg-pastel-cream p-1.5 rounded-full hover:text-ink transition-colors"><X className="w-4 h-4"/></button>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <input type="time" required value={time} onChange={e=>setTime(e.target.value)} className="bg-pastel-cream px-4 py-3 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 ring-pastel-pink/50 text-ink w-full sm:w-auto" />
                   <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} placeholder={t('planPlaceholder')} className="bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none w-full flex-1" autoFocus />
                 </div>
                 <button type="submit" className="bg-ink text-white font-bold py-3.5 rounded-xl text-sm mt-1 shadow-md hover:shadow-lg transition-shadow bg-opacity-90 active:scale-95">{t('addToTimeline')}</button>
              </motion.form>
           )}
        </div>
      )}
    </div>
  );
}
