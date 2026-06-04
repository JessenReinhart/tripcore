import { Trip, ItineraryDay, Activity } from "../../types";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Clock, Calendar, Trash2, ChevronDown, Navigation, Pencil, Undo2 } from "lucide-react";
import { triggerDopamine } from "../../lib/confetti";
import { useLanguage } from "../../lib/i18n";
import ActivityForm from "./ActivityForm";
import ItineraryMapView from "./ItineraryMapView";

type TFn = (key: string, params?: Record<string, string | number>) => string;

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
  if (!navigator.geolocation) { window.open(destUrl, '_blank'); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => window.open(`https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${destLat},${destLng}&travelmode=driving`, '_blank'),
    () => window.open(destUrl, '_blank'),
    { timeout: 5000 }
  );
}

function useUndoDay(trip: Trip, updateTrip: (trip: Trip) => void, setActiveDayId: (id: string | null) => void) {
  const [undoDay, setUndoDay] = useState<{ day: ItineraryDay; index: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const scheduleDelete = (dayId: string) => {
    if (trip.itinerary.length <= 1) return;
    const index = trip.itinerary.findIndex(d => d.id === dayId);
    const dayToDelete = trip.itinerary[index];
    if (!dayToDelete) return;
    const filtered = trip.itinerary.filter(d => d.id !== dayId);
    const newActiveId = filtered[Math.min(index, filtered.length - 1)]?.id || null;
    setActiveDayId(newActiveId);
    updateTrip({ ...trip, itinerary: filtered });
    setUndoDay({ day: dayToDelete, index });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setUndoDay(null), 5000);
  };

  const undo = () => {
    if (!undoDay) return;
    const restored = [...trip.itinerary];
    restored.splice(undoDay.index, 0, undoDay.day);
    updateTrip({ ...trip, itinerary: restored });
    setActiveDayId(undoDay.day.id);
    setUndoDay(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const dismiss = () => {
    setUndoDay(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return { undoDay, scheduleDelete, undo, dismiss };
}

function DayHeader({ day, canDelete, onDateChange, onDelete, t, lang }: {
  day: ItineraryDay; canDelete: boolean; onDateChange: (d: string) => void; onDelete: () => void; t: TFn; lang: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        {editing ? (
          <input type="date" value={day.date || ''}
            onChange={e => { onDateChange(e.target.value); setEditing(false); }}
            onBlur={() => setEditing(false)}
            className="bg-pastel-cream px-3 py-1.5 rounded-xl text-xs font-sans font-bold outline-none focus:ring-2 ring-pastel-pink/50 text-ink" autoFocus
          />
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-ink-light font-sans hover:text-pastel-pink transition-colors py-1">
            <Calendar className="w-3.5 h-3.5" />
            {day.date ? formatDateFull(day.date, lang) : day.dateLabel}
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      {canDelete && (
        <button onClick={onDelete} className="flex items-center gap-1 text-xs font-bold text-ink-light hover:text-red-400 transition-colors py-1 px-2 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" />{t('deleteDay')}
        </button>
      )}
    </div>
  );
}

function ActivityCard({ act, onRemove, t }: { act: Activity; onRemove: () => void; t: TFn }) {
  const hasDirections = act.lat !== undefined && act.lng !== undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative group w-full">
      <div className="absolute -left-[32px] sm:-left-[44px] top-4 w-[22px] h-[22px] rounded-full border-4 border-pastel-cream bg-pastel-mint shadow-sm z-10 box-border flex items-center justify-center" />
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-pastel-yellow/10 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-pastel-pink font-bold text-xs font-mono uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />{act.time}
          </div>
          <button onClick={onRemove} className="text-ink-light opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:text-pastel-pink p-1 bg-pastel-cream rounded-full">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="font-sans font-bold text-ink text-[15px] sm:text-base break-words pr-2">{act.title}</p>
        {act.location && (
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="font-sans text-xs text-ink-light truncate flex-1">{act.location}</p>
            {hasDirections && (
              <button onClick={() => openDirections(act.lat!, act.lng!)} className="flex items-center gap-1 text-xs font-bold text-pastel-pink hover:text-ink-light transition-colors bg-pastel-pink/10 px-2.5 py-1 rounded-full shrink-0">
                <Navigation className="w-3 h-3" />{t('directions')}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MapToggle({ activities, dayLabel, t }: { activities: Activity[]; dayLabel: string; t: TFn }) {
  const [open, setOpen] = useState(false);
  const count = activities.filter(a => a.lat !== undefined && a.lng !== undefined).length;
  if (count === 0) return null;

  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border-2 border-pastel-cream shadow-sm hover:border-pastel-pink/30 transition-colors">
        <span className="font-sans font-bold text-xs text-ink-light">{t('mapStops', { count })}</span>
        <ChevronDown className={`w-4 h-4 text-ink-light transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-2">
          <ItineraryMapView activities={activities} dayLabel={dayLabel} />
        </div>
      )}
    </div>
  );
}

function DaySelector({ days, activeId, onSelect, onAdd, lang }: {
  days: ItineraryDay[]; activeId: string | null; onSelect: (id: string) => void; onAdd: () => void; lang: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x px-1">
      {days.map((day) => (
        <button key={day.id} onClick={() => onSelect(day.id)}
          className={`whitespace-nowrap px-6 py-3 rounded-2xl font-display font-bold text-sm transition-all shadow-sm shrink-0 snap-start ${activeId === day.id ? "bg-pastel-pink text-white" : "bg-white text-ink-light border-2 border-pastel-cream"}`}>
          {day.date ? formatDateShort(day.date, lang) : day.dateLabel}
        </button>
      ))}
      <button onClick={onAdd} className="flex items-center justify-center w-12 h-12 bg-pastel-cream rounded-2xl text-ink-light hover:bg-pastel-yellow transition-colors shrink-0 snap-start">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

function DayContent({ day, canDelete, onDateChange, onDelete, onAddActivity, onRemoveActivity, t, lang }: {
  day: ItineraryDay; canDelete: boolean; onDateChange: (d: string) => void; onDelete: () => void;
  onAddActivity: (time: string, title: string, location?: string, lat?: number, lng?: number) => void;
  onRemoveActivity: (id: string) => void; t: TFn; lang: string;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const dayLabel = day.date ? formatDateFull(day.date, lang) : day.dateLabel;
  const shortLabel = day.date ? formatDateShort(day.date, lang) : day.dateLabel;

  return (
    <div className="flex flex-col w-full">
      <DayHeader day={day} canDelete={canDelete} onDateChange={onDateChange} onDelete={onDelete} t={t} lang={lang} />
      <MapToggle activities={day.activities} dayLabel={dayLabel} t={t} />
      {day.activities.length === 0 ? (
        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-pastel-cream text-center text-ink-light font-sans text-sm pb-10 flex flex-col items-center justify-center gap-3 mt-2">
          <div className="w-14 h-14 bg-pastel-cream/50 rounded-full flex items-center justify-center mb-1"><Calendar className="w-6 h-6 text-pastel-pink/70" /></div>
          {t('noPlansYet')} {shortLabel}.
        </div>
      ) : (
        <div className="relative pl-7 sm:pl-10 mt-2">
          <div className="absolute left-[9px] sm:left-[13px] top-6 bottom-4 w-1 bg-pastel-cream rounded-full" />
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {day.activities.map(act => <ActivityCard key={act.id} act={act} onRemove={() => onRemoveActivity(act.id)} t={t} />)}
            </AnimatePresence>
          </div>
        </div>
      )}
      {isAdding ? (
        <ActivityForm onSave={(time, title, loc, lat, lng) => { onAddActivity(time, title, loc, lat, lng); setIsAdding(false); }} onCancel={() => setIsAdding(false)} t={t} />
      ) : (
        <button onClick={() => setIsAdding(true)} className="mt-4 bg-pastel-cream border-2 border-dashed border-ink-light/20 text-ink-light font-bold py-4 rounded-3xl flex items-center justify-center gap-2 font-sans hover:bg-pastel-yellow/30 transition-colors w-full"><Plus className="w-5 h-5" /> {t('addPlan')}</button>
      )}
    </div>
  );
}

export default function ItineraryTab({ trip, updateTrip }: { trip: Trip; updateTrip: (trip: Trip) => void }) {
  const { t, lang } = useLanguage();
  const [activeDayId, setActiveDayId] = useState<string | null>(trip.itinerary[0]?.id || null);
  const { undoDay, scheduleDelete, undo, dismiss: dismissUndo } = useUndoDay(trip, updateTrip, setActiveDayId);

  const handleAddDay = () => {
    dismissUndo();
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    const nextDate = lastDay?.date ? addDays(lastDay.date, 1) : todayStr();
    const id = crypto.randomUUID();
    updateTrip({ ...trip, itinerary: [...trip.itinerary, { id, dateLabel: t('dayLabel', { number: trip.itinerary.length + 1 }), date: nextDate, activities: [] }] });
    setActiveDayId(id);
  };

  const handleDateChange = (dateStr: string) => {
    dismissUndo();
    if (!activeDayId || !dateStr) return;
    updateTrip({ ...trip, itinerary: trip.itinerary.map(day => day.id === activeDayId ? { ...day, date: dateStr } : day) });
  };

  const handleAddActivity = (time: string, title: string, location?: string, lat?: number, lng?: number) => {
    dismissUndo();
    if (!activeDayId) return;
    updateTrip({ ...trip, itinerary: trip.itinerary.map(day => day.id === activeDayId ? { ...day, activities: sortByTime([...day.activities, { id: crypto.randomUUID(), title, time, location, lat, lng }]) } : day) });
    triggerDopamine();
  };

  const removeActivity = (activityId: string) => {
    updateTrip({ ...trip, itinerary: trip.itinerary.map(day => day.id === activeDayId ? { ...day, activities: day.activities.filter(a => a.id !== activityId) } : day) });
  };

  const activeDay = trip.itinerary.find(d => d.id === activeDayId);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-12">
      <DaySelector days={trip.itinerary} activeId={activeDayId} onSelect={setActiveDayId} onAdd={handleAddDay} lang={lang} />
      {activeDay && (
        <DayContent day={activeDay} canDelete={trip.itinerary.length > 1} onDateChange={handleDateChange}
          onDelete={() => scheduleDelete(activeDay.id)} onAddActivity={handleAddActivity} onRemoveActivity={removeActivity} t={t} lang={lang} />
      )}
      <AnimatePresence>
        {undoDay && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-ink text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-sans text-sm">
            <span>{t('dayDeleted')}</span>
            <button onClick={undo} className="flex items-center gap-1 font-bold text-pastel-yellow hover:text-pastel-mint transition-colors"><Undo2 className="w-3.5 h-3.5" />{t('undo')}</button>
            <button onClick={dismissUndo} className="text-white/40 hover:text-white/70 transition-colors ml-1"><Plus className="w-4 h-4 rotate-45" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
