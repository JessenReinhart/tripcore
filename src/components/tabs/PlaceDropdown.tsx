import type { PlaceSuggestion } from "../../lib/geocode";

type Props = {
  results: PlaceSuggestion[];
  isOpen: boolean;
  isSearching: boolean;
  queryLength: number;
  onSelect: (place: PlaceSuggestion) => void;
  noResultsText: string;
};

export default function PlaceDropdown({ results, isOpen, isSearching, queryLength, onSelect, noResultsText }: Props) {
  if (!isOpen) return null;

  if (results.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border-2 border-pastel-cream overflow-hidden z-50 max-h-48 overflow-y-auto">
        {results.map((place, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(place)}
            className="w-full text-left px-4 py-3 hover:bg-pastel-cream transition-colors border-b border-pastel-cream last:border-b-0"
          >
            <span className="text-sm text-ink font-sans">{place.displayName}</span>
          </button>
        ))}
      </div>
    );
  }

  if (!isSearching && queryLength >= 2) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border-2 border-pastel-cream p-4 text-center z-50">
        <span className="text-xs text-ink-light font-sans">{noResultsText}</span>
      </div>
    );
  }

  return null;
}
