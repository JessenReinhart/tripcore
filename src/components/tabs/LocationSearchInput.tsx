import type { PlaceSuggestion } from "../../lib/geocode";
import { usePlaceSearch } from "./usePlaceSearch";
import PlaceDropdown from "./PlaceDropdown";

type Props = {
  onSelect: (place: PlaceSuggestion) => void;
  initialLocation?: string;
  t: (key: string) => string;
};

export default function LocationSearchInput({ onSelect, initialLocation, t }: Props) {
  const {
    query, setQuery,
    results,
    isOpen,
    isSearching,
    selectedDisplayName,
    containerRef,
    handleSelect,
    clearSelection,
  } = usePlaceSearch(initialLocation);

  const handlePlaceSelect = (place: PlaceSuggestion) => {
    handleSelect(place);
    onSelect(place);
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
          <PlaceDropdown
            results={results}
            isOpen={isOpen}
            isSearching={isSearching}
            queryLength={query.length}
            onSelect={handlePlaceSelect}
            noResultsText={t('noLocationResults')}
          />
        </div>
      )}
    </div>
  );
}
