import { Trip, ItineraryDay, Activity } from "../../types";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Clock, Calendar, Trash2, ChevronDown, Navigation, Pencil, Undo2 } from "lucide-react";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";
import ActivityForm from "./ActivityForm";
import ItineraryMapView from "./ItineraryMapView";

type Props = {
  trip: Trip;
  updateTrip: (trip: Trip) => void;
};

const sortByTime = (activities: Activity[]) =>
  [...activities].sort((a, b) => a.time.localeCompare(b.time));

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayStr(): string {
  const d = new Date();
  return fmtDate(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
}

function formatDateShort(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    month: 'short', day: 'numeric',
  }).format(parseDate(dateStr));
}

function formatDateFull(dateStr: string, lang: string): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(parseDate(dateStr));
}

function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return fmtDate(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
}

function openDirections(destLat: number, destLng: number) {
  const destUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${destLat},${destLng}&travelmode=driving`;
        window.open(url, '_blank');
      },
      () => {
        window.open(destUrl, '_blank');
      },
      { timeout: 5000 }
    );
  } else {
    window.open(destUrl, '_blank');
  }
}

export default function ItineraryTab({ trip, updateTrip }: Props) {
  const { t, lang } = useLanguage();
  const [activeDayId, setActiveDayId] = useState<string | null>(trip.itinerary[0]?.id || null);
  const [isAdding, setIsAdding] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [undoDay, setUndoDay] = useState<{ day: ItineraryDay; index: number } | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const handleAddDay = () => {
    dismissUndo();
    let nextDate: string | undefined;
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    if (lastDay?.date) {
      nextDate = addDays(lastDay.date, 1);
    } else {
      nextDate = todayStr();
    }

    const newDay: ItineraryDay = {
      id: crypto.randomUUID(),
      dateLabel: t('dayLabel', { number: trip.itinerary.length + 1 }),
      date: nextDate,
      activities: [],
    };
    updateTrip({ ...trip, itinerary: [...trip.itinerary, newDay] });
    setActiveDayId(newDay.id);
  };

  const handleDeleteDay = (dayId: string) => {
    if (trip.itinerary.length <= 1) return;
    const index = trip.itinerary.findIndex(d => d.id === dayId);
    const dayToDelete = trip.itinerary[index];
    if (!dayToDelete) return;

    const filtered = trip.itinerary.filter(d => d.id !== dayId);
    const newActiveId = filtered[Math.min(index, filtered.length - 1)]?.id || null;
    setActiveDayId(newActiveId);
    updateTrip({ ...trip, itinerary: filtered });

    setUndoDay({ day: dayToDelete, index });

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setUndoDay(null), 5000);
  };

  const undoDeleteDay = () => {
    if (!undoDay) return;
    const restored = [...trip.itinerary];
    restored.splice(undoDay.index, 0, undoDay.day);
    updateTrip({ ...trip, itinerary: restored });
    setActiveDayId(undoDay.day.id);
    setUndoDay(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  const dismissUndo = () => {
    setUndoDay(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  const handleDateChange = (dateStr: string) => {
    dismissUndo();
    if (!activeDayId || !dateStr) return;
    const updatedItinerary = trip.itinerary.map(day =>
      day.id === activeDayId ? { ...day, date: dateStr } : day
    );
    updateTrip({ ...trip, itinerary: updatedItinerary });
    setIsEditingDate(false);
  };

  const handleAddActivity = (time: string, title: string, location?: string, lat?: number, lng?: number) => {
    dismissUndo();
    if (!activeDayId) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      title,
      time,
      location,
      lat,
      lng,
    };

    const updatedItinerary = trip.itinerary.map(day =>
      day.id === activeDayId
        ? { ...day, activities: sortByTime([...day.activities, newActivity]) }
        : day
    );

    updateTrip({ ...trip, itinerary: updatedItinerary });
    triggerDopamine();
    setIsAdding(false);
  };

  const removeActivity = (activityId: string) => {
    const updatedItinerary = trip.itinerary.map(day =>
      day.id === activeDayId
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    );
    updateTrip({ ...trip, itinerary: updatedItinerary });
  };

  const activeDay = trip.itinerary.find(d => d.id === activeDayId);
  const locatedCount = activeDay?.activities.filter(a => a.lat !== undefined && a.lng !== undefined).length ?? 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
        {trip.itinerary.map((day) => (
          <button
            key={day.id}
            onClick={() => { setActiveDayId(day.id); setIsMapOpen(false); setIsEditingDate(false); }}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl font-display font-bold text-sm transition-all shadow-sm shrink-0 snap-start ${
              activeDayId === day.id ? "bg-pastel-pink text-white" : "bg-white text-ink-light border-2 border-pastel-cream"
            }`}
          >
            {day.date ? formatDateShort(day.date, lang) : day.dateLabel}
          </button>
        ))}
        <button onClick={handleAddDay} className="flex items-center justify-center w-12 h-12 bg-pastel-cream rounded-2xl text-ink-light hover:bg-pastel-yellow transition-colors shrink-0 snap-start">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {activeDay && (
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {isEditingDate ? (
                <input
                  type="date"
                  value={activeDay.date || ''}
                  onChange={e => handleDateChange(e.target.value)}
                  onBlur={() => setIsEditingDate(false)}
                  className="bg-pastel-cream px-3 py-1.5 rounded-xl text-xs font-sans font-bold outline-none focus:ring-2 ring-pastel-pink/50 text-ink"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingDate(true)}
                  className="flex items-center gap-1.5 text-xs text-ink-light font-sans hover:text-pastel-pink transition-colors py-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {activeDay.date
                    ? formatDateFull(activeDay.date, lang)
                    : activeDay.dateLabel}
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
            {trip.itinerary.length > 1 && (
              <button
                onClick={() => handleDeleteDay(activeDay.id)}
                className="flex items-center gap-1 text-xs font-bold text-ink-light hover:text-red-400 transition-colors py-1 px-2 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('deleteDay')}
              </button>
            )}
          </div>

          {locatedCount > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setIsMapOpen(!isMapOpen)}
                className="w-full flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border-2 border-pastel-cream shadow-sm hover:border-pastel-pink/30 transition-colors"
              >
                <span className="font-sans font-bold text-xs text-ink-light">{t('mapStops', { count: locatedCount })}</span>
                <ChevronDown className={`w-4 h-4 text-ink-light transition-transform duration-200 ${isMapOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMapOpen && (
                <div className="mt-2">
                  <ItineraryMapView
                    activities={activeDay.activities}
                    dayLabel={activeDay.date ? formatDateFull(activeDay.date, lang) : activeDay.dateLabel}
                  />
                </div>
              )}
            </div>
          )}

          {activeDay.activities.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-pastel-cream text-center text-ink-light font-sans text-sm pb-10 flex flex-col items-center justify-center gap-3 mt-2">
              <div className="w-14 h-14 bg-pastel-cream/50 rounded-full flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6 text-pastel-pink/70" />
              </div>
              {t('noPlansYet')} {activeDay.date ? formatDateShort(activeDay.date, lang) : activeDay.dateLabel}.
            </div>
          ) : (
            <div className="relative pl-7 sm:pl-10 mt-2">
              <div className="absolute left-[9px] sm:left-[13px] top-6 bottom-4 w-1 flex flex-col justify-between">
                <div className="w-full h-full bg-pastel-cream rounded-full" />
              </div>

              <div className="flex flex-col gap-5">
                <AnimatePresence>
                  {activeDay.activities.map((act) => (
                    <motion.div key={act.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative group w-full">
                      <div className="absolute -left-[32px] sm:-left-[44px] top-4 w-[22px] h-[22px] rounded-full border-4 border-pastel-cream bg-pastel-mint shadow-sm z-10 box-border flex items-center justify-center" />
                      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-pastel-yellow/10 flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-pastel-pink font-bold text-xs font-mono uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {act.time}
                          </div>
                          <button onClick={() => removeActivity(act.id)} className="text-ink-light opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-pastel-pink p-1 bg-pastel-cream rounded-full">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-sans font-bold text-ink text-[15px] sm:text-base break-words pr-2">{act.title}</p>
                        {act.location && (
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="font-sans text-xs text-ink-light truncate flex-1">{act.location}</p>
                            {act.lat !== undefined && act.lng !== undefined && (
                              <button
                                onClick={() => openDirections(act.lat!, act.lng!)}
                                className="flex items-center gap-1 text-xs font-bold text-pastel-pink hover:text-ink-light transition-colors bg-pastel-pink/10 px-2.5 py-1 rounded-full shrink-0"
                              >
                                <Navigation className="w-3 h-3" />
                                {t('directions')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!isAdding ? (
            <button onClick={() => setIsAdding(true)} className="mt-4 bg-pastel-cream border-2 border-dashed border-ink-light/20 text-ink-light font-bold py-4 rounded-3xl flex items-center justify-center gap-2 font-sans hover:bg-pastel-yellow/30 transition-colors w-full">
              <Plus className="w-5 h-5" /> {t('addPlan')}
            </button>
          ) : (
            <ActivityForm
              onSave={handleAddActivity}
              onCancel={() => setIsAdding(false)}
              t={t}
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {undoDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-sans text-sm"
          >
            <span>{t('dayDeleted')}</span>
            <button
              onClick={undoDeleteDay}
              className="flex items-center gap-1 font-bold text-pastel-yellow hover:text-pastel-mint transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              {t('undo')}
            </button>
            <button onClick={dismissUndo} className="text-white/40 hover:text-white/70 transition-colors ml-1">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
