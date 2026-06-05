import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { PlaceSuggestion } from "../../lib/geocode";
import LocationSearchInput from "./LocationSearchInput";

type Props = {
  onSave: (time: string, title: string, location?: string, lat?: number, lng?: number) => void;
  onCancel: () => void;
  t: (key: string) => string;
  initialTime?: string;
  initialTitle?: string;
  initialLocation?: string;
  initialLat?: number;
  initialLng?: number;
};

export default function ActivityForm({ onSave, onCancel, t, initialTime, initialTitle, initialLocation, initialLat, initialLng }: Props) {
  const isEditing = initialTime !== undefined;
  const [time, setTime] = useState(initialTime ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(() => {
    if (initialLocation && initialLat !== undefined && initialLng !== undefined) {
      return { displayName: initialLocation, lat: initialLat, lng: initialLng };
    }
    return null;
  });

  useEffect(() => {
    if (initialTime !== undefined) setTime(initialTime);
    if (initialTitle !== undefined) setTitle(initialTitle);
    if (initialLocation && initialLat !== undefined && initialLng !== undefined) {
      setSelectedPlace({ displayName: initialLocation, lat: initialLat, lng: initialLng });
    }
  }, [initialTime, initialTitle, initialLocation, initialLat, initialLng]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) return;
    onSave(
      time,
      title,
      selectedPlace?.displayName,
      selectedPlace?.lat,
      selectedPlace?.lng
    );
    setTitle("");
    setTime("");
    setSelectedPlace(null);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-3xl border-2 border-pastel-pink/20 flex flex-col gap-3 shadow-md mt-4 relative overflow-hidden w-full"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-display font-bold text-sm text-ink text-opacity-50 uppercase tracking-widest">{isEditing ? t('editPlanTitle') : t('newPlanTitle')}</span>
        <button type="button" onClick={onCancel} className="text-ink-light bg-pastel-cream p-1.5 rounded-full hover:text-ink transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="flex items-center gap-2 bg-pastel-cream px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-pastel-pink/50 w-full sm:w-auto">
          <span className="text-xs text-ink-light font-sans">{t('timeLabel')}</span>
          <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="bg-transparent text-sm font-bold font-mono outline-none text-ink" />
        </label>
        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder={t('planPlaceholder')} className="bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none w-full flex-1" autoFocus />
      </div>
      <LocationSearchInput
        onSelect={setSelectedPlace}
        initialLocation={initialLocation}
        t={t}
      />
      <button type="submit" className="bg-ink text-white font-bold py-3.5 rounded-xl text-sm mt-1 shadow-md hover:shadow-lg transition-shadow bg-opacity-90 active:scale-95">{isEditing ? t('updatePlan') : t('addToTimeline')}</button>
    </motion.form>
  );
}
