import { useState, useEffect, useRef } from "react";
import { searchPlaces, type PlaceSuggestion } from "../../lib/geocode";

type Props = {
  onSelect: (place: PlaceSuggestion) => void;
  t: (key: string) => string;
};

export default function LocationSearchInput({ onSelect, t }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDisplayName, setSelectedDisplayName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const places = await searchPlaces(query);
      setResults(places);
      setIsOpen(places.length > 0);
      setIsSearching(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceSuggestion) => {
    setSelectedDisplayName(place.displayName);
    setQuery("");
    setIsOpen(false);
    setResults([]);
    onSelect(place);
  };

  const clearSelection = () => {
    setSelectedDisplayName("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {selectedDisplayName ? (
        <div className="flex items-center gap-2 bg-pastel-mint/30 px-4 py-3 rounded-xl">
          <span className="text-sm text-ink truncate flex-1">{selectedDisplayName}</span>
          <button type="button" onClick={clearSelection} className="text-ink-light hover:text-pastel-pink shrink-0 text-xs font-bold">
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('searchLocation')}
            className="bg-pastel-cream border-none px-4 py-3 rounded-xl font-sans text-sm focus:ring-2 focus:ring-pastel-pink/50 outline-none w-full"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-pastel-pink/30 border-t-pastel-pink rounded-full animate-spin" />
            </div>
          )}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border-2 border-pastel-cream overflow-hidden z-50 max-h-48 overflow-y-auto">
              {results.map((place, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="w-full text-left px-4 py-3 hover:bg-pastel-cream transition-colors border-b border-pastel-cream last:border-b-0"
                >
                  <span className="text-sm text-ink font-sans">{place.displayName}</span>
                </button>
              ))}
            </div>
          )}
          {isOpen && results.length === 0 && !isSearching && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border-2 border-pastel-cream p-4 text-center z-50">
              <span className="text-xs text-ink-light font-sans">{t('noLocationResults')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
